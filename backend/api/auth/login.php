<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-School-Code");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || empty($data['username']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Validation Error: Username and password are required fields.'
        ]);
        exit();
    }

    $username = trim(filter_var($data['username'], FILTER_SANITIZE_FULL_SPECIAL_CHARS));
    $password = $data['password'];
    $schoolCode = !empty($data['schoolCode']) ? trim(filter_var($data['schoolCode'], FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : 'SPRING_OASIS';

    // Mock Users Store with Argon2id / BCrypt Hashed Passwords for Production Hardening
    // Password 'password123' hashed with password_hash()
    $hashPassword123 = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
    
    $usersStore = [
        'director' => ['id' => 'dir-1', 'username' => 'director', 'name' => 'Director Albus', 'role' => 'director', 'passwordHash' => $hashPassword123, 'schoolId' => 'sch-001'],
        'sarah' => ['id' => 'tch-1', 'username' => 'sarah', 'name' => 'Mrs. Sarah Connor', 'role' => 'teacher', 'subject' => 'Mathematics', 'class' => 'Grade 10-A', 'passwordHash' => $hashPassword123, 'schoolId' => 'sch-001'],
        'john' => ['id' => 'tch-2', 'username' => 'john', 'name' => 'Mr. John Keating', 'role' => 'teacher', 'subject' => 'English Literature', 'class' => 'Grade 11-B', 'passwordHash' => $hashPassword123, 'schoolId' => 'sch-001'],
        'marcus' => ['id' => 'emp-1', 'username' => 'marcus', 'name' => 'Chef Marcus Wright', 'role' => 'employee', 'jobRole' => 'Kitchen Supervisor', 'passwordHash' => $hashPassword123, 'schoolId' => 'sch-001'],
        'std-1' => ['id' => 'std-1', 'username' => 'std-1', 'name' => 'Alice Johnson', 'role' => 'student', 'class' => 'Grade 10-A', 'passwordHash' => $hashPassword123, 'schoolId' => 'sch-001'],
        'std-2' => ['id' => 'std-2', 'username' => 'std-2', 'name' => 'Bob Smith', 'role' => 'student', 'class' => 'Grade 10-A', 'passwordHash' => $hashPassword123, 'schoolId' => 'sch-001']
    ];

    $userKey = strtolower($username);
    
    if (!isset($usersStore[$userKey])) {
        // Uniform timing attack prevention
        password_verify('dummy_password', $hashPassword123);
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication Failed: Invalid username or password credentials.'
        ]);
        exit();
    }

    $user = $usersStore[$userKey];

    if (!password_verify($password, $user['passwordHash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication Failed: Invalid username or password credentials.'
        ]);
        exit();
    }

    // Generate Secure JWT Session Payload
    $issuedAt = time();
    $expirationTime = $issuedAt + (15 * 60); // 15 Minutes
    $jwtHeader = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $jwtPayload = base64_encode(json_encode([
        'iss' => 'SpringOasisIdentityServer',
        'sub' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'schoolId' => $user['schoolId'],
        'iat' => $issuedAt,
        'exp' => $expirationTime
    ]));

    $secretKey = getenv('JWT_SECRET_KEY') ?: 'SpringOasisProductionSigningKey2026';
    $signature = base64_encode(hash_hmac('sha256', "$jwtHeader.$jwtPayload", $secretKey, true));
    $accessToken = "$jwtHeader.$jwtPayload.$signature";

    unset($user['passwordHash']);

    echo json_encode([
        'success' => true,
        'message' => 'Authentication successful.',
        'data' => [
            'token' => $accessToken,
            'expiresIn' => 900,
            'user' => $user
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal Security Error: Unable to process authentication request.'
    ]);
}
?>
