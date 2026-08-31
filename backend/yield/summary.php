<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route  = getAction('summary');
    $action = $route['action'];
    $id     = $route['id'];

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
            case 'year':  getSummaryYieldMatrix($id); break;
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
        global $dbh;
        date_default_timezone_set('Asia/Bangkok');
        $last_update = date('Y-m-d');
        $time_st = date("Y-m-d 07:00:00", strtotime("-7 day", strtotime($last_update)));
        $time_sp = date("Y-m-d 07:00:00", strtotime($last_update));

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
            $stmt->bindParam(':time_st', $time_st);
            $stmt->bindParam(':time_sp', $time_sp);
            
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

 
    function getSummaryYieldMatrix($year_check){
        date_default_timezone_set('Asia/Bangkok');

        global $dbh;

        $time_st = $year_check . "-01-01 07:00:00";
        $time_sp = ($year_check + 1) . "-01-01 07:00:00";

        $sql = "
            SELECT 
                YEAR(r.test_time_out) AS yy,
                WEEK(r.test_time_out, 1) AS ww,

                p.phase,
                pr.product,
                m.modelID,
                m.model,
                m.test_function,

                SUM(
                    CASE 
                        WHEN r.rework_count = 0 THEN 1
                        ELSE 0
                    END
                ) AS new_in,

                SUM(
                    CASE 
                        WHEN r.rework_count = 0
                        AND r.test_result = 'Pass'
                        THEN 1
                        ELSE 0
                    END
                ) AS new_out

            FROM rec_wip r

            LEFT JOIN tbl_model m
                ON r.id_model = m.modelID

            LEFT JOIN tbl_product pr
                ON m.id_product = pr.productID

            LEFT JOIN tbl_phase p
                ON pr.id_phase = p.phaseID

            WHERE r.test_time_out BETWEEN :time_st AND :time_sp
                AND r.test_result IN ('Pass', 'Fail')
                AND r.build_type = 'Mass'
                AND r.rework_count = 0

            GROUP BY
                YEAR(r.test_time_out),
                WEEK(r.test_time_out, 1),
                m.modelID

            ORDER BY
                yy,
                ww,
                p.phaseID,
                pr.productID,
                m.modelID
        ";

        try {

            $stmt = $dbh->prepare($sql);

            $stmt->bindParam(':time_st', $time_st);
            $stmt->bindParam(':time_sp', $time_sp);

            $stmt->execute();

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // =========================
            // PREPARE RESULT
            // =========================

            $result = [];

            $week_list = [];

            foreach ($rows as $row) {

                $modelID = $row['modelID'];
                $ww = (int)$row['ww'];

                // -------------------------
                // Week List
                // -------------------------
                if (!in_array($ww, $week_list)) {
                    $week_list[] = $ww;
                }

                // -------------------------
                // Create Product
                // -------------------------
                if (!isset($result[$modelID])) {

                    $result[$modelID] = [

                        'modelID' => $modelID,
                        'phase' => $row['phase'],
                        'product' => $row['product'],
                        'model' => $row['model'],
                        'test_function' => $row['test_function'],

                        'summary' => [
                            'total_in' => 0,
                            'total_out' => 0,
                            'avg_yield' => 0
                        ],

                        'weeks' => []
                    ];
                }

                // -------------------------
                // Yield
                // -------------------------
                $yield_pct = 0;

                if ($row['new_in'] > 0) {
                    $yield_pct = round(
                        ($row['new_out'] / $row['new_in']) * 100,
                        2
                    );
                }

                // -------------------------
                // Week Data
                // -------------------------
                $result[$modelID]['weeks'][$ww] = [

                    'in' => (int)$row['new_in'],

                    'out' => (int)$row['new_out'],

                    'yield' => $yield_pct,

                    'yield_goal' => 85,

                    // Example Failure Data
                    // เปลี่ยนเป็น query จริงภายหลัง
                    'failure' => [

                        'RF Match' => 0,
                        'Calibrate' => 0,
                        'High Bandwidth' => 0,
                        'TDR' => 0,
                        'Noise' => 0,
                        'sum' => 0
                    ]
                ];

                // -------------------------
                // Summary
                // -------------------------
                $result[$modelID]['summary']['total_in']
                    += (int)$row['new_in'];

                $result[$modelID]['summary']['total_out']
                    += (int)$row['new_out'];
            }

            // =========================
            // AVG Yield
            // =========================

            foreach ($result as &$item) {

                $total_in = $item['summary']['total_in'];
                $total_out = $item['summary']['total_out'];

                $avg_yield = 0;

                if ($total_in > 0) {

                    $avg_yield = round(
                        ($total_out / $total_in) * 100,
                        2
                    );
                }

                $item['summary']['avg_yield'] = $avg_yield;
            }

            // =========================
            // SORT WEEK
            // =========================

            sort($week_list);

            // =========================
            // RESPONSE
            // =========================

            sendResponse(
                200,
                'Yield Matrix API success',
                [

                    'year' => (int)$year_check,

                    'weeks' => $week_list,

                    'failure_headers' => [
                        'RF Match',
                        'Calibrate',
                        'High Bandwidth',
                        'TDR',
                        'Noise'
                    ],

                    'products' => array_values($result)
                ]
            );

        } catch (PDOException $e) {

            sendResponse(
                500,
                'Database Error: ' . $e->getMessage()
            );
        }
    }




    // function getSummaryYield($year_check) {
    //     date_default_timezone_set('Asia/Bangkok');
    //     global $dbh;

    //     $time_st = $year_check . "-01-01 07:00:00";
    //     $time_sp = ($year_check + 1) . "-01-01 07:00:00";

    //     $sql = "SELECT 
    //                 YEAR(r.test_time_out) AS yy,
    //                 WEEK(r.test_time_out, 1) AS ww,

    //                 p.phase, 
    //                 pr.product, 
    //                 m.modelID, 
    //                 m.model, 
    //                 m.test_function,

    //                 SUM(CASE 
    //                         WHEN r.rework_count = 0 
    //                         THEN 1 
    //                         ELSE 0 
    //                     END) AS new_in,

    //                 SUM(CASE 
    //                         WHEN r.rework_count = 0 
    //                         AND r.test_result = 'Pass' 
    //                         THEN 1 
    //                         ELSE 0 
    //                     END) AS new_out

    //             FROM rec_wip r

    //             LEFT JOIN tbl_model m 
    //                 ON r.id_model = m.modelID

    //             LEFT JOIN tbl_product pr 
    //                 ON m.id_product = pr.productID

    //             LEFT JOIN tbl_phase p 
    //                 ON pr.id_phase = p.phaseID

    //             WHERE r.test_time_out BETWEEN :time_st AND :time_sp
    //                 AND r.test_result IN ('Pass', 'Fail')
    //                 AND r.build_type = 'Mass'
    //                 AND r.rework_count = 0

    //             GROUP BY 
    //                 YEAR(r.test_time_out),
    //                 WEEK(r.test_time_out, 1),
    //                 m.modelID

    //             ORDER BY 
    //                 yy,
    //                 ww,
    //                 p.phaseID,
    //                 pr.productID,
    //                 m.modelID";

    //     try {

    //         $stmt = $dbh->prepare($sql);

    //         $stmt->bindParam(':time_st', $time_st);
    //         $stmt->bindParam(':time_sp', $time_sp);

    //         $stmt->execute();

    //         $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //         foreach ($data as &$row) {

    //             $row['yield_pct'] = ($row['new_in'] > 0)
    //                 ? number_format(($row['new_out'] / $row['new_in']) * 100, 2)
    //                 : "0.00";

    //             $row['week_name'] = "WW" . str_pad($row['ww'], 2, "0", STR_PAD_LEFT);
    //         }

    //         sendResponse(200, 'Dashboard API success', [
    //             'range' => $time_st . " to " . $time_sp,
    //             'rows' => $data
    //         ]);

    //     } catch (PDOException $e) {

    //         sendResponse(500, 'Database Error: ' . $e->getMessage());
    //     }
    // }
?>