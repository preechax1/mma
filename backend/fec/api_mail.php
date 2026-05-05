<?php
    include '../db/db.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    date_default_timezone_set('Asia/Bangkok');
    $date_now  = date('Y-m-d H:i:s');
    $day_now   = date('d-M-Y');
?>


<?php
    if (isset($_GET['function']) && $_GET['function'] == 'fec_fail') {
        try {
            $jsons = array();

            $sql = "SELECT rec_fct.*,
                    IF(rec_fct.last_update ='0000-00-00 00:00:00','',DATE_FORMAT(rec_fct.last_update, '%d-%b-%Y')) AS date_update,
                    tbl_found_id_tech.member AS found_tech,
                    tbl_id_tb.member AS tech_tb,
                    tbl_station.station
                FROM rec_fct 
                    LEFT JOIN tbl_member AS tbl_found_id_tech ON rec_fct.found_id_tech = tbl_found_id_tech.memberID
                    LEFT JOIN tbl_member AS tbl_id_tb ON rec_fct.id_tb = tbl_id_tb.memberID
                    LEFT JOIN tbl_station ON rec_fct.id_station = tbl_station.stationID
                WHERE rec_fct.active = 1 
                    AND rec_fct.control = 1 
                    AND rec_fct.status = 'Fail' 
                    AND (rec_fct.status != 'Keep on Store' AND rec_fct.status != 'Ship out to repair')
                ORDER BY rec_fct.product";

            $stmt = $dbh->prepare($sql);
            $stmt->execute();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $jsons[] = $row;
            }

            echo json_encode($jsons);
            $dbh = null;

        } catch (PDOException $e) {
            echo json_encode(array('error' => $e->getMessage()));
            die();
        }
    }
?>
