<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route  = getAction('record');
    $action = $route['action'];
    $id     = $route['id']; // เก็บคู่ลำดับถัดไป (เช่น group_name)

    global $segments;
    $choice_type = $segments[array_search('select_choice', $segments) + 1] ?? null;
    $target_id   = $segments[array_search('select_choice', $segments) + 2] ?? null;

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
            case 'select_choice':  
                get_select_choice($choice_type, $target_id); 
            break; 

            case 'groupyield':    get_group_yield($dbh); break;
            case 'productyield':  get_product_yield($dbh); break;
            case 'modelyield':    get_model_yield($dbh); break;
            case 'dashboard':     get_all($dbh); break;
            
            default:
                sendResponse(400, 'Error', $action);
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    } // <-- ปิด try-catch ของระบบ Router ตรงนี้


    /* =====================================================
    CONTROLLER FUNCTIONS
    ===================================================== */
    function get_select_choice($choice_type, $target_id) {
        global $dbh;
        $sql = ""; 

        switch ($choice_type) {
            case 'group_name':
                if (!$target_id) { // แก้ไขเป็น $target_id
                    $sql = "SELECT DISTINCT group_name FROM tbl_group WHERE id_customer = 1 ORDER BY groupID ASC";
                } else {
                    $sql = "SELECT DISTINCT group_name FROM tbl_group WHERE id_customer = :id ORDER BY groupID ASC";
                }
                break; 

            case 'phase':
                if (!$target_id) { 
                    $sql = "SELECT DISTINCT phase FROM tbl_phase WHERE id_group IN (1, 2, 3) ORDER BY phase ASC";
                } else {
                    $sql = "SELECT DISTINCT phase FROM tbl_phase WHERE id_group = :id ORDER BY phase ASC";
                }
                break; 

            case 'product':
                if (!$target_id) { // แก้ไขเป็น $target_id
                    $sql = "SELECT DISTINCT product FROM tbl_product ORDER BY product ASC";
                } else {
                    $sql = "SELECT DISTINCT product FROM tbl_product WHERE id_phase = :id ORDER BY product ASC";
                }
                break; 

            case 'model':
                if (!$target_id) { // แก้ไขเป็น $target_id
                    $sql = "SELECT DISTINCT model FROM tbl_model ORDER BY model ASC";
                } else {
                    $sql = "SELECT DISTINCT model FROM tbl_model WHERE id_product = :id ORDER BY model ASC";
                }
                break; 

            default:
                sendResponse(400, 'Invalid choice type', $choice_type);
                return;
        }

        try {
            $stmt = $dbh->prepare($sql);
            
            // แก้ไข: เปลี่ยนจาก $id มาใช้ $target_id ในการเช็คและผูกค่า (Bind)
            if ($target_id && strpos($sql, ':id') !== false) {
                $stmt->bindValue(':id', $target_id);
            }

            $stmt->execute();
            $raw_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            sendResponse(200, 'Dashboard Group Yield Success', $raw_data);

        } catch (PDOException $e) {
            sendResponse(500, 'Database Error: ' . $e->getMessage());
        }
    }
 





















    
    function get_all() {
        global $dbh; 

        date_default_timezone_set('Asia/Bangkok');

        $this_year = date('Y');
        $last_year = $this_year - 1;
        $next_year = $this_year + 1;
        
        // SQL มหากาพย์ แบ่งเป็น 3 ส่วน (ปีที่แล้ว -> รายเดือน -> 4 สัปดาห์ล่าสุด ->ปีปัจจุบัน)
        $sql = "
            /* 1. ข้อมูลปีที่แล้ว (FY2025) */
            SELECT 
                1 AS sort_order,
                'FY2025' AS period,
                COUNT(*) AS total_input,
                SUM(CASE WHEN r.test_result = 'Pass' THEN 1 ELSE 0 END) AS total_output
            FROM rec_wip r
            WHERE r.test_time_out >= '$last_year-01-01 00:00:00' AND r.test_time_out < '$this_year-01-01 00:00:00'
            AND r.test_result IN ('Pass', 'Fail') AND r.build_type = 'Mass' AND r.rework_count = 0

            UNION ALL

            /* 2. ข้อมูลรายเดือน (ย้อนหลัง 2 เดือน และ 1 เดือน ไม่รวมเดือนปัจจุบัน) */
            SELECT 
                2 AS sort_order,
                DATE_FORMAT(r.test_time_out, '%b-%y') AS period, 
                COUNT(*) AS total_input,
                SUM(CASE WHEN r.test_result = 'Pass' THEN 1 ELSE 0 END) AS total_output
            FROM rec_wip r
            WHERE r.test_time_out >= DATE_SUB(DATE_FORMAT(NOW() ,'%Y-%m-01'), INTERVAL 2 MONTH) 
            AND r.test_time_out < DATE_FORMAT(NOW() ,'%Y-%m-01') 
            AND r.test_result IN ('Pass', 'Fail') AND r.build_type = 'Mass' AND r.rework_count = 0
            GROUP BY DATE_FORMAT(r.test_time_out, '%Y-%m'), DATE_FORMAT(r.test_time_out, '%b-%y')

            UNION ALL

            /* 3. ข้อมูลรายสัปดาห์ (4 สัปดาห์ล่าสุด) */
            SELECT 
                3 AS sort_order,
                -- ใส่ปีนำหน้าเล็กน้อย เช่น '26-WW21' เพื่อป้องกันข้อมูลชนกันกรณีคาบเกี่ยวปี
                CONCAT(DATE_FORMAT(r.test_time_out, '%y'), '-WW', LPAD(WEEK(r.test_time_out, 3), 2, '0')) AS period, 
                COUNT(*) AS total_input,
                SUM(CASE WHEN r.test_result = 'Pass' THEN 1 ELSE 0 END) AS total_output
            FROM rec_wip r
            WHERE r.test_time_out >= DATE_SUB(NOW(), INTERVAL 4 WEEK) 
            AND r.test_result IN ('Pass', 'Fail') AND r.build_type = 'Mass' AND r.rework_count = 0
            GROUP BY YEAR(r.test_time_out), WEEK(r.test_time_out, 3), period

        UNION ALL

            /* 4. ข้อมูลปีปัจจุบัน (FY2026) */
            SELECT 
                4 AS sort_order,
                'FY2026' AS period,
                COUNT(*) AS total_input,
                SUM(CASE WHEN r.test_result = 'Pass' THEN 1 ELSE 0 END) AS total_output
            FROM rec_wip r
            WHERE r.test_time_out >= '$this_year-01-01 00:00:00' AND r.test_time_out < '$next_year-01-01 00:00:00'
            AND r.test_result IN ('Pass', 'Fail') AND r.build_type = 'Mass' AND r.rework_count = 0

            /* เรียงลำดับตามกลุ่มเวลา และกลุ่มย่อย */
            ORDER BY sort_order ASC, period ASC
        ";

        try {
            $stmt = $dbh->prepare($sql);
            $stmt->execute();
            $raw_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $trends = [];
            $factory_target = 95.00; // Target yield หลักของโปรเจกต์

            foreach ($raw_data as $row) {
                $input = (int)$row['total_input'];
                $output = (int)$row['total_output'];
                $yield_pct = ($input > 0) ? number_format(($output / $input) * 100, 2) : "0.00";

                $trends[] = [
                    'period'     => $row['period'],       // เช่น FY2025, Apr-26, WW21
                    'input'      => $input,
                    'output'     => $output,
                    'yield_pct'  => $yield_pct,
                    'target_pct' => number_format($factory_target, 2)
                ];
            }

            sendResponse(200, 'Dashboard Trend API success', [
                'trends' => $trends
            ]);

        } catch (PDOException $e) {
            sendResponse(500, 'Database Error: ' . $e->getMessage());
        }
    }


    function get_group_yield() {
        global $dbh; 

        date_default_timezone_set('Asia/Bangkok');

        // คำนวณช่วงเวลาของสัปดาห์ที่แล้วแบบไดนามิกอ้างอิงเวลาปัจจุบัน
        // เริ่มต้น: วันจันทร์ของสัปดาห์ที่แล้ว เวลา 07:00:00
        $time_st = date('Y-m-d 07:00:00', strtotime('monday last week'));
        // สิ้นสุด: วันจันทร์ของสัปดาห์นี้ เวลา 07:00:00 (ซึ่งก็คือจุดสิ้นสุดของสัปดาห์ที่แล้วพอดี)
        $time_sp = date('Y-m-d 07:00:00', strtotime('monday this week'));
        
        // ดึงชื่อสัปดาห์มาทำเป็นชื่อหัวข้อช่วงเวลา เช่น "26-WW23"
        $period_name = date('y-', strtotime('monday last week')) . 'WW' . date('W', strtotime('monday last week'));

        $sql = "
            SELECT 
                :period AS period,
                tbl_group.group_name AS group_name,tbl_group.groupID ,m.model,
                SUM(CASE WHEN r.rework_count = 0 THEN 1 ELSE 0 END) AS total_input,
                SUM(CASE WHEN r.rework_count = 0 AND r.test_result = 'Pass' THEN 1 ELSE 0 END) AS total_output
            FROM rec_wip r
                LEFT JOIN tbl_model m     ON r.id_model     = m.modelID 
                LEFT JOIN tbl_product pr  ON m.id_product   = pr.productID
                LEFT JOIN tbl_phase p     ON pr.id_phase    = p.phaseID 
                LEFT JOIN tbl_group       ON p.id_group    = tbl_group.groupID  
            WHERE (r.test_time_out BETWEEN :time_st AND :time_sp)
            AND r.test_result IN ('Pass', 'Fail') 
            AND r.build_type = 'Mass' 
            AND r.rework_count = 0
            GROUP BY p.id_group
            ORDER BY tbl_group.group_name ASC
        ";

        try {
            $stmt = $dbh->prepare($sql);
            
            // Bind Parameter เพื่อความปลอดภัยและความแม่นยำ
            $stmt->bindParam(':period', $period_name);
            $stmt->bindParam(':time_st', $time_st);
            $stmt->bindParam(':time_sp', $time_sp);
            
            $stmt->execute();
            $raw_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $group_data = [];
            $factory_target = 95.00; 

            foreach ($raw_data as $row) {
                $input = (int)$row['total_input'];
                $output = (int)$row['total_output'];
                $yield_pct = ($input > 0) ? number_format(($output / $input) * 100, 2) : "0.00";

                $group_data[] = [
                    'period'     => $row['period'],         // เช่น "26-WW23"
                    'group_name' => $row['group_name'] ?? $row['model'] , // ชื่อกลุ่มผลิตภัณฑ์
                    'input'      => $input,
                    'output'     => $output,
                    'yield_pct'  => $yield_pct,
                    'target_pct' => number_format($factory_target, 2)
                ];
            }

            sendResponse(200, 'Dashboard Group Yield Success', [
                'range' => $time_st . " to " . $time_sp,
                'groups' => $group_data
            ]);

        } catch (PDOException $e) {
            sendResponse(500, 'Database Error: ' . $e->getMessage());
        }
    }

    function get_model_yield() {
        global $dbh; 

        date_default_timezone_set('Asia/Bangkok');

        // คำนวณช่วงเวลาของสัปดาห์ที่แล้ว (วันจันทร์ที่แล้ว 07:00 ถึง วันจันทร์นี้ 07:00)
        $time_st = date('Y-m-d 07:00:00', strtotime('monday last week'));
        $time_sp = date('Y-m-d 07:00:00', strtotime('monday this week'));
        
        // ตั้งชื่อหัวข้อช่วงเวลา เช่น "26-WW23"
        $period_name = date('y-', strtotime('monday last week')) . 'WW' . date('W', strtotime('monday last week'));

        $sql = "
            SELECT 
                :period AS period,
                p.phase,
                pr.product,
                tbl_group.group_name,
                m.modelID,
                m.model,
                m.test_function,
                SUM(CASE WHEN r.rework_count = 0 THEN 1 ELSE 0 END) AS total_input,
                SUM(CASE WHEN r.rework_count = 0 AND r.test_result = 'Pass' THEN 1 ELSE 0 END) AS total_output
            FROM rec_wip r
                LEFT JOIN tbl_model m     ON r.id_model     = m.modelID 
                LEFT JOIN tbl_product pr  ON m.id_product   = pr.productID
                LEFT JOIN tbl_phase p     ON pr.id_phase    = p.phaseID 
                LEFT JOIN tbl_group       ON pr.id_group    = tbl_group.groupID  
            WHERE (r.test_time_out BETWEEN :time_st AND :time_sp)
            AND r.test_result IN ('Pass', 'Fail') 
            AND r.build_type = 'Mass' 
            AND r.rework_count = 0
            GROUP BY m.modelID, m.test_function
            ORDER BY p.phaseID, pr.productID, m.model, m.test_function_step ASC
        ";

        try {
            $stmt = $dbh->prepare($sql);
            
            $stmt->bindParam(':period', $period_name);
            $stmt->bindParam(':time_st', $time_st);
            $stmt->bindParam(':time_sp', $time_sp);
            
            $stmt->execute();
            $raw_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $model_data = [];
            foreach ($raw_data as $row) {
                $input = (int)$row['total_input'];
                $output = (int)$row['total_output'];
                $yield_pct = ($input > 0) ? number_format(($output / $input) * 100, 2) : "0.00";

                $model_data[] = [
                    'period'        => $row['period'],
                    'phase'         => $row['phase'],
                    'product'       => $row['product'],
                    'group_name'    => $row['group_name'] ?? 'Unknown',
                    'modelID'       => $row['modelID'],
                    'model'         => $row['model'],
                    'test_function' => $row['test_function'],
                    'input'         => $input,
                    'output'        => $output,
                    'yield_pct'     => $yield_pct
                ];
            }

            sendResponse(200, 'Dashboard Model Yield Success', [
                'range' => $time_st . " to " . $time_sp,
                'models' => $model_data
            ]);

        } catch (PDOException $e) {
            sendResponse(500, 'Database Error: ' . $e->getMessage());
        }
    }
    
?>