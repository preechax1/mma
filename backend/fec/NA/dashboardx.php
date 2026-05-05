<?php
    include '../db/db.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    date_default_timezone_set('Asia/Bangkok');
    $date_now = date('Y-m-d G:h:i');
    $day_now = date('d-M-Y');
?>


<?php
    if (isset($_GET['function']) && $_GET['function'] == 'status_tab') {
        try {
            $jsons = array();

            $sql = "SELECT status,SUM(CASE WHEN (active = 1 AND control = 1) THEN 1 ELSE 0 END) AS total
                FROM rec_fct
                WHERE active = 1 AND control = 1
                GROUP BY status
            ";

            $stmt = $dbh->prepare($sql);
            $stmt->execute();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $jsons[] = $row;
            }

            echo json_encode($jsons, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        } catch (PDOException $e) {
            echo json_encode(['error' => "Error: " . $e->getMessage()]);
        } finally {
            $dbh = null;
        }
    }
?>


<?php 
    if (isset($_GET['function']) && $_GET['function'] === 'status_card') {

        try {
            $fec_type = isset($_GET['fec_type']) ? trim($_GET['fec_type']) : '';

            if ($fec_type === '') {
                echo json_encode(['error' => 'Missing parameter: fec_type']);
                exit;
            }
            $sql = "SELECT status, SUM(active = 1) AS total
                FROM rec_fct
                WHERE active = 1 AND product = :fec_type GROUP BY status
            ";

            $stmt = $dbh->prepare($sql);
            $stmt->bindParam(':fec_type', $fec_type, PDO::PARAM_STR);
            $stmt->execute();

            $jsons = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($jsons, JSON_UNESCAPED_UNICODE);

            $dbh = null;

        } catch (PDOException $e) {
            echo json_encode(['error' => 'Database Error: ' . $e->getMessage()]);
        }
    }
?>
