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
            case 'readiness':   getReadiness($dbh);   break;
            case 'status':      getStatus($dbh);      break;
            case 'utilization': getUtilization($dbh); break;
            case 'mtbf':        getMTBF($dbh);        break;
            case 'mttr':        getMTTR($dbh);        break;
            case 'failure':     getFailure($dbh);     break;
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

    function getReadiness($dbh) {
        $sql = "SELECT readiness, COUNT(*) AS total
                FROM (
                    SELECT 
                        m.station_id,
                        CASE
                            WHEN m.machine_status = 'Down'
                            AND EXISTS (
                                SELECT 1 FROM machine_problem p
                                WHERE p.station_id = m.station_id
                                AND (p.failure_category IS NULL OR p.failure_category NOT LIKE 'Equipment Send to%')
                                AND (p.up_at IS NULL OR p.up_at = '0000-00-00 00:00:00')
                            ) THEN 'Needs Attention'
                            WHEN rec_z_chart.result_all = 'Pass'
                            AND rec_pm_station.pm_duedate > NOW()
                            AND m.machine_status IN('Run','Idle')
                            AND NOT EXISTS (
                                SELECT 1 FROM rec_eqs eq
                                WHERE eq.id_station = m.station_id AND eq.active_status = 1 AND eq.active_use = 1
                                AND eq.status NOT LIKE '%Ship%'
                                AND eq.status NOT IN ('Cancelled','Send Cal Hana','Extend','Extension','Scrap')
                                AND IF(eq.extension_duedate != '0000-00-00 00:00:00', eq.extension_duedate, eq.cal_duedate) < NOW()
                                AND eq.cal_duedate != '0000-00-00 00:00:00'
                            ) THEN 'Ready'
                            ELSE 'Not Ready'
                        END AS readiness
                    FROM machine_status_current m
                    LEFT JOIN rec_z_chart ON m.station_id = rec_z_chart.id_station AND rec_z_chart.active_status = 1 AND rec_z_chart.status = 'Run'
                    LEFT JOIN rec_pm_station ON m.station_id = rec_pm_station.id_station AND rec_pm_station.active_status = 1
                    WHERE m.active_status = 1
                    GROUP BY m.station_id
                ) t GROUP BY readiness";

        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = ["Ready" => 0, "Not Ready" => 0, "Needs Attention" => 0];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[$row['readiness']] = (int)$row['total'];
        }
        sendResponse(200, 'Success', $data);
    }

    function getStatus($dbh) {
        $sql = "SELECT machine_status, COUNT(*) AS total
            FROM machine_status_current WHERE active_status = 1
            GROUP BY machine_status";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[$row['machine_status']] = (int)$row['total'];
        }
        sendResponse(200, 'Success', $data);
    }

    function getUtilization($dbh) {
        $sql = "SELECT DATE(create_at) AS ut_day,
                ROUND(SUM(CASE WHEN machine_status = 'Run' THEN duration ELSE 0 END) / SUM(duration) * 100, 2) AS utilization
                FROM (
                    SELECT station_id, machine_status, create_at,
                    TIMESTAMPDIFF(SECOND, create_at, COALESCE(LEAD(create_at) OVER (PARTITION BY station_id ORDER BY create_at), NOW())) AS duration
                    FROM machine_status_history WHERE create_at >= CURDATE() - INTERVAL 15 DAY
                ) t GROUP BY DATE(create_at) ORDER BY ut_day";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        sendResponse(200, 'Success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    function getMTBF($dbh) {
        $sql = "SELECT DATE(down_at) AS ut_day,
                ROUND(SUM(TIMESTAMPDIFF(SECOND, down_at, up_at)) / COUNT(machine_problem_id), 2) AS mtbf
                FROM machine_problem WHERE down_at >= CURDATE() - INTERVAL 15 DAY
                AND up_at != '0000-00-00 00:00:00' GROUP BY DATE(down_at) ORDER BY ut_day";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        sendResponse(200, 'Success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    function getMTTR($dbh) {
        $sql = "SELECT DATE(down_at) AS ut_day,
                ROUND(AVG(TIMESTAMPDIFF(SECOND, down_at, COALESCE(NULLIF(up_at,'0000-00-00 00:00:00'), NOW()))) / 60, 2) AS mttr
                FROM machine_problem WHERE down_at >= CURDATE() - INTERVAL 15 DAY
                GROUP BY DATE(down_at) ORDER BY ut_day";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        sendResponse(200, 'Success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    function getFailure($dbh) {
        $sql = "SELECT failure_category, COUNT(*) AS total
                FROM machine_problem WHERE down_at >= DATE_SUB(CURDATE(), INTERVAL 15 DAY)
                AND failure_category IS NOT NULL AND failure_category != ''
                GROUP BY failure_category ORDER BY total DESC";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        sendResponse(200, 'Success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    
?>