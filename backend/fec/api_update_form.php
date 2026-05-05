<?php
    include '../db/db.php';
  

    define('ROOT_PATH', dirname(__DIR__, 2));

    require_once ROOT_PATH . '/public/class_api/select_class.php';

    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=utf-8');
    date_default_timezone_set('Asia/Bangkok');

    $fetcher = new DataFetcher($dbh);
?>



<?php
    /* =====================================================
    Product
    ===================================================== */
    if (isset($_GET['function']) && $_GET['function'] === 'product') {

        $ID = isset($_GET['ID']) ? (int)$_GET['ID'] : 0;
        $result = [];

        if ($ID > 0) {
            $sqlMain = "SELECT DISTINCT product AS id, product FROM rec_fct WHERE fctID = :ID";
            $result = array_merge(
                $result,
                $fetcher->getData($sqlMain, 'id', 'product', ['ID' => $ID])
            );
        }

        $sqlSub = "SELECT DISTINCT product AS id, product FROM rec_fct ORDER BY product";

        $result = array_merge(
            $result,
            $fetcher->getData($sqlSub, 'id', 'product')
        );

        echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
?>


<?php
    /* =====================================================
    Fuse
    ===================================================== */
    if (isset($_GET['function']) && $_GET['function'] === 'fuse') {

        $ID = isset($_GET['ID']) ? (int)$_GET['ID'] : 0;
        $result = [];

        if ($ID > 0) {
            $sqlMain = "SELECT DISTINCT fuse AS id, fuse FROM rec_fct WHERE fctID = :ID";
            $result = array_merge(
                $result,
                $fetcher->getData($sqlMain, 'id', 'fuse', ['ID' => $ID])
            );
        }

        $sqlSub = "SELECT DISTINCT fuse AS id, fuse FROM rec_fct ORDER BY fuse";

        $result = array_merge(
            $result,
            $fetcher->getData($sqlSub, 'id', 'fuse')
        );

        echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
?>


<?php
    /* =====================================================
    Fuse rework
    ===================================================== */
    if (isset($_GET['function']) && $_GET['function'] === 'fuse_rework') {

        $ID = isset($_GET['ID']) ? (int)$_GET['ID'] : 0;
        $result = [];

        if ($ID > 0) {
            $sqlMain = "SELECT DISTINCT fuse_rework AS id, fuse_rework FROM rec_fct WHERE fctID = :ID";
            $result = array_merge(
                $result,
                $fetcher->getData($sqlMain, 'id', 'fuse_rework', ['ID' => $ID])
            );
        }

        $sqlSub = "SELECT DISTINCT fuse_rework AS id, fuse_rework FROM rec_fct ORDER BY fuse_rework";

        $result = array_merge(
            $result,
            $fetcher->getData($sqlSub, 'id', 'fuse_rework')
        );

        echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
?>


<?php
    /* =====================================================
    Station
    ===================================================== */
    if (isset($_GET['function']) && $_GET['function'] === 'station') {

        $ID = isset($_GET['ID']) ? (int)$_GET['ID'] : 0;
        $result = [];

        if ($ID > 0) {
            $sqlMain = "SELECT stationID AS id, station 
                FROM rec_fct
                LEFT JOIN tbl_station ON rec_fct.id_station = tbl_station.stationID
                WHERE fctID = :ID";
            $result = array_merge(
                $result,
                $fetcher->getData($sqlMain, 'id', 'station', ['ID' => $ID])
            );
        }
        $result[] = [
            'id'      => '',
            'station' => ''
        ];
        
        $sqlSub = "SELECT DISTINCT tbl_station.stationID AS id, tbl_station.station 
                FROM tbl_station 
                LEFT JOIN tbl_phase ON tbl_station.id_phase = tbl_phase.phaseID
                LEFT JOIN tbl_group ON tbl_phase.id_group   = tbl_group.groupID
                WHERE tbl_group.groupID = 1 AND 
                    (
                    tbl_station.station LIKE 'CIVET%' OR 
                    tbl_station.station LIKE 'ZORRO%' OR 
                    tbl_station.station LIKE 'Waimea%' OR 
                    tbl_station.station LIKE 'Testbed%'
                    )
            ORDER BY tbl_station.station";

        $result = array_merge(
            $result,
            $fetcher->getData($sqlSub, 'id', 'station')
        );

        echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
?>

<?php
   /* =====================================================
    Send to
    ===================================================== */
    if (isset($_GET['function']) && $_GET['function'] === 'send_to') {
        try {
            $id = $_GET['ID'] ?? 0;

            if ($id == 0) {
                $data = [
                    ['id' => '',          'send_to' => ''],
                    ['id' => 'Register',  'send_to' => 'Register'],
                ];
            } else {
                $sql = "SELECT status FROM rec_fct WHERE fctID = :fctID";
                $stmt = $dbh->prepare($sql);
                $stmt->bindParam(':fctID', $id, PDO::PARAM_INT);
                $stmt->execute();

                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $status = $row['status'] ?? '';

                if ($status === 'Rework' || $status === 'ShipOut') {
                    $data = [
                        ['id' => 'Rework',   'send_to' => 'Rework'],
                        ['id' => 'ShipOut',  'send_to' => 'ShipOut'],
                        ['id' => 'Received', 'send_to' => 'Received'],
                        ['id' => 'KeepOnStore', 'send_to' => 'KeepOnStore'],
                    ];
                } else {

                
                    $data = [
                        ['id' => $status,       'send_to' => $status],
                        ['id' => '',            'send_to' => ''],
                        ['id' => 'Good',        'send_to' => 'Good'],
                        ['id' => 'Fail',        'send_to' => 'Fail'],
                        ['id' => 'Rework',      'send_to' => 'Rework'],
                        ['id' => 'ShipOut',     'send_to' => 'ShipOut'],
                        ['id' => 'KeepOnStore', 'send_to' => 'KeepOnStore'],
                    ];
                }
            }

            echo json_encode($data, JSON_UNESCAPED_UNICODE);

        } catch (PDOException $e) {
            echo json_encode(['error' => "Database Error: " . $e->getMessage()]);
        }
    }
?>


<?php
  /* =====================================================
    Load from
    ===================================================== */
    if (isset($_GET['function']) && $_GET['function'] === 'load_from') {
        try {
            $id = $_GET['ID'] ?? 0;

            $sql = "SELECT fctID, serial, board_no, faillures, root_cause, disposition, remark, active
                    FROM rec_fct 
                    WHERE fctID = :fctID";

            $stmt = $dbh->prepare($sql);
            $stmt->bindParam(':fctID', $id, PDO::PARAM_INT);
            $stmt->execute();

            $jsons = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($jsons as &$row) {
                $row['active'] = (int)$row['active'];
            }

            echo json_encode($jsons, JSON_UNESCAPED_UNICODE);

        } catch (PDOException $e) {
            echo json_encode(['error' => "Database Error: " . $e->getMessage()]);
        }
    }
?>



<?php
    /* =====================================================
    Update
    ===================================================== */
    $_POST = json_decode(file_get_contents("php://input"), true);
    if (isset($_POST['function']) && $_POST['function'] === 'update') {
        try {
            $date_time_now = date('Y-m-d H:i:s');
            $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

            // 🧩 รับค่าจาก form
            $board_no      = $_POST['board_no'] ?? '';
            $serial        = $_POST['serial'] ?? '';
            $product       = $_POST['product'] ?? '';
            $status        = $_POST['status'] ?? '';
            $active        = $_POST['active'] ?? 1;
            $control       = $_POST['control'] ?? 1;
            $id_station    = $_POST['station'] ?? null;
            $fuse          = $_POST['fuse'] ?? '';
            $fuse_rework   = $_POST['fuse_rework'] ?? '';
            $faillures     = $_POST['faillures'] ?? '';
            $root_cause    = $_POST['root_cause'] ?? '';
            $disposition   = $_POST['disposition'] ?? '';
            $remark        = $_POST['remark'] ?? '';
            $send_to       = $_POST['send_to'] ?? '';

            $status_to_save = $send_to ?: $status; // ✅ ใช้ send_to ถ้ามีค่า

            $stmt_check = $dbh->prepare("SELECT COUNT(*) as count FROM rec_fct WHERE fctID = ?");
            $stmt_check->execute([$id]);
            $row = $stmt_check->fetch(PDO::FETCH_ASSOC);
            $count = $row['count'] ?? 0;

            if ($count > 0) {
                // 🔄 UPDATE
                $sql = "UPDATE rec_fct SET
                            board_no      = ?,
                            serial        = ?,
                            product       = ?,
                            status        = ?, 
                            active        = ?, 
                            control       = ?, 
                            id_station    = ?, 
                            fuse          = ?, 
                            fuse_rework   = ?, 
                            faillures     = ?, 
                            root_cause    = ?, 
                            disposition   = ?, 
                            remark        = ?, 
                            last_update   = ?
                        WHERE fctID = ?";
                
                $params = [
                    $board_no, $serial, $product, $status_to_save, $active, $control, $id_station,
                    $fuse, $fuse_rework, $faillures, $root_cause, $disposition, $remark,
                    $date_time_now, $id
                ];

            } else {
                // 🆕 INSERT
                $sql = "INSERT INTO rec_fct (
                            board_no, serial, product, status, active, control, id_station,
                            fuse, fuse_rework, faillures, root_cause, disposition, remark,
                            last_update
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $params = [
                    $board_no, $serial, $product, $status_to_save, $active, $control, $id_station,
                    $fuse, $fuse_rework, $faillures, $root_cause, $disposition, $remark,
                    $date_time_now
                ];
            }

            $stmt = $dbh->prepare($sql);
            $success = $stmt->execute($params);

            if ($success) {
                // ✅ ถ้าส่งต่อไป "Received"
                if (($send_to === 'Received' || $send_to === 'Rework' ) && $count > 0) {
                    try {
                        $sql_copy = "INSERT INTO rec_fct (
                            board_no, serial, product, status, active, fuse, last_update
                        )
                        SELECT 
                            board_no, serial, product, 'Good', active, fuse, ?
                        FROM rec_fct WHERE fctID = ?";

                        $stmt_copy = $dbh->prepare($sql_copy);
                        $copy_success = $stmt_copy->execute([$date_time_now, $id]);

                        if ($copy_success) {
                            // 🔕 ปิด active record เดิม
                            $sql_deactivate = "UPDATE rec_fct SET active = 0 WHERE fctID = ?";
                            $stmt_deact = $dbh->prepare($sql_deactivate);
                            $stmt_deact->execute([$id]);
                        } else {
                            echo json_encode([
                                'msg' => "<div class='alert alert-danger'>Copy record error</div>",
                                'status_return' => 401,
                                'error' => $stmt_copy->errorInfo()
                            ]);
                            exit;
                        }
                    } catch (PDOException $copyErr) {
                        echo json_encode([
                            'msg' => "Copy failed: " . $copyErr->getMessage(),
                            'status_return' => 401
                        ]);
                        exit;
                    }
                }

                echo json_encode([
                    'msg' => "<div class='alert alert-success'>Record saved successfully</div>",
                    'status_return' => 200,
                    'sql' => $sql
                ]);

            } else {
                echo json_encode([
                    'msg' => "<div class='alert alert-danger'>Record save error</div>",
                    'status_return' => 401,
                    'error' => $stmt->errorInfo()
                ]);
            }

        } catch (PDOException $e) {
            echo json_encode(['msg' => "Connection failed: " . $e->getMessage(), 'status_return' => 401]);
        }
    }
?>

