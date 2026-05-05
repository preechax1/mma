<?php
    include '../db/db.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=utf-8');
    date_default_timezone_set('Asia/Bangkok');
?>

<?php
    if (isset($_GET['function']) && $_GET['function'] === 'data_table') {
        try {
            $last_time = date('Y-m-d G:h:i');

            // ================== Build WHERE condition ==================
            if (isset($_GET['history']) && $_GET['history'] == 0) {
                $history = 0;
                $sql_history = ' rec_fct.active = 1 ';
            } else {
                $history = 1;
                $serial = $_GET['serial'];
                $sql_history = " rec_fct.serial = '$serial' ";
            }

            // ================== SQL Query ==================
            $sql = "SELECT rec_fct.*, '$history' AS history,
                IF(rec_fct.last_update ='0000-00-00 00:00:00','',
                    DATE_FORMAT(rec_fct.last_update, '%d-%b-%Y')) AS date_update,
                tbl_found_id_tech.member AS found_tech,
                tbl_id_tb.member AS tech_tb,
                tbl_station.station
            FROM rec_fct 
                LEFT JOIN tbl_member AS tbl_found_id_tech ON rec_fct.found_id_tech = tbl_found_id_tech.memberID
                LEFT JOIN tbl_member AS tbl_id_tb       ON rec_fct.id_tb = tbl_id_tb.memberID
                LEFT JOIN tbl_station                     ON rec_fct.id_station = tbl_station.stationID
            WHERE $sql_history";

            $stmt = $dbh->prepare($sql);
            $stmt->execute();
            $jsons = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($jsons, JSON_UNESCAPED_UNICODE);
            $dbh = null;

        } catch (PDOException $e) {
            echo json_encode(['error' => "Database Error: " . $e->getMessage()]);
        }
    }
?>
