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
            case 'main':    dashboard($dbh); break;
            case 'status':  getStatus($dbh); break;
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

    function dashboard(){ global $dbh;

         $sql="SELECT DISTINCT category,
            spare_id As id,
            model,
            description,
            part_number,
            minimum_stock,
            onhand,
            storage
        FROM mma_spare
        ORDER BY category
        ";

        $stmt=$dbh->prepare($sql);
        $stmt->execute();

        $data=$stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(200,'Dashboard api success',$data);

    }
    
?>