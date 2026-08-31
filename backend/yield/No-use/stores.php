<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER
    ===================================================== */
    $route      = getAction('stores');
    $action     = $route['action'];
    $id         = $route['id'];

    /* =====================================================
    DEFAULT ROUTE (/stores)
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
            case 'main': historyspare($dbh);   break;
            case 'categories': categories(); break;
            case 'models': models(); break;
            case 'model': model($id);   break;
            default:
                sendResponse(400, 'Error', 'Action Fail');
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }



   
    function categories(){

        global $dbh;

         $sql="SELECT DISTINCT category, spare_id AS id, model,
            description,
            part_number,
            minimum_stock,
            onhand,
            storage 
        FROM mma_spare
        ORDER BY category
        ";

        $stmt=$dbh->prepare($sql);
        $stmt->execute();

        $data=$stmt->fetchAll(PDO::FETCH_ASSOC);

        response(200,'Spare Categories api success',$data);

    }

     function models(){

        global $dbh; global $web_base;
        

         $sql="SELECT DISTINCT category,
            spare_id AS id,
            model,
            description,
            part_number,
            minimum_stock,
            onhand,
            storage,
            CONCAT('".$web_base."','model/ID',spare_id ,'.jpg?v=',UNIX_TIMESTAMP()) AS image
        FROM mma_spare
        ORDER BY category
        ";

        $stmt=$dbh->prepare($sql);
        $stmt->execute();

        $data=$stmt->fetchAll(PDO::FETCH_ASSOC);

        response(200,'Spare Models api success',$data);

    }

    function model($id){ global $dbh; global $web_base;

        $sql="SELECT spare_id AS id, category, model, description, part_number, minimum_stock, onhand, storage,
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




?>