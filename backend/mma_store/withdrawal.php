<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route      = getAction('withdrawal');
    $action     = $route['action'];
    $id         = $route['id'];

    /* =====================================================
    DEFAULT ROUTE (/withdrawal)
    ===================================================== */
    if (!$action) {
            sendResponse(400, 'Error', 'Action Fail');
        exit;
    }


    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'model': model($id);   break;
            case 'withdrawal': userUpdate($id);   break;
            default:
                sendResponse(400, 'Error', 'Action Fail');
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }


    function model($id){ global $dbh; global $web_base;

        $sql="SELECT spare_id AS id, category, model, description, for_product,  part_number, minimum_stock, onhand, storage,purchasing,
            CONCAT('".$web_base."','model/ID',spare_id ,'.jpg?v=',UNIX_TIMESTAMP()) AS image
            FROM mma_spare 
            WHERE spare_id = :id
        ";
        $stmt=$dbh->prepare($sql);
        $stmt->execute([":id" => $id]);
        $data=$stmt->fetch(PDO::FETCH_ASSOC); 

        if($data) {
            response(200, 'Spare Details api success', $data);
        } else {
            response(404, 'Not Found');
        }
    }


 
    /* ===============================
    USER UPDATE
    =============================== */
    function userUpdate($id) { global $dbh;

        if (!$id) response(400, 'Missing ID');
        
        $data = requestData();
        // ตรวจสอบทั้งจาก JSON และ $_POST (FormData)
        $qty = intval($data['WithdrawQuantity'] ?? $_POST['WithdrawQuantity'] ?? 0);
        $memberID = $data['memberID'] ?? $_POST['memberID'] ?? null;

        $UseFor = $data['UseFor'] ?? $_POST['UseFor'] ?? null;
        
        if ($qty <= 0) response(400, 'Invalid quantity: ' . $qty);

        try {
            $dbh->beginTransaction();
            
            // 1. ตักข้อมูลเดิมมาตรวจสอบ (Lock row)
            $sql_old = "SELECT onhand FROM mma_spare WHERE spare_id = :id FOR UPDATE";
            $stmt_old = $dbh->prepare($sql_old);
            $stmt_old->execute([":id" => $id]);
            $oldData = $stmt_old->fetch(PDO::FETCH_ASSOC);

            if (!$oldData) {
                $dbh->rollBack();
                response(404, "Spare ID $id not found in inventory.");
                return;
            }

            $oldonhand = intval($oldData['onhand']);
            
            if ($oldonhand < $qty) {
                $dbh->rollBack();
                response(400, "Not enough stock. (Available: $oldonhand, Request: $qty)");
                return;
            }

            $newonhand = $oldonhand - $qty;
            
            // 2. อัปเดตจำนวนคงเหลือ
            $sql_add = "UPDATE mma_spare SET onhand = :onhand, created_by = :created_by, update_at = NOW() WHERE spare_id = :id";
            $stmt_add = $dbh->prepare($sql_add);
            $stmt_add->execute([
                ":onhand"     => $newonhand,
                ":created_by" => $memberID,
                ":id"         => $id
            ]);

            // ตรวจสอบว่ามีการอัปเดตจริงหรือไม่
            if ($stmt_add->rowCount() === 0) {
                // ถ้า rowCount เป็น 0 อาจหมายถึง spare_id ไม่ตรง หรือ ข้อมูลที่จะอัปเดตเท่ากับค่าเดิม (ซึ่งกรณีนี้เป็นไปไม่ได้เพราะเราลบค่าออก)
                $dbh->rollBack();
                response(400, "Update failed: No rows affected for spare_id $id. Please verify table schema.");
                return;
            }
            
            // 3. บันทึกประวัติการเบิก
            $sql_log = "INSERT INTO mma_spare_transaction (spare_id, order_header, quantity, use_for, create_at, created_by) 
                        VALUES (:spare_id, 'Withdraw', :quantity,   :use_for, NOW(), :created_by)";
            $stmt_log = $dbh->prepare($sql_log);
            $stmt_log->execute([
                ':spare_id'   => $id,
                ':quantity'   => $qty,
                ':use_for'     => $UseFor,   
                ':created_by' => $memberID
            ]);
            
            $dbh->commit();

            response(200, [
                "message"   => "Withdrawal successful",
                "id"        => $id,
                "old_stock" => $oldonhand,
                "remaining" => $newonhand
            ]);

        } catch (Exception $e) {
            if ($dbh->inTransaction()) $dbh->rollBack();
            response(500, "Database Error: " . $e->getMessage());
        }
    }




?>