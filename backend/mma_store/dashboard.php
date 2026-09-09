<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route  = getAction('dashboard');
    $action = $route['action'];

    /* =====================================================
    DEFAULT ROUTE (/dashboard)
    ===================================================== */
    if (!$action) {
        dashboard();
        exit;
    }

    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'get_status':      getStatus();      break;
            case 'get_category':    getCategory();    break;
            case 'get_transaction': getTransaction(); break;
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

    function getStatus() { 
        global $dbh;

        $sql = "SELECT 
                    COUNT(CASE WHEN onhand >= (minimum_stock * 0.8) THEN 1 END) AS Full,
                    COUNT(CASE WHEN onhand >= (minimum_stock * 0.5) AND onhand < (minimum_stock * 0.8) THEN 1 END) AS Medium,
                    COUNT(CASE WHEN onhand > 0 AND onhand < (minimum_stock * 0.5) THEN 1 END) AS Low,
                    COUNT(CASE WHEN onhand <= 0 THEN 1 END) AS Out_of_stock
                FROM mma_spare 
                WHERE active_status = 1";

        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC); // ใช้ fetch() เพราะคืนค่าแค่ 1แถว

        sendResponse(200, 'Dashboard api success', $data);
    }

    function getCategory() { 
        global $dbh;

        $sql = "SELECT count(category) as category_count, category
                FROM mma_spare 
                WHERE active_status = 1 
                GROUP BY category";

        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(200, 'Dashboard api success', $data);
    }

    function getTransaction() { 
        global $dbh; 

        $sql = "SELECT 
                    DATE_FORMAT(t.create_at, '%Y-%m') AS transaction_month,
                    DATE_FORMAT(t.create_at, '%M %Y') AS transaction_month_name,
                    COUNT(CASE WHEN t.order_header = 'Withdraw' THEN 1 END) AS Withdraw,
                    COUNT(CASE WHEN t.order_header = 'HanaPO' THEN 1 END) AS HanaPO,
                    COUNT(CASE WHEN t.order_header = 'HanaStore' THEN 1 END) AS HanaStore,
                    COUNT(CASE WHEN t.order_header = 'CustomerGive' THEN 1 END) AS CustomerGive,
                    COUNT(CASE WHEN t.order_header = 'KnockDown' THEN 1 END) AS KnockDown
                FROM mma_spare_transaction t
                LEFT JOIN mma_spare s ON t.spare_id = s.spare_id 
                WHERE t.create_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
                GROUP BY transaction_month, transaction_month_name
                ORDER BY transaction_month ASC";

        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(200, 'Dashboard api success', $data);
    }
?>