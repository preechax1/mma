<?php
    require_once 'core_helper.php';

    /* =====================================================
       ROUTER LOGIC
       ===================================================== */
    $route  = getAction('DetailCardStation'); 
    $action = $route['action'];
    $id     = $route['id'];

    if (!$action) {
        sendResponse(400, 'Error', 'Route Fail');
    }

    /* =====================================================
       ROUTE MAP
       ===================================================== */
    try {
        switch ($action) {
            case 'get_files':           getFiles($id, $base_dir_station, $web_base_station); break;
            case 'pm':                  getPMStatus($dbh, $id); break;
            case 'equipment':           getEquipment($dbh, $id); break;
            case 'utilization_summary': getUtilizationSummary($dbh, $id); break;
            case 'status':              getStatusDetail($dbh, $id); break;
            case 'readiness':           getReadinessDetail($dbh, $id); break;
            case 'testtimeline':        getTestTimeline(); break;
            default:
                sendResponse(400, 'Error', 'Route Action Fail');
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }

    /* =====================================================
       CONTROLLER FUNCTIONS
       ===================================================== */

    function getFiles($id, $base_dir_station, $web_base_station) {
        $folder = "ID_" . $id;
        $dir = rtrim($base_dir_station, "/\\") . DIRECTORY_SEPARATOR . $folder;
        $result = [];
        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $file) {
                if ($file == "." || $file == "..") continue;
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                $result[] = [
                    "name" => $file,
                    "file_url" => $web_base_station . $folder . "/" . rawurlencode($file),
                    "ext" => $ext
                ];
            }
        }
        sendResponse(200, 'Success', $result);
    }

    function getPMStatus($dbh, $id) {
        $sql = "SELECT rec_pm_station.pm_stationID, tbl_station.station, tbl_member.member, 
                       rec_pm_station.pm_date, rec_pm_station.pm_duedate, tbl_station.pm_frequency,
                       DATEDIFF(rec_pm_station.pm_duedate, NOW()) as due_in_days
                FROM rec_pm_station
                LEFT JOIN tbl_station ON rec_pm_station.id_station = tbl_station.stationID
                LEFT JOIN tbl_member  ON rec_pm_station.pm_by = tbl_member.memberID
                WHERE rec_pm_station.active_status = 1 AND rec_pm_station.id_station = :id";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([":id" => $id]);
        sendResponse(200, 'Success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    function getEquipment($dbh, $id) {
        $date_now = date('Y-m-d H:i:s');
        $nodate   = '0000-00-00 00:00:00';
        $sql = "SELECT rec_eqs.equipmentID, rec_eqs.id_keysight, rec_eqs.serial, rec_eqs.type, rec_eqs.status,
                       tbl_station.station AS station, tbl_storage.station AS storage,
                       IF(rec_eqs.extension_duedate > '$nodate', DATE_FORMAT(rec_eqs.extension_duedate,'%d-%M-%Y'), DATE_FORMAT(rec_eqs.cal_duedate,'%d-%M-%Y')) AS duedate,
                       COALESCE(IF(rec_eqs.extension_duedate > '$nodate', DATEDIFF(rec_eqs.extension_duedate,'$date_now'), DATEDIFF(rec_eqs.cal_duedate,'$date_now')), 'NA') AS duedate_diff,
                       DATEDIFF('$date_now', rec_eqs.last_update) AS diff_update,
                       DATE_FORMAT(rec_eqs.last_update,'%d-%M-%Y') AS last_update,
                       CASE
                           WHEN rec_eqs.status LIKE '%Ship%' THEN 'Ship Out'
                           WHEN (IF(rec_eqs.extension_duedate > '$nodate', DATEDIFF(rec_eqs.extension_duedate,'$date_now'), DATEDIFF(rec_eqs.cal_duedate,'$date_now'))) < 30 THEN 'Need to cal'
                           WHEN tbl_station.station != tbl_storage.station THEN 'Not match Station'
                           ELSE rec_eqs.status
                       END AS equipment_status
                FROM rec_eqs
                LEFT JOIN tbl_station ON rec_eqs.id_station = tbl_station.stationID
                LEFT JOIN tbl_station AS tbl_storage ON rec_eqs.id_storage = tbl_storage.stationID
                WHERE rec_eqs.active_status = 1 AND rec_eqs.active_use = 1 
                AND (rec_eqs.id_station = :id OR rec_eqs.id_storage = :id)
                ORDER BY rec_eqs.id_station, rec_eqs.type";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([":id" => $id]);
        sendResponse(200, 'Success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    function getUtilizationSummary($dbh, $id) {
        $sql = "SELECT CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 15 DAY),'%e %b %Y'), ' - ', DATE_FORMAT(CURDATE(),'%e %b %Y')) AS ut_day,
                IFNULL((SELECT ROUND(SUM(duration_sec) / (86400*15) * 100, 2) FROM (
                    SELECT machine_status, TIMESTAMPDIFF(SECOND, create_at, IFNULL(LEAD(create_at) OVER (PARTITION BY station_id ORDER BY create_at), NOW())) AS duration_sec
                    FROM machine_status_history WHERE station_id = :id AND create_at >= CURDATE() - INTERVAL 15 DAY
                ) t WHERE machine_status = 'Run'), 0) AS utilization,
                IFNULL((SELECT ROUND(AVG(run_minutes), 2) FROM (
                    SELECT TIMESTAMPDIFF(MINUTE, up_at, LEAD(down_at) OVER (PARTITION BY station_id ORDER BY down_at)) AS run_minutes
                    FROM machine_problem WHERE station_id = :id AND up_at IS NOT NULL
                ) t WHERE run_minutes IS NOT NULL), 0) AS MTBF,
                IFNULL((SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE, down_at, up_at)), 2) FROM machine_problem 
                    WHERE station_id = :id AND down_at >= CURDATE() - INTERVAL 15 DAY AND up_at IS NOT NULL), 0) AS MTTR";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([":id" => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $row['utilization'] = (float)$row['utilization'];
            $row['MTBF'] = (float)$row['MTBF'];
            $row['MTTR'] = (float)$row['MTTR'];
        }
        sendResponse(200, 'Success', $row);
    }

    function getStatusDetail($dbh, $id) {
        $sql = "SELECT cur.machine_status AS status, mp.problem, mp.cause_of_problem, tbl_alert.member AS alert_by, tbl_verify.member AS verify_by,
                       DATE_FORMAT(mp.down_at, '%d %b %Y %H:%i') AS response_down,
                       CONCAT(
                           IF(FLOOR(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW()))/525600) > 0, CONCAT(FLOOR(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW()))/525600), 'y '), ''),
                           IF(FLOOR(MOD(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW())), 525600)/43200) > 0, CONCAT(FLOOR(MOD(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW())), 525600)/43200), 'm '), ''),
                           IF(FLOOR(MOD(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW())), 43200)/1440) > 0, CONCAT(FLOOR(MOD(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW())), 43200)/1440), 'd '), ''),
                           IF(FLOOR(MOD(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW())), 1440)/60) > 0, CONCAT(FLOOR(MOD(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW())), 1440)/60), 'h '), ''),
                           IF(MOD(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW())), 60) > 0, CONCAT(MOD(ABS(TIMESTAMPDIFF(MINUTE, mp.down_at, NOW())), 60), 'm'), '0m')
                       ) AS duedate_diff
                FROM machine_status_current AS cur
                LEFT JOIN machine_problem AS mp ON cur.machine_problem_id = mp.machine_problem_id
                LEFT JOIN tbl_member AS tbl_alert  ON mp.alert_by = tbl_alert.memberID
                LEFT JOIN tbl_member AS tbl_verify ON mp.verify_by = tbl_verify.memberID
                WHERE cur.active_status = 1 AND cur.station_id = :id";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([":id" => $id]);
        sendResponse(200, 'Success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    function getReadinessDetail($dbh, $id) {
        $sql = "SELECT 
                    CASE WHEN pm.pm_duedate > NOW() THEN 'Done' ELSE 'Overdue' END AS PM,
                    CASE WHEN IFNULL(eq.overdue,0) = 0 THEN 'OK' ELSE 'Overdue' END AS eqs,
                    CASE WHEN z.result_all='Pass' THEN 'Run' ELSE 'No Production' END AS rec_z_chart,
                    CASE WHEN z.result_all='Pass' AND pm.pm_duedate > NOW() AND ut.status IN('Run','Idle') AND IFNULL(eq.overdue,0) = 0 THEN 'Ready' ELSE 'Not Ready' END AS readiness
                FROM rec_ut ut
                LEFT JOIN rec_z_chart z ON ut.id_station = z.id_station AND z.active_status=1
                LEFT JOIN rec_pm_station pm ON ut.id_station = pm.id_station AND pm.active_status=1
                LEFT JOIN (
                    SELECT id_station, COUNT(*) as overdue FROM rec_eqs
                    WHERE active_status=1 AND active_use=1 AND status NOT LIKE '%Ship%' 
                    AND status NOT IN('Cancelled','Send Cal Hana','Extend','Extension','Scrap')
                    AND cal_duedate!='0000-00-00 00:00:00'
                    AND IF(extension_duedate!='0000-00-00 00:00:00',extension_duedate,cal_duedate) < NOW()
                    GROUP BY id_station
                ) eq ON ut.id_station = eq.id_station
                WHERE ut.id_station = :id AND ut.active_status=1 LIMIT 1";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([":id" => $id]);
        sendResponse(200, 'Success', $stmt->fetch(PDO::FETCH_ASSOC));
    }

    function getTestTimeline() {
        $data = [
            ["status" => "RUN", "serial" => "12546", "start" => "07:00", "usetime" => 25],
            ["status" => "Idle", "serial" => "NA", "start" => "07:26", "usetime" => 15],
            ["status" => "RUN", "serial" => "12547", "start" => "07:42", "usetime" => 30],
            ["status" => "Maintenance", "serial" => "12546", "start" => "08:13", "usetime" => 20],
            ["status" => "RUN", "serial" => "12548", "start" => "08:34", "usetime" => 40],
            ["status" => "Idle", "serial" => "NA", "start" => "09:15", "usetime" => 10],
            ["status" => "RUN", "serial" => "12546", "start" => "09:26", "usetime" => 35],
            ["status" => "Maintenance", "serial" => "12547", "start" => "10:02", "usetime" => 25],
            ["status" => "RUN", "serial" => "12548", "start" => "10:28", "usetime" => 50],
            ["status" => "Idle", "serial" => "NA", "start" => "11:19", "usetime" => 20]
        ];
        sendResponse(200, 'Success', $data);
    }
?>