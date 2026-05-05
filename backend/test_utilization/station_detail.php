<?php
    require_once 'core_helper.php';

    /* =====================================================
        ROUTER LOGIC (URL Segments)
        ===================================================== */
    $route = getAction('station_detail');
    $action = $route['action'];

    if (!$action) {
        sendResponse(400, 'Action not specified');
    }

    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'status_station': getStatusStation($dbh); break;
            case 'FailurePareto':  getFailurePareto($dbh); break;
            case 'TopDowntime':    getTopDowntime($dbh); break;
            case 'table_station':  getTableStation($dbh); break;
            default:
                echo json_encode(["status" => 0, "message" => "Action '$action' not found"]);
                break;
        }
    } catch (Exception $e) {
        echo json_encode(["status" => 0, "message" => $e->getMessage()]);
    }

    /* =====================================================
    FUNCTIONS
    ===================================================== */

    function getStatusStation($dbh) {
        $sql = "SELECT m.machine_status AS status, m.station_id AS id_station, s.station
            FROM machine_status_current m
            LEFT JOIN tbl_station AS s ON m.station_id = s.stationID
            WHERE m.active_status = 1
            ORDER BY m.machine_status, s.station";
            
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, 'Success', $data);
    }

    function getFailurePareto($dbh) {
        $sql = "SELECT failure_category, COUNT(station_id) AS total
                FROM machine_problem
                WHERE failure_category != ''
                AND down_at >= DATE_SUB(CURDATE(), INTERVAL 180 DAY)
                GROUP BY failure_category
                ORDER BY total DESC";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, 'Success', $data);
    }

    function getTopDowntime($dbh) {
        $sql = "SELECT s.station, 
                ROUND(SUM(TIMESTAMPDIFF(HOUR, p.down_at, IF(p.up_at IS NULL OR p.up_at='0000-00-00 00:00:00', NOW(), p.up_at))), 2) AS Total
                FROM machine_problem p
                LEFT JOIN tbl_station s ON p.station_id = s.stationID
                WHERE p.down_at IS NOT NULL
                GROUP BY p.station_id
                ORDER BY Total DESC LIMIT 10";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, 'Success', $data);
    }

    function getTableStation($dbh) {
        $sql = "SELECT m.station_id, s.station, s.product, m.machine_status AS status, m.update_at, 
                    p.down_at, IF(m.machine_status = 'Down', p.problem, NULL) AS problem,
                    util.Utilization, mtbf.MTBF, mttr.MTTR
                FROM machine_status_current m
                LEFT JOIN tbl_station s ON m.station_id = s.stationID
                LEFT JOIN machine_problem p ON p.machine_problem_id = (
                    SELECT mp.machine_problem_id FROM machine_problem mp 
                    WHERE mp.station_id = m.station_id ORDER BY mp.machine_problem_id DESC LIMIT 1
                )
                LEFT JOIN (
                    SELECT station_id, ROUND(SUM(duration_sec) / (86400*15) * 100, 2) AS Utilization
                    FROM (
                        SELECT station_id, machine_status,
                        TIMESTAMPDIFF(SECOND, create_at, LEAD(create_at) OVER(PARTITION BY station_id ORDER BY create_at)) AS duration_sec
                        FROM machine_status_history WHERE create_at >= CURDATE() - INTERVAL 15 DAY
                    ) t WHERE machine_status='Run' GROUP BY station_id
                ) util ON util.station_id = m.station_id
                LEFT JOIN (
                    SELECT station_id, ROUND(AVG(run_minutes), 2) AS MTBF
                    FROM (
                        SELECT station_id, TIMESTAMPDIFF(MINUTE, up_at, LEAD(down_at) OVER(PARTITION BY station_id ORDER BY down_at)) AS run_minutes
                        FROM machine_problem WHERE up_at IS NOT NULL
                    ) t WHERE run_minutes IS NOT NULL GROUP BY station_id
                ) mtbf ON mtbf.station_id = m.station_id
                LEFT JOIN (
                    SELECT station_id, ROUND(AVG(TIMESTAMPDIFF(MINUTE, down_at, up_at)), 2) AS MTTR
                    FROM machine_problem WHERE down_at >= CURDATE() - INTERVAL 15 DAY AND up_at IS NOT NULL GROUP BY station_id
                ) mttr ON mttr.station_id = m.station_id
                WHERE m.active_status = 1
                ORDER BY s.station";
                
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, 'Success', $data);
    }

?>