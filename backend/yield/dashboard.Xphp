<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route  = getAction('yield_dashboard');
    $action = $route['action'];

    /* =====================================================
    DEFAULT ROUTE (/dashboard)
    ===================================================== */
    if (!$action) {
        get_all();
        exit;
    }


    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'all':   get_all($dbh); break;
            case 'yield': get_all($dbh); break;
            default:
                sendResponse(400, 'Error', $action);
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }


    /* =====================================================
    CONTROLLER FUNCTIONS
    ===================================================== */

   function get_all() {
    global $dbh; // ใช้ PDO connection

    date_default_timezone_set('Asia/Bangkok');
    
    // ตั้งค่าช่วงเวลา (ย้อนหลัง 7 วัน ถึงวันนี้ เวลา 07:00:00)
    $last_update = date('Y-m-d');
    $time_st = date("Y-m-d 07:00:00", strtotime("-7 day", strtotime($last_update)));
    $time_sp = date("Y-m-d 07:00:00", strtotime($last_update));
    
    // SQL Query
    $sql = "SELECT 
                p.phase, pr.product, m.modelID, m.model, m.test_function,
                SUM(CASE WHEN r.rework_count = 0 THEN 1 ELSE 0 END) AS new_in,
                SUM(CASE WHEN r.rework_count = 0 AND r.test_result = 'Pass' THEN 1 ELSE 0 END) AS new_out
            FROM rec_wip r
            LEFT JOIN tbl_model m ON r.id_model = m.modelID
            LEFT JOIN tbl_product pr ON m.id_product = pr.productID
            LEFT JOIN tbl_phase p ON pr.id_phase = p.phaseID
            WHERE (r.test_time_out BETWEEN :time_st AND :time_sp)
                AND (r.test_result IN ('Pass', 'Fail'))
                AND r.build_type = 'Mass' 
                AND r.rework_count = 0
            GROUP BY m.modelID
            ORDER BY p.phaseID, pr.productID, m.modelID";

    try {
        $stmt = $dbh->prepare($sql);
        
        // ใช้ BindParam เพื่อความปลอดภัย (Prevent SQL Injection)
        $stmt->bindParam(':time_st', $time_st);
        $stmt->bindParam(':time_sp', $time_sp);
        
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // คำนวณ Yield เพิ่มเติมใน PHP (Optional)
        foreach ($data as &$row) {
            $row['yield_pct'] = ($row['new_in'] > 0) 
                ? number_format(($row['new_out'] / $row['new_in']) * 100, 2) 
                : "0.00";
        }

        sendResponse(200, 'Dashboard API success', [
            'range' => $time_st . " to " . $time_sp,
            'rows' => $data
        ]);

    } catch (PDOException $e) {
        sendResponse(500, 'Database Error: ' . $e->getMessage());
    }
}
    
?>