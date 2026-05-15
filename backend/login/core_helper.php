<?php
    /* =====================================================
    CORE CONFIG & HEADERS
    ===================================================== */
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);
    date_default_timezone_set('Asia/Bangkok');

    try {
        include __DIR__ . '/../db/db.php';
    } catch(PDOException $e){
        sendResponse(500, "Database Connection Error");
    }

    /* =====================================================
    CORE HELPERS
    ===================================================== */
    function sendResponse($status, $detail, $data = null) {
        http_response_code($status == 200 ? 200 : $status);
        echo json_encode([
            'status' => ($status == 200 ? 1 : 0),
            'detail' => $detail,
            'data'   => $data
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /* =====================================================
    ROUTER LOGIC (URL Segments)
    ===================================================== */
    $path     = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $segments = explode('/', trim($path, '/'));
    $method   = $_SERVER['REQUEST_METHOD'];

    function getAction($fileName) {
        global $segments;

        foreach ($segments as $i => $seg) {
            if ($seg === $fileName || $seg === $fileName . '.php') {
                return [
                    'action' => $segments[$i + 1] ?? null,
                    'id'     => $segments[$i + 2] ?? null
                ];
            }
        }

        return [
            'action' => null,
            'id' => null
        ];
    }


    /* =====================================================
    File BASE
    ===================================================== */
    $base_dir = "D:/Storage_MMA_TE/WebAppData/DataFile/spare/";

    $host       = $_SERVER['HTTP_HOST'];
    $web_base   = "http://".$host."/web_upload/spare/";



    /* =====================================================
    HELPER: response (Alias for sendResponse)
    ===================================================== */
    function response($status, $detail, $data = null) {
        sendResponse($status, $detail, $data);
    }

    /* =====================================================
    HELPER: requestData (Get POST/JSON data)
    ===================================================== */
    /* =====================================================
    SECURITY: Token System (HMAC Signing)
    ===================================================== */
    define('AUTH_SECRET', 'MMA_SECRET_KEY_@2026'); // กุญแจลับสำหรับเซ็นชื่อ

    function generateAuthToken($userData) {
        $payload = base64_encode(json_encode([
            'user' => $userData,
            'iat'  => time(),
            'exp'  => time() + 3600 // หมดอายุใน 1 ชม.
        ]));
        $signature = hash_hmac('sha256', $payload, AUTH_SECRET);
        return $payload . '.' . $signature;
    }

    function verifyAuthToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 2) return false;

        $payload = $parts[0];
        $signature = $parts[1];

        // ตรวจสอบลายเซ็น
        $validSignature = hash_hmac('sha256', $payload, AUTH_SECRET);
        if ($signature !== $validSignature) return false;

        $data = json_decode(base64_decode($payload), true);
        
        // ตรวจสอบวันหมดอายุ
        if ($data['exp'] < time()) return false;

        return $data['user'];
    }

    function requestData() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        return array_merge($_POST, (array)$data);
    }

?>