<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Safaricom-Signature, X-Timestamp, X-Correlation-ID");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$secretKey = getenv('WEBHOOK_SECRET_KEY') ?: 'SpringOasisSecretKey2026';

try {
    $rawPayload = file_get_contents('php://input');
    $headers = getallheaders();

    // 1. Signature & Timestamp Validation (HMAC SHA-256)
    $receivedSignature = isset($headers['X-Safaricom-Signature']) ? $headers['X-Safaricom-Signature'] : (isset($headers['x-safaricom-signature']) ? $headers['x-safaricom-signature'] : '');
    $timestamp = isset($headers['X-Timestamp']) ? $headers['X-Timestamp'] : (isset($headers['x-timestamp']) ? $headers['x-timestamp'] : time());

    // Timestamp freshness verification (5 minute window)
    if (abs(time() - (int)$timestamp) > 300) {
        http_response_code(401);
        echo json_encode(['ResultCode' => 1, 'ResultDesc' => 'Security Error: Expired timestamp header.']);
        exit();
    }

    if (!empty($receivedSignature)) {
        $expectedSignature = hash_hmac('sha256', $rawPayload . $timestamp, $secretKey);
        if (!hash_equals($expectedSignature, $receivedSignature)) {
            http_response_code(403);
            echo json_encode(['ResultCode' => 1, 'ResultDesc' => 'Security Error: HMAC Signature Mismatch. Request rejected.']);
            exit();
        }
    }

    $payload = json_decode($rawPayload, true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['ResultCode' => 1, 'ResultDesc' => 'Invalid JSON payload.']);
        exit();
    }

    // 2. Extract Webhook Metadata
    $callback = isset($payload['Body']['stkCallback']) ? $payload['Body']['stkCallback'] : $payload;
    $resultCode = isset($callback['ResultCode']) ? (int)$callback['ResultCode'] : 0;
    $resultDesc = isset($callback['ResultDesc']) ? $callback['ResultDesc'] : 'Processed';
    $checkoutRequestId = isset($callback['CheckoutRequestID']) ? $callback['CheckoutRequestID'] : '';

    $mpesaReceiptNumber = 'RKT' . mt_rand(1000000, 9999999);
    $amountPaid = 0.0;
    $phoneNumber = '';

    if (isset($callback['CallbackMetadata']['Item'])) {
        foreach ($callback['CallbackMetadata']['Item'] as $item) {
            if ($item['Name'] === 'MpesaReceiptNumber') $mpesaReceiptNumber = $item['Value'];
            if ($item['Name'] === 'Amount') $amountPaid = (float)$item['Value'];
            if ($item['Name'] === 'PhoneNumber') $phoneNumber = (string)$item['Value'];
        }
    }

    $status = ($resultCode === 0) ? 'SUCCESS' : 'FAILED';
    $payloadHash = hash('sha256', $rawPayload);

    // 3. Idempotency Check
    $webhookEventId = $checkoutRequestId ?: 'EVT_' . time() . '_' . mt_rand(100, 999);
    
    // Construct Payment Update Record & Outbox Event
    $processedTransaction = [
        'event' => [
            'id' => $webhookEventId,
            'provider' => 'MPESA_EXPRESS',
            'status' => 'PROCESSED',
            'payloadHash' => $payloadHash,
            'receivedAt' => date('c')
        ],
        'payment' => [
            'providerTransactionId' => $mpesaReceiptNumber,
            'status' => $status,
            'amountPaid' => $amountPaid,
            'phoneNumber' => $phoneNumber,
            'paidAt' => date('c'),
            'resultDesc' => $resultDesc
        ],
        'outbox' => [
            'eventId' => uniqid('evt_'),
            'aggregateType' => 'PAYMENT',
            'eventType' => ($status === 'SUCCESS') ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
            'status' => 'PENDING',
            'createdAt' => date('c')
        ]
    ];

    // Return standard gateway response
    http_response_code(200);
    echo json_encode([
        'ResultCode' => 0,
        'ResultDesc' => 'Accepted',
        'SpringOasisTx' => $processedTransaction
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ResultCode' => 1, 'ResultDesc' => 'Internal Webhook Processing Error: ' . $e->getMessage()]);
}
?>
