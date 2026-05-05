<?php
    require_once 'core_helper.php';

    /* =====================================================
        ROUTER LOGIC (URL Segments)
    ===================================================== */
    $route  = getAction('history');
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
            case 'serial':      getSerial($dbh, $id); break; 
            case 'serial_id':   getSerial_id($dbh, $id); break; 
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

    function getSerial($dbh, $id) {
        $sql = "SELECT rec_fct.*,
                IF(rec_fct.last_update IS NULL OR rec_fct.last_update = '0000-00-00 00:00:00', 
                '', 
                DATE_FORMAT(rec_fct.last_update, '%d-%b-%Y')) AS date_update,
                tbl_found_id_tech.member AS found_tech,
                tbl_id_tb.member AS tech_tb,
                tbl_station.station
            FROM rec_fct 
                LEFT JOIN tbl_member AS tbl_found_id_tech ON rec_fct.found_id_tech = tbl_found_id_tech.memberID
                LEFT JOIN tbl_member AS tbl_id_tb       ON rec_fct.id_tb = tbl_id_tb.memberID
                LEFT JOIN tbl_station                   ON rec_fct.id_station = tbl_station.stationID
            WHERE rec_fct.serial = :id";

        $stmt = $dbh->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$data) {
            sendResponse(404, 'Serial Not Found', []);
            return;
        }

        sendResponse(200, 'Success', $data);
    }

    function getSerial_id($dbh, $id) {
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
            WHERE rec_fct.fctID = :id";
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