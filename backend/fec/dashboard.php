<?php
    require_once 'core_helper.php';

    /* =====================================================
        ROUTER LOGIC (URL Segments)
        ===================================================== */
    $route = getAction('dashboard');
    $action = $route['action'];

    if (!$action) {
        sendResponse(400, 'Error', 'Route Fail');
    }

    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'status':          getStatus($dbh);        break;
            case 'status_group':    getStatusGroup($dbh);   break;
            default:
                sendResponse(400, 'Error', 'Action Fail');
            break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }


    /* =====================================================
    CONTROLLER FUNCTIONS
    ===================================================== */

    function getStatus($dbh) {
        $sql = "SELECT status,SUM(CASE WHEN (active = 1 AND control = 1) THEN 1 ELSE 0 END) AS total
                FROM rec_fct
                WHERE active = 1 AND control = 1
                GROUP BY status";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }
        sendResponse(200, 'Success', $data);
    }
    function getStatusGroup($dbh) {
        $sql = "SELECT product, status, SUM(CASE WHEN (active = 1 AND control = 1) THEN 1 ELSE 0 END) AS total
                FROM rec_fct
                WHERE active = 1 AND control = 1 
                GROUP BY product, status ORDER BY product, status";
        
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        
        $groupedData = []; // สร้างตัวแปรใหม่เพื่อเก็บข้อมูลที่จัดกลุ่มแล้ว
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $productName = $row['product'];
            if (!isset($groupedData[$productName])) {
                $groupedData[$productName] = [
                    "group" => $productName,
                    "items" => []
                ];
            }
            $groupedData[$productName]['items'][] = $row;
        }
        sendResponse(200, 'Success', array_values($groupedData));
    }
?>