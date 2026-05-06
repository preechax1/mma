<?php
require_once 'core_helper.php';

/* =====================================================
    ROUTER LOGIC
   ===================================================== */
$route = getAction('record');
$action = $route['action'];
$id     = $route['id'];

if (!$action) {
    sendResponse(400, 'Error', 'Route Fail');
}

try {
    switch ($action) {
        case 'records':   getAllRecords($dbh); break;
        case 'recordsn':  getRecordSerial($dbh, $id); break;
        case 'recordid':  getRecordById($dbh, $id); break;
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

// สร้างฟังก์ชันช่วยดึง SQL พื้นฐานเพื่อลดการเขียนซ้ำ
function getBaseSQL() {
    return "SELECT rec_fct.*,
            IF(rec_fct.last_update ='0000-00-00 00:00:00','',
                DATE_FORMAT(rec_fct.last_update, '%d-%b-%Y')) AS date_update,
            tbl_found_id_tech.member AS found_tech,
            tbl_id_tb.member AS tech_tb,
            tbl_station.station
        FROM rec_fct 
            LEFT JOIN tbl_member AS tbl_found_id_tech ON rec_fct.found_id_tech = tbl_found_id_tech.memberID
            LEFT JOIN tbl_member AS tbl_id_tb       ON rec_fct.id_tb = tbl_id_tb.memberID
            LEFT JOIN tbl_station                    ON rec_fct.id_station = tbl_station.stationID";
}

function getAllRecords($dbh) {
    $sql = getBaseSQL() . " WHERE rec_fct.active = 1";
    $stmt = $dbh->prepare($sql);
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC); // ใช้ fetchAll แทน while loop เพื่อความกระชับ
    sendResponse(200, 'Success', $data);
}

function getRecordSerial($dbh, $serial) {
    if (!$serial) {
        sendResponse(400, 'Error', 'Missing Serial parameter');
        return;
    }
    $sql = getBaseSQL() . " WHERE rec_fct.serial = :serial";
    $stmt = $dbh->prepare($sql);
    $stmt->bindParam(':serial', $serial);
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(200, 'Success', $data);
}

function getRecordById($dbh, $id) {
    if (!$id) {
        sendResponse(400, 'Error', 'Missing ID parameter');
        return;
    }   

    $sql = getBaseSQL() . " WHERE rec_fct.fctID = :id";
    $stmt = $dbh->prepare($sql);    
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($data) {
        sendResponse(200, 'Success', $data);
    } else {
        sendResponse(404, 'Error', 'Record not found');
    }
}