<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route      = getAction('member');
    $action     = $route['action'];
    $id         = $route['id'];

    /* =====================================================
    DEFAULT ROUTE (/spares)
    ===================================================== */

    if (!$action) {
        login();
        exit;
    }


    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'all_list': all_list();    break;
            case 'login': login();       break; 


            default:
                sendResponse(400, 'Error', 'Action Fail');
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }

 
    function login(){ global $dbh;
        $data = requestData();

        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $sql = "SELECT memberID, member, position FROM tbl_member 
                WHERE log_use = :username AND log_pass = :password LIMIT 1";
                
        $stmt = $dbh->prepare($sql);
        $stmt->execute([
            ":username" => $username,
            ":password" => $password
        ]);
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            response(200, 'Login successful', $user);
        } else {
            response(401, 'Invalid username or password');
        }
    }
