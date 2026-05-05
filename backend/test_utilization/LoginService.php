<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER LOGIC (URL Segments)
    ===================================================== */
    $route = getAction('LoginService');
    $action = $route['action'];
    $id = $route['id'];

    if (!$action) {
        sendResponse(400, 'Action not specified');
    }


    /* =====================================================
    ROUTE MAP
    ===================================================== */
    switch ($action) {
        case 'login': 
            handleLogin($dbh); 
            break;
        default:
            echo json_encode(["status" => 0, "message" => "Invalid Auth Action"]);
            break;
    }

    /* =====================================================
    FUNCTIONS
    ===================================================== */

    function handleLogin($dbh) {
        // รับค่าจาก $_POST (Axios ส่งแบบ FormData)
        $log_use  = $_POST['username'] ?? ''; 
        $log_pass = $_POST['password'] ?? '';

        if (empty($log_use) || empty($log_pass)) {
            echo json_encode(["status" => 0, "message" => "กรุณากรอกข้อมูลให้ครบถ้วน"]);
            exit;
        }

        try {
            $sql = "SELECT memberID, member, position 
                FROM tbl_member 
                WHERE active_status = 1 
                AND log_use = :log_use 
                AND log_pass = :log_pass 
                LIMIT 1";
            
            $stmt = $dbh->prepare($sql);
            $stmt->execute([
                ":log_use"  => $log_use,
                ":log_pass" => $log_pass
            ]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$data) {
                echo json_encode([
                    "status" => 0, 
                    "message" => "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"
                ]);
            } else {
                echo json_encode([
                    "status" => 1, 
                    "message" => "Login Success", 
                    "user" => $data
                ]);
            }
        } catch (Exception $e) {
            echo json_encode(["status" => 0, "message" => "Server Error"]);
        }
    }

?>