<?php
    require_once 'core_helper.php';

    /* =====================================================
        ROUTER LOGIC (URL Segments)
    ===================================================== */
    $route  = getAction('records');
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
            case 'boards':  getBoards($dbh);        break; 
            case 'board':   getBoard($dbh, $id);    break; 
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

    function getBoards($dbh) {
        $sql = "SELECT rec_fct.*,
                IF(rec_fct.last_update ='0000-00-00 00:00:00','',
                    DATE_FORMAT(rec_fct.last_update, '%d-%b-%Y')) AS date_update,
                tbl_found_id_tech.member AS found_tech,
                tbl_id_tb.member AS tech_tb,
                tbl_station.station
            FROM rec_fct 
                LEFT JOIN tbl_member AS tbl_found_id_tech ON rec_fct.found_id_tech = tbl_found_id_tech.memberID
                LEFT JOIN tbl_member AS tbl_id_tb       ON rec_fct.id_tb = tbl_id_tb.memberID
                LEFT JOIN tbl_station                     ON rec_fct.id_station = tbl_station.stationID
            WHERE rec_fct.active = 1";
        $stmt = $dbh->prepare($sql);
        $stmt->execute();
        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }
        sendResponse(200, 'Success', $data);
    }

    function getBoard($dbh, $id) {
        $sql = "SELECT rec_fct.*,
                IF(rec_fct.last_update ='0000-00-00 00:00:00','',
                    DATE_FORMAT(rec_fct.last_update, '%d-%b-%Y')) AS date_update,
                tbl_found_id_tech.member AS found_tech,
                tbl_id_tb.member AS tech_tb,
                tbl_station.station
            FROM rec_fct 
                LEFT JOIN tbl_member AS tbl_found_id_tech ON rec_fct.found_id_tech = tbl_found_id_tech.memberID
                LEFT JOIN tbl_member AS tbl_id_tb       ON rec_fct.id_tb = tbl_id_tb.memberID
                LEFT JOIN tbl_station                     ON rec_fct.id_station = tbl_station.stationID
            WHERE rec_fct.active = 1 AND rec_fct.fctID = :id";
        $stmt = $dbh->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }
        sendResponse(200, 'Success', $data);
    }
  
?>