<?php
require_once 'core_helper.php';

/* =====================================================
    ROUTER LOGIC
   ===================================================== */
$route = getAction('updateform');
$action = $route['action'];
$id     = $route['id'];

if (!$action) {
    sendResponse(400, 'Error', 'Route Fail');
}

try {
    switch ($action) {
        case 'recordnew': getNewRecord(); break;
        case 'detailfec': getDetailFEC($dbh, $id); break;
        case 'recordsn':  getRecordSerial($dbh, $id); break;
        case 'recordid':  getRecordById($dbh, $id); break;
        case 'options':   getOptions($dbh); break;
        case 'save':      saveData($dbh); break;
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
            tbl_station.station,tbl_station.stationID
        FROM rec_fct 
            LEFT JOIN tbl_member AS tbl_found_id_tech ON rec_fct.found_id_tech = tbl_found_id_tech.memberID
            LEFT JOIN tbl_member AS tbl_id_tb       ON rec_fct.id_tb = tbl_id_tb.memberID
            LEFT JOIN tbl_station                    ON rec_fct.id_station = tbl_station.stationID";
}

function getDataRecord($dbh, $id) {
    $sql = getBaseSQL() . " WHERE rec_fct.active = 1 AND rec_fct.fctID = :id";
    $stmt = $dbh->prepare($sql);
    $stmt->bindParam(':id', $id);   
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(200, 'Success', $data);
}


function getNewRecord() {
    $newRecord = [
        'fctID' => null,
        'serial' => '',
        'id_station' => null,
        'id_tb' => null,
        'found_id_tech' => null,
        'date_update' => '',
        'station' => '',
        'tech_tb' => '',
        'found_tech' => ''
    ];
    sendResponse(200, 'Success', $newRecord);
}



function getDetailFEC($dbh, $id) {
    $sql = getBaseSQL() . " WHERE rec_fct.fctID = :id";
    $stmt = $dbh->prepare($sql);
    $stmt->bindParam(':id', $id);   
    $stmt->execute();

    // ดึงข้อมูลแถวแรกออกมา
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        sendResponse(404, 'Data not found', null);
        return;
    }


    $current_product = $row['product'];
    $product_list = [
        ['id' => $current_product, 'value' => $current_product]
    ];

    // 2. ดึงรายการ Product ทั้งหมดจาก Database
    $sql_product = "SELECT DISTINCT product FROM rec_fct WHERE product IS NOT NULL ORDER BY product ASC";
    $stmt_product = $dbh->prepare($sql_product);
    $stmt_product->execute();

    // 3. วนลูปเพื่อเก็บค่าลงใน $product_list
    while ($p_row = $stmt_product->fetch(PDO::FETCH_ASSOC)) {
        if ($p_row['product'] !== $current_product) {
            $product_list[] = [
                'id'    => $p_row['product'],
                'value' => $p_row['product']
            ];
        }
    }


    
    $current_station = $row['station'];
    $current_station_id = $row['stationID'];
    $station_list = [
        ['id' => $current_station_id, 'value' => $current_station]
    ];

    // 2. ดึงรายการ Station ทั้งหมดจาก Database
    $sql_station = "SELECT DISTINCT station, stationID FROM tbl_station WHERE active_status = 1 AND (station LIKE 'Zorro%' OR station LIKE 'Tofino%' OR station LIKE 'CIVET%' )  ORDER BY station ASC";
    $stmt_station = $dbh->prepare($sql_station);
    $stmt_station->execute();

    // 3. วนลูปเพื่อเก็บค่าลงใน $station_list
    while ($s_row = $stmt_station->fetch(PDO::FETCH_ASSOC)) {
        if ($s_row['stationID'] !== $current_station_id) {
            $station_list[] = [
                'id'    => $s_row['stationID'],
                'value' => $s_row['station']
            ];
        }
    }



    // 2. Modify Fuse Setup
    $current_fuse = $row['fuse'];
    $current_fuse_text = ($current_fuse == 1) ? 'Yes' :  'No';   

    $modify_fuse_list = [
        ['id' => $current_fuse, 'value' => $current_fuse_text],
        ['id' => '', 'value' => ''],
        ['id' => 0, 'value' => 'No'],
        ['id' => 1, 'value' => 'Yes']
    ];

    // 3. Fuse Rework Setup
    $current_rework = $row['fuse_rework'];
    $fuse_rework_list = [
        ['id' => $current_rework, 'value' => $current_rework],
        ['id' => '', 'value' => ''],
        ['id' => 0, 'value' => 0],
        ['id' => 1, 'value' => 1],
        ['id' => 2, 'value' => 2],
        ['id' => 3, 'value' => 3],
        ['id' => 4, 'value' => 4] 
    ];

    // 4. Sent To Setup (แก้ไขจาก JSON เป็น PHP Array)
    $current_status = $row['status'];
    $sent_to_list = [
        ['id' => $current_status, 'value' => $current_status],
        ['id' => '', 'value' => ''],
        ['id' => 'Good', 'value' => 'Good'],
        ['id' => 'Fail', 'value' => 'Fail'],
        ['id' => 'Rework', 'value' => 'Rework'],
        ['id' => 'ShipOut', 'value' => 'ShipOut'],
        ['id' => 'KeepOnStore', 'value' => 'KeepOnStore'],
        ['id' => 'Receive', 'value' => 'Receive']
    ];

    $data_all = [
        'detail' => $row,
        'product' => $product_list,
        'modify_fuse' => $modify_fuse_list,
        'fuse_rework' => $fuse_rework_list,
        'station' => $station_list,
        'sent_to' => $sent_to_list
    ];

    sendResponse(200, 'Success', $data_all);
}


    




















 
function getOptions($dbh) {
    // 1. Product List
    $sql_product = "SELECT DISTINCT product FROM rec_fct WHERE product IS NOT NULL ORDER BY product ASC";
    $stmt_product = $dbh->prepare($sql_product);
    $stmt_product->execute();
    $product_list = [['id' => '', 'value' => '']];
    while ($p_row = $stmt_product->fetch(PDO::FETCH_ASSOC)) {
        $product_list[] = ['id' => $p_row['product'], 'value' => $p_row['product']];
    }

    // 2. Station List
    $sql_station = "SELECT DISTINCT station, stationID FROM tbl_station WHERE active_status = 1 AND (station LIKE 'Zorro%' OR station LIKE 'Tofino%' OR station LIKE 'CIVET%' ) ORDER BY station ASC";
    $stmt_station = $dbh->prepare($sql_station);
    $stmt_station->execute();
    $station_list = [['id' => '', 'value' => '']];
    while ($s_row = $stmt_station->fetch(PDO::FETCH_ASSOC)) {
        $station_list[] = ['id' => $s_row['stationID'], 'value' => $s_row['station']];
    }

    // 3. Modify Fuse Setup
    $modify_fuse_list = [
        ['id' => '', 'value' => ''],
        ['id' => 0, 'value' => 'No'],
        ['id' => 1, 'value' => 'Yes']
    ];

    // 4. Fuse Rework Setup
    $fuse_rework_list = [
        ['id' => '', 'value' => ''],
        ['id' => 0, 'value' => 0],
        ['id' => 1, 'value' => 1],
        ['id' => 2, 'value' => 2],
        ['id' => 3, 'value' => 3],
        ['id' => 4, 'value' => 4] 
    ];

    // 5. Sent To Setup
    $sent_to_list = [
        ['id' => '', 'value' => ''],
        ['id' => 'Good', 'value' => 'Good'],
        ['id' => 'Fail', 'value' => 'Fail'],
        ['id' => 'Rework', 'value' => 'Rework'],
        ['id' => 'ShipOut', 'value' => 'ShipOut'],
        ['id' => 'KeepOnStore', 'value' => 'KeepOnStore'],
        ['id' => 'Receive', 'value' => 'Receive']
    ];

    $data = [
        'product' => $product_list,
        'modify_fuse' => $modify_fuse_list,
        'fuse_rework' => $fuse_rework_list,
        'station' => $station_list,
        'sent_to' => $sent_to_list
    ];

    sendResponse(200, 'Success', $data);
}

function saveData($dbh) {
    $_POST = json_decode(file_get_contents("php://input"), true);
    $date_time_now = date('Y-m-d H:i:s');
    
    $id            = $_POST['id'] ?? null;
    $board_no      = $_POST['board_no'] ?? '';
    $serial        = $_POST['serial'] ?? '';
    $product       = $_POST['product'] ?? '';
    $status        = $_POST['status'] ?? '';
    $active        = $_POST['active'] ?? 1;
    $id_station    = $_POST['id_station'] ?? null;
    $fuse          = $_POST['fuse'] ?? '';
    $fuse_rework   = $_POST['fuse_rework'] ?? '';
    $faillures     = $_POST['faillures'] ?? '';
    $root_cause    = $_POST['root_cause'] ?? '';
    $disposition   = $_POST['disposition'] ?? '';
    $remark        = $_POST['remark'] ?? '';
    $memberID      = $_POST['memberID'] ?? null;

    if ($id && $id !== "") {
        // --- 1. สั่ง UPDATE ข้อมูลเดิมก่อนตามที่คุณต้องการ ---
        $sql = "UPDATE rec_fct SET
                    board_no = ?, serial = ?, product = ?, status = ?, active = ?, 
                    id_station = ?, fuse = ?, fuse_rework = ?, faillures = ?, 
                    root_cause = ?, disposition = ?, remark = ?, id_tb = ?, last_update = ?
                WHERE fctID = ?";
        $params = [
            $board_no, $serial, $product, $status, $active, $id_station, 
            $fuse, $fuse_rework, $faillures, $root_cause, $disposition, 
            $remark, $memberID, $date_time_now, $id
        ];

        $stmt = $dbh->prepare($sql);
        $success = $stmt->execute($params);

        // --- 2. ตรวจสอบเงื่อนไขพิเศษเพื่อสร้าง Record ใหม่ ---
        if ($success && ($status == 'Receive' || $status == 'Rework')) { 
            // ปิดตัวเก่า
            $updateOld = $dbh->prepare("UPDATE rec_fct SET active = 0 WHERE fctID = ?");
            $updateOld->execute([$id]);

            // สร้างตัวใหม่ (ใช้ค่า 'Good' ตามที่คุณเขียน)
            $sqlNew = "INSERT INTO rec_fct (
                        board_no, serial, product, status, active, 
                        fuse, found_id_tech, last_update
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $paramsNew = [$board_no, $serial, $product, 'Good', 1, $fuse, $memberID, $date_time_now];

            $stmt = $dbh->prepare($sqlNew);
            $success = $stmt->execute($paramsNew);
            
            // เปลี่ยน $id เป็น null เพื่อให้ lastInsertId() ส่งค่า ID ของตัวใหม่กลับไป
            $id = null; 
        }

    } else {
        // --- กรณี INSERT ข้อมูลใหม่ (ไม่มี ID) ---
        $sql = "INSERT INTO rec_fct (
                    board_no, serial, product, status, active, id_station, 
                    fuse, fuse_rework, faillures, root_cause, disposition, 
                    remark, found_id_tech, last_update
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $params = [
            $board_no, $serial, $product, $status, $active, $id_station, 
            $fuse, $fuse_rework, $faillures, $root_cause, $disposition, 
            $remark, $memberID, $date_time_now
        ];

        $stmt = $dbh->prepare($sql);
        $success = $stmt->execute($params);
    }

    if ($success) {
        sendResponse(200, 'Saved successfully', ['id' => $id ?: $dbh->lastInsertId()]);
    } else {
        sendResponse(500, 'Failed to save record', $stmt->errorInfo());
    }
}