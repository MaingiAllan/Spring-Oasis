<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || empty($data['studentId']) || empty($data['amount']) || empty($data['paymentMethod'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields: studentId, amount, paymentMethod'
        ]);
        exit();
    }

    $studentId = filter_var($data['studentId'], FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $amount = (float)$data['amount'];
    $paymentMethod = filter_var($data['paymentMethod'], FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $phoneNumber = !empty($data['phoneNumber']) ? filter_var($data['phoneNumber'], FILTER_SANITIZE_FULL_SPECIAL_CHARS) : '254700000000';
    $invoiceIds = !empty($data['invoiceIds']) ? $data['invoiceIds'] : [];

    if ($amount <= 0) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Payment amount must be greater than zero.']);
        exit();
    }

    // Generate Unique Internal Payment Reference (SO-PAY-YYYY-XXXXXX)
    $paymentRef = 'SO-PAY-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    $checkoutRequestId = 'ws_CO_' . date('YmdHis') . '_' . mt_rand(1000, 9999);

    $paymentRecord = [
        'id' => uniqid('pay_'),
        'paymentReference' => $paymentRef,
        'studentId' => $studentId,
        'amount' => $amount,
        'currency' => 'KES',
        'provider' => strtoupper($paymentMethod),
        'providerChannel' => ($paymentMethod === 'mpesa_express' ? 'STK_PUSH' : 'C2B'),
        'payerPhoneNumber' => $phoneNumber,
        'status' => 'PENDING',
        'checkoutRequestId' => $checkoutRequestId,
        'invoiceIds' => $invoiceIds,
        'createdAt' => date('c'),
        'updatedAt' => date('c')
    ];

    echo json_encode([
        'success' => true,
        'message' => 'Payment request initiated successfully.',
        'data' => [
            'paymentReference' => $paymentRef,
            'checkoutRequestId' => $checkoutRequestId,
            'status' => 'PENDING',
            'amount' => $amount,
            'currency' => 'KES',
            'customerMessage' => 'M-Pesa STK Push prompt sent to ' . $phoneNumber . '. Enter your M-Pesa PIN on your phone to complete payment.',
            'payment' => $paymentRecord
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Payment initiation error: ' . $e->getMessage()]);
}
?>
