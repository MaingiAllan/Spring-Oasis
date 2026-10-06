<?php
class User {
    private $db;
    private $collection;
    public $id;
    public $username;
    public $email;
    public $password_hash;
    public $role;
    public $first_name;
    public $last_name;
    public $phone;
    public $is_active;
    public function __construct($db) {
        $this->db = $db;
        $this->collection = $db->users;
    }
    public function login() {
        try {
            $filter = ['username' => $this->username, 'is_active' => true];
            $user = $this->collection->findOne($filter);
            if ($user) {
                $this->id = (string)$user['_id'];
                $this->username = $user['username'];
                $this->email = $user['email'];
                $this->password_hash = $user['password_hash'];
                $this->role = $user['role'];
                $this->first_name = $user['first_name'];
                $this->last_name = $user['last_name'];
                $this->phone = $user['phone'] ?? '';
                return true;
            }
            return false;
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return false;
        }
    }
}
?>
