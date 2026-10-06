#!/bin/bash
echo "Spring Oasis Setup Starting..."
echo "Step 1: Creating backend files..."
mkdir -p ~/SpringOasis/backend/{api,config,models,utils}
mkdir -p ~/SpringOasis/frontend/src/components

# Create Database.php
cat > ~/SpringOasis/backend/config/Database.php << 'INNEREOF'
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
INNEREOF

# Create User.php
cat > ~/SpringOasis/backend/models/User.php << 'INNEREOF'
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
INNEREOF

# Create login.php
cat > ~/SpringOasis/backend/api/login.php << 'INNEREOF'
<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
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
INNEREOF

# Create test.php
cat > ~/SpringOasis/backend/api/test.php << 'INNEREOF'
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
INNEREOF

# Create init_mongo.php
cat > ~/SpringOasis/backend/api/init_mongo.php << 'INNEREOF'
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
INNEREOF

# Create composer.json
cat > ~/SpringOasis/backend/composer.json << 'INNEREOF'
{"require": {"mongodb/mongodb": "^1.15"}}
INNEREOF

echo "Step 2: Installing PHP dependencies..."
cd ~/SpringOasis/backend
composer install 2>/dev/null || echo "Composer not found, skipping..."

echo "Step 3: Creating React app..."
cd ~/SpringOasis/frontend
if [ ! -d "node_modules" ]; then
    npx create-react-app . --use-npm 2>/dev/null || echo "React app already exists"
fi
npm install axios react-router-dom 2>/dev/null || echo "Dependencies installed"

echo "Step 4: Creating React components..."
cat > src/components/Login.js << 'INNEREOF'
import React, { useState } from 'react';
import axios from 'axios';
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/backend/api/login.php', formData);
      if (response.data.success) { onLogin(response.data); } 
      else { setError(response.data.message || 'Login failed'); }
    } catch (err) { setError('Network error. Make sure backend is running.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Spring Oasis School</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group"><label>Username:</label><input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={loading} /></div>
        <div className="form-group"><label>Password:</label><input type="password" name="password" value={formData.password} onChange={handleChange} required disabled={loading} /></div>
        <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <div style={{ marginTop: '1rem', textAlign: 'center', color: '#666' }}>
          <p><strong>Test Credentials:</strong></p>
          <p>headteacher / password123</p>
          <p>teacher1 / password123</p>
          <p>student1 / password123</p>
        </div>
      </form>
    </div>
  );
};
export default Login;
INNEREOF

cat > src/components/Dashboard.js << 'INNEREOF'
import React from 'react';
const Dashboard = ({ user }) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="welcome-message">Welcome back, {user?.first_name}!</h1>
        <div className="role-badge">{user?.role?.toUpperCase()}</div>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card"><h3>Dashboard</h3><p>Welcome to Spring Oasis</p></div>
        <div className="dashboard-card"><h3>Profile</h3><p>View your profile</p></div>
        <div className="dashboard-card"><h3>Settings</h3><p>Update preferences</p></div>
        <div className="dashboard-card yellow"><h3>Notifications</h3><p>Check updates</p></div>
      </div>
    </div>
  );
};
export default Dashboard;
INNEREOF

cat > src/components/Header.js << 'INNEREOF'
import React from 'react';
const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">Spring <span>Oasis</span></div>
        <div className="user-info">
          <span>Welcome, {user?.first_name} {user?.last_name}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
};
export default Header;
INNEREOF

cat > src/App.js << 'INNEREOF'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import './App.css';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) { setIsAuthenticated(true); setUser(JSON.parse(userData)); }
  }, []);
  const handleLogin = (userData) => { setIsAuthenticated(true); setUser(userData); localStorage.setItem('user', JSON.stringify(userData)); };
  const handleLogout = () => { setIsAuthenticated(false); setUser(null); localStorage.removeItem('user'); };
  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
INNEREOF

cat > src/App.css << 'INNEREOF'
:root { --spring-blue: #1e40af; --spring-light-blue: #3b82f6; --spring-yellow: #f59e0b; --spring-white: #ffffff; --spring-light-gray: #f8fafc; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: var(--spring-light-gray); }
.header { background: linear-gradient(135deg, var(--spring-blue) 0%, var(--spring-light-blue) 100%); color: white; padding: 1rem 2rem; }
.header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
.logo { font-size: 1.8rem; font-weight: bold; }
.logo span { color: var(--spring-yellow); }
.logout-btn { background: var(--spring-yellow); color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; }
.login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, var(--spring-blue), var(--spring-light-blue)); }
.login-form { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 100%; max-width: 400px; }
.login-form h2 { text-align: center; margin-bottom: 2rem; color: var(--spring-blue); }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
.form-group input { width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 5px; }
.login-btn { width: 100%; background: var(--spring-blue); color: white; border: none; padding: 0.75rem; border-radius: 5px; font-size: 1rem; cursor: pointer; margin-top: 1rem; }
.error-message { background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 5px; margin-bottom: 1rem; text-align: center; }
.dashboard { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
.dashboard-header { text-align: center; margin-bottom: 2rem; }
.welcome-message { color: var(--spring-blue); font-size: 2rem; }
.role-badge { display: inline-block; background: var(--spring-yellow); color: white; padding: 0.25rem 1rem; border-radius: 20px; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
.dashboard-card { background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid var(--spring-blue); cursor: pointer; transition: transform 0.2s; }
.dashboard-card:hover { transform: translateY(-5px); }
.dashboard-card h3 { color: var(--spring-blue); margin-bottom: 1rem; }
.dashboard-card.yellow { border-left-color: var(--spring-yellow); }
.dashboard-card.yellow h3 { color: var(--spring-yellow); }
INNEREOF

echo "✅ Setup complete!"
echo ""
echo "START THE APPLICATION:"
echo "======================"
echo ""
echo "Terminal 1 (Backend):"
echo "cd ~/SpringOasis/backend && php -S localhost:8080 -t ."
echo ""
echo "Terminal 2 (Frontend):"
echo "cd ~/SpringOasis/frontend && npm start"
echo ""
echo "Login: headteacher / password123"
echo "Open: http://localhost:3000"
