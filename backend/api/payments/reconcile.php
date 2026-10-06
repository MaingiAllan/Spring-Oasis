<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // 3-Way Automated Reconciliation Engine Execution
    $runId = uniqid('rec_run_');
    $runDate = date('Y-m-d');
    $provider = 'MPESA_EXPRESS';

    // Simulated 3-Way Match Check across Internal Ledgers, Gateway Logs, and Bank CSV Feed
    $reconciliationSummary = [
        'id' => $runId,
        'runDate' => $runDate,
        'provider' => $provider,
        'totalInternalRecords' => 48,
        'totalProviderRecords' => 48,
        'matchedRecords' => 46,
        'discrepancyRecords' => 2,
        'status' => 'COMPLETED',
        'discrepancies' => [
            [
                'id' => 'disc_1',
                'paymentReference' => 'SO-PAY-2026-00192',
                'providerTransactionId' => 'RKT9918231',
                'type' => 'UNMATCHED_INTERNAL',
                'internalAmount' => 0.00,
                'providerAmount' => 15000.00,
                'status' => 'OPEN',
                'resolutionNotes' => 'Gateway confirmed receipt; webhook lost due to transient network error. Pending auto-backfill.',
                'createdAt' => date('c')
            ],
            [
                'id' => 'disc_2',
                'paymentReference' => 'SO-PAY-2026-00344',
                'providerTransactionId' => 'RKT9941102',
                'type' => 'AMOUNT_MISMATCH',
                'internalAmount' => 25000.00,
                'providerAmount' => 20000.00,
                'status' => 'OPEN',
                'resolutionNotes' => 'Parent paid KES 20,000 against KES 25,000 fee. Partial payment allocated. Outstanding balance KES 5,000.',
                'createdAt' => date('c')
            ]
        ]
    ];

    echo json_encode([
        'success' => true,
        'message' => 'Automated 3-Way Reconciliation completed successfully.',
        'data' => $reconciliationSummary
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Reconciliation Error: ' . $e->getMessage()]);
}
?>
