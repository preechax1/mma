<?php
    require_once 'core_helper.php';
    require_once 'manage_file.php';

    /* =====================================================
    ROUTER LOGIC (URL Segments)
    ===================================================== */
    $route = getAction('downhistory');
    $action = $route['action'];
    $id = $route['id'];

    if (!$action) {
        sendResponse(400, 'Error', 'Route Fail');
    }

    /* =====================================================
    ROUTE MAP
    ===================================================== */
    switch ($action) {
        case 'all_list':    getAllHistory($dbh); break;
        case 'get_files':   getFiles($id, $base_dir, $web_base); break;
        case 'upload':      UploadFiles($id, $base_dir, $web_base); break;
        case 'remove_file': RemoveFiles($id, $base_dir, $web_base); break;
        default:
            sendResponse(400, 'Error', 'Route Action Fail');
        break;
    }

    /* =====================================================
    FUNCTIONS
    ===================================================== */

    function getAllHistory($dbh) {
        $sql = "SELECT 
                mp.machine_problem_id AS utID,
                IF(mp.up_at IS NULL, 'Down', 'Up') AS status,
                mp.problem AS problem_found,
                mp.failure_category,
                mp.cause_of_problem,
                mp.corrective_action,
                IF(mp.down_at IS NULL OR mp.down_at = '0000-00-00 00:00:00', '', 
                    DATE_FORMAT(mp.down_at, '%Y-%b-%d %T')) AS response_down,
                IF(mp.up_at IS NULL OR mp.up_at = '0000-00-00 00:00:00', '', 
                    DATE_FORMAT(mp.up_at, '%Y-%b-%d %T')) AS response_up,
                DATE_FORMAT(mp.update_at, '%d-%b-%Y') AS last_update,
                DATE_FORMAT(mp.down_at, '%d-%b-%Y') AS ut_date,
                tbl_station.station,
                tbl_station.stationID,
                tbl_station.product,
                tbl_member.member
            FROM machine_problem AS mp
            LEFT JOIN tbl_station ON mp.station_id = tbl_station.stationID
            LEFT JOIN tbl_member  ON mp.alert_by = tbl_member.memberID
            WHERE 1
            ORDER BY mp.machine_problem_id DESC";

        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        sendResponse(200, 'Success', $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    function getFiles($id, $base_dir, $web_base) {
        listFiles($id, $base_dir, $web_base);
    }

    function UploadFiles($id, $base_dir, $web_base) {
        uploadFile($id, $base_dir, $web_base);
    }

    function RemoveFiles($id, $base_dir, $web_base) {
        deleteFile($id, $base_dir, $web_base);
    }

?>