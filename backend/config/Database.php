<?php
require_once '../vendor/autoload.php';
class Database {
    private $connection_string = "mongodb://localhost:27017";
    private $db_name = "spring_oasis";
    public $conn;
    public function getConnection() {
        try {
            $this->conn = new MongoDB\Client($this->connection_string);
            return $this->conn->selectDatabase($this->db_name);
        } catch (Exception $e) {
            error_log("MongoDB connection error: " . $e->getMessage());
            return null;
        }
    }
}
?>
