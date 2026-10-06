<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
try {
    require_once '../vendor/autoload.php';
    include_once '../config/Database.php';
    $database = new Database();
    $db = $database->getConnection();
    $response = [
        "success" => true,
        "message" => "Spring Oasis Backend is working!",
        "timestamp" => date('Y-m-d H:i:s'),
        "database" => $db ? "MongoDB connected" : "MongoDB connection failed",
        "mongodb_extension" => extension_loaded('mongodb') ? "Loaded" : "Not loaded"
    ];
} catch (Exception $e) {
    $response = ["success" => false, "message" => "Error: " . $e->getMessage()];
}
echo json_encode($response, JSON_PRETTY_PRINT);
?>
