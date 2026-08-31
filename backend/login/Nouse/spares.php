<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route      = getAction('spares');
    $action     = $route['action'];
    $id         = $route['id'];

    /* =====================================================
    DEFAULT ROUTE (/spares)
    ===================================================== */

    if (!$action) {
        all_list();
        exit;
    }


    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'all_list': all_list();    break;
            case 'model': model($id);       break;

            case 'create': create_spare();      break;
            case 'receive': receive_spare($id);   break;
            case 'update': update_spare($id);   break;
            case 'delete': delete_spare($id);   break;


            default:
                sendResponse(400, 'Error', 'Action Fail');
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }

 

    /* ===============================
        Create
    =============================== */
    
    function create_spare(){ global $dbh; global$base_dir;

        $data = requestData();

        $sql = "INSERT INTO mma_spare(
             category,   model,  part_number,  minimum_stock,  onhand,  storage,  spare_type, active_status ) VALUES(
            :category,  :model, :part_number, :minimum_stock, :onhand, :storage, :spare_type, 1             )
        ";

        $stmt = $dbh->prepare($sql);

        $stmt->bindParam(':category',       $data['category'],      PDO::PARAM_STR);
        $stmt->bindParam(':model',          $data['model'],         PDO::PARAM_STR);
        $stmt->bindParam(':part_number',    $data['part_number'],   PDO::PARAM_STR);
        $stmt->bindParam(':minimum_stock',  $data['minimum_stock'], PDO::PARAM_INT);
        $stmt->bindParam(':onhand',         $data['onhand'],        PDO::PARAM_INT);
        $stmt->bindParam(':storage',        $data['storage'],       PDO::PARAM_STR);
        $stmt->bindParam(':spare_type',     $data['spare_type'],    PDO::PARAM_STR);

        $stmt->execute();
        $id = $dbh->lastInsertId();

        /* ================= upload image ================= */

        if(isset($_FILES['image']) && $_FILES['image']['tmp_name'] != ''){
            $uploadDir  = $base_dir . "/model/";
            $fileName   = "ID".$id.".jpg";
            $targetFile = $uploadDir.$fileName;
            move_uploaded_file($_FILES['image']['tmp_name'], $targetFile);
        }

        response(201,[
            "message"=>"Spare created",
            "id"=>$id
        ]);
    }



    /* ===============================
    Spare Read All
    =============================== */

    function all_list(){

        global $dbh; global $web_base;

         $sql="SELECT spare_id AS id, category, model, spare_type, description, part_number, onhand, minimum_stock, storage,
                CONCAT('".$web_base."','model/ID',spare_id ,'.jpg?v=',UNIX_TIMESTAMP()) AS image
            FROM mma_spare 
            ORDER BY category
        ";

        $stmt=$dbh->prepare($sql);
        $stmt->execute();

        $data=$stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(200,'History Spare api success',$data);

    }

    function receive_spare($id) { global $dbh; global$base_dir;
        if (!$id) response(400, 'Missing ID');
        
        $qty = intval($_POST['ReceiveQuantity'] ?? 0);
        $memberID = $_POST['memberID'] ?? null;

        if ($qty <= 0) response(400, 'Invalid quantity');

        try {
            $dbh->beginTransaction();
            
            $sql_old = "SELECT onhand FROM mma_spare WHERE spare_id = :id FOR UPDATE";
            $stmt_old = $dbh->prepare($sql_old);
            $stmt_old->execute([":id" => $id]);
            $oldData = $stmt_old->fetch(PDO::FETCH_ASSOC);

            if (!$oldData) throw new Exception('Spare not found');

            $newonhand = ($oldData['onhand'] ?? 0) + $qty;
            
            $sql_upd = "UPDATE mma_spare SET onhand = :onhand, created_by = :created_by, update_at = NOW() WHERE spare_id = :id";
            $stmt_upd = $dbh->prepare($sql_upd);
            $stmt_upd->execute([
                ":onhand"     => $newonhand,
                ":created_by" => $memberID,
                ":id"         => $id
            ]);
            
            $sql_log = "INSERT INTO mma_spare_transaction(spare_id, order_header, quantity, create_at, created_by) 
                        VALUES (:id, 'Receive', :qty, NOW(), :user)";
            $stmt_log = $dbh->prepare($sql_log);
            $stmt_log->execute([
                ':id'   => $id,
                ':qty'  => $qty,
                ':user' => $memberID
            ]);
            
            $id_insert = $dbh->lastInsertId();
            
            if (isset($_FILES['attachments'])) {
                $baseDir = $base_dir . "/store/ID" . $id_insert . "/";
                if (!is_dir($baseDir)) mkdir($baseDir, 0775, true);

                foreach ($_FILES['attachments']['tmp_name'] as $k => $tmp) {
                    if ($_FILES['attachments']['error'][$k] === 0) {
                        
                        $ext = pathinfo($_FILES['attachments']['name'][$k], PATHINFO_EXTENSION);
                        $safeFileName = time() . "_" . $k . "." . $ext;
                        
                        move_uploaded_file($tmp, $baseDir . $safeFileName);
                    }
                }
            }

            $dbh->commit();
            response(200, ["message" => "Spare received successfully", "id" => $id]);

        } catch (Exception $e) {
            if ($dbh->inTransaction()) $dbh->rollBack();
            response(500, $e->getMessage());
        }
    }

    /* ===============================
    ADMIN UPDATE
    =============================== */

    function update_spare($id){  global $dbh; global$base_dir;

        if(!$id){response(400,'Missing ID');}
        $data = requestData();

        $sql = "UPDATE mma_spare SET
            category        = :category,
            model           = :model,
            part_number     = :part_number,
            minimum_stock   = :minimum_stock,
            onhand          = :onhand,
            storage         = :storage,
            description     = :description,
            spare_type      = :spare_type
            WHERE spare_id  = :id
        ";
        $stmt = $dbh->prepare($sql);
      
        $stmt->execute([
            ":category"         => $data['category']        ?? '',
            ":model"            => $data['model']           ?? '',
            ":part_number"      => $data['part_number']     ?? '',
            ":minimum_stock"    => $data['minimum_stock']   ?? 0,
            ":onhand"           => $data['onhand']          ?? 0,
            ":storage"          => $data['storage']         ?? '',
            ":description"      => $data['description']     ?? '',
            ":spare_type"       => $data['spare_type']      ?? '',
            ":id"               => $id
        ]);

            /* upload image */
        if(isset($_FILES['image']) && $_FILES['image']['tmp_name'] != ''){
            $uploadDir = $base_dir . "/model/";
            $fileName  = "ID".$id.".jpg";
            move_uploaded_file($_FILES['image']['tmp_name'],$uploadDir.$fileName);
        }

        response(200,[
            "message"=>"Spare updated",
            "id"=>$id
        ]);
    }


  

    function delete_spare($id){

        if(!$id){
            response(400,'Missing ID');
        }

        global $dbh;

        $stmt=$dbh->prepare("DELETE FROM mma_spare WHERE spare_id =:id");
        $stmt->execute([":id"=>$id]);

        $stmt2=$dbh->prepare("DELETE FROM mma_spare WHERE spare_id =:id");
        $stmt2->execute([":id"=>$id]);

        response(200,'Spare deleted');

    }



 


?>