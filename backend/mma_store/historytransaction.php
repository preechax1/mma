<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route  = getAction('historytransaction');
    $action = $route['action'];
    $id         = $route['id'];

    /* =====================================================
    DEFAULT ROUTE (/historytransaction)
    ===================================================== */
    if (!$action) {
        historytransaction();
        exit;
    }


    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'main': historytransaction($dbh);   break;
            case 'upload_file': upload_file($id); break;
            default:
                sendResponse(400, 'Error', 'Action Fail');
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }


function historytransaction(){
    global $dbh;

    // แก้ไขจุดที่ 1: เพิ่ม tran.spare_id เข้าไปใน SELECT
    $sql = "SELECT 
                tran.order_id, 
                tran.spare_id, 
                DATE_FORMAT(tran.create_at, '%d %b %Y') AS create_at, 
                tran.order_header, 
                tbl_member.member AS username, 
                mma_spare.model, 
                mma_spare.category, 
                tran.order_header AS action, 
                tran.quantity, 
                tran.use_for
            FROM mma_spare_transaction tran
            LEFT JOIN mma_spare ON tran.spare_id = mma_spare.spare_id 
            LEFT JOIN tbl_member ON tran.created_by = tbl_member.memberID 
            ORDER BY tran.order_id DESC";

    $stmt = $dbh->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // แก้ไขจุดที่ 2: ตั้งชื่อตัวแปรให้ตรงกัน
    $diskPath = "D:/Storage_MMA_TE/WebAppData/DataFile/spare/store/"; // Path จริงในเครื่อง
    $webPath = "/web_upload/spare/store/"; // Path ที่ใช้เรียกผ่าน Browser

    foreach ($rows as $key => $row) {
        // ดึง spare_id มาสร้างชื่อ Folder (เช่น ID27)
        $folderName = "ID" . $row['order_id']; 
        $targetDir = $diskPath . $folderName;
        $fileUrls = [];

        if (is_dir($targetDir)) {
            $files = scandir($targetDir);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    // ตรวจสอบว่าเป็นไฟล์จริงๆ ไม่ใช่โฟลเดอร์ซ้อน
                    if (is_file($targetDir . '/' . $file)) {
                        $fileUrls[] = $webPath . $folderName . "/" . $file;
                    }
                }
            }
        }

        // เก็บ URL ไฟล์ทั้งหมดลงใน Array
        $rows[$key]['real_files'] = $fileUrls;
        
        // กรองเอาเฉพาะรูปภาพไฟล์แรกมาเป็น Thumbnail
        $imageOnly = array_values(preg_grep("/\.(jpg|jpeg|png|gif)$/i", $fileUrls));
        $rows[$key]['image'] = (!empty($imageOnly)) ? $imageOnly[0] : null;
    }

    sendResponse(200, 'History Spare api success', $rows);
}


function upload_file($id){
    $rows = [
        ['order_id' => $id] 
    ];

    $diskPath = "D:/Storage_MMA_TE/WebAppData/DataFile/spare/store/"; 
    $webPath = "/web_upload/spare/store/"; 

    foreach ($rows as $key => $row) {
        $folderName = "ID" . $row['order_id']; 
        $targetDir = $diskPath . $folderName;
        $fileUrls = [];

        if (is_dir($targetDir)) {
            $files = scandir($targetDir);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    if (is_file($targetDir . '/' . $file)) {
                        $fileUrls[] = $webPath . $folderName . "/" . $file;
                    }
                }
            }
        }

        $rows[$key]['real_files'] = $fileUrls;
        
        $imageOnly = array_values(preg_grep("/\.(jpg|jpeg|png|gif)$/i", $fileUrls));
        $rows[$key]['image'] = (!empty($imageOnly)) ? $imageOnly[0] : null;
    }

    sendResponse(200, 'History Spare api success', $rows);
}

?>