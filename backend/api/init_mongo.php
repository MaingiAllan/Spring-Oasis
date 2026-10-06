<?php
header("Content-Type: application/json; charset=UTF-8");
try {
    require_once '../vendor/autoload.php';
    include_once '../config/Database.php';
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) { throw new Exception("MongoDB connection failed"); }
    $users = $db->users;
    $existing = $users->countDocuments(['username' => 'headteacher']);
    if ($existing > 0) {
        echo json_encode(["success" => true, "message" => "Users already exist"]);
        exit();
    }
    $users->insertMany([
        ['username' => 'headteacher', 'email' => 'head@springoasis.edu', 'password_hash' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'headteacher', 'first_name' => 'Sarah', 'last_name' => 'Johnson', 'phone' => '+1234567890', 'created_at' => new MongoDB\BSON\UTCDateTime(), 'is_active' => true],
        ['username' => 'teacher1', 'email' => 'teacher1@springoasis.edu', 'password_hash' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'teacher', 'first_name' => 'Michael', 'last_name' => 'Brown', 'phone' => '+1234567891', 'created_at' => new MongoDB\BSON\UTCDateTime(), 'is_active' => true],
        ['username' => 'student1', 'email' => 'student1@springoasis.edu', 'password_hash' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'student', 'first_name' => 'Emma', 'last_name' => 'Wilson', 'phone' => '+1234567892', 'created_at' => new MongoDB\BSON\UTCDateTime(), 'is_active' => true]
    ]);
    echo json_encode(["success" => true, "message" => "Users created successfully!", "credentials" => ["headteacher" => "password123", "teacher1" => "password123", "student1" => "password123"]], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
