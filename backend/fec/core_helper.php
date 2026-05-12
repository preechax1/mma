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
        $baseIndex = array_search($fileName . '.php', $segments) ?: array_search($fileName, $segments);
        return [
            'action' => $segments[$baseIndex + 1] ?? null,
            'id'     => $segments[$baseIndex + 2] ?? null
        ];
    }


    /* =====================================================
    File BASE
    ===================================================== */
    // ✅ ปรับให้เป็น path สัมพัทธ์
    $base_dir = __DIR__ . "/../uploads/fec/";
    $web_base = "/uploads/fec/";
?>