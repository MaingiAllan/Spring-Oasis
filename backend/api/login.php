<?php
header("Content-Type: application/json; charset=UTF-8");
$http_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($http_origin === 'http://localhost:3000' || $http_origin === 'http://localhost:5173') {
    header("Access-Control-Allow-Origin: $http_origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:3000");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
try {
    require_once '../vendor/autoload.php';
    include_once '../config/Database.php';
    include_once '../models/User.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Server error: " . $e->getMessage()));
    exit();
}
$database = new Database();
$db = $database->getConnection();
if ($db === null) {
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Database connection failed"));
    exit();
}
$user = new User($db);
$data = json_decode(file_get_contents("php://input"));
if(!empty($data->username) && !empty($data->password)) {
    $user->username = $data->username;
    if($user->login() && password_verify($data->password, $user->password_hash)) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login successful",
            "user_id" => $user->id,
            "username" => $user->username,
            "role" => $user->role,
            "first_name" => $user->first_name,
            "last_name" => $user->last_name
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => "Login failed. Invalid credentials."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Username and password required"));
}
?>
