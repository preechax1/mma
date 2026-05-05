<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER LOGIC (URL Segments)
    ===================================================== */
    $route = getAction('ManageStation');
    $action = $route['action'];
    $id = $route['id'];

    if (!$action) {
        sendResponse(400, 'Action not specified');
    }

    /* =====================================================
    ROUTE MAP
    ===================================================== */
    switch ($action) {
        case 'stationstatus': 
            getStationStatus($dbh, $id); 
            break;
        case 'update_status': 
            updateStationStatus($dbh); 
            break;
        default:
            echo json_encode(["status" => 0, "message" => "Function '$action' not found"]);
            break;
    }

    /* =====================================================
    FUNCTIONS
    ===================================================== */

    function getStationStatus($dbh, $id) {
        try {
            $sql = "SELECT 
                        s.stationID,
                        s.station,
                        CASE 
                            WHEN s.active_status = 1 AND c.active_status = 1 THEN 'ON'
                            WHEN s.active_status = 1 AND c.active_status = 0 THEN 'No Register'
                            WHEN s.active_status = 0 AND c.active_status = 1 THEN 'Error EOL'
                            WHEN s.active_status = 0 AND c.active_status = 0 THEN 'EOL'
                            ELSE 'EOL' 
                        END AS registration_status,
                        COALESCE(c.active_status, 0) AS current_active,
                        COALESCE(c.machine_status, 'Offline') AS machine_status
                    FROM tbl_station s
                    LEFT JOIN machine_status_current c ON s.stationID = c.station_id
                    LEFT JOIN tbl_phase p ON s.id_phase = p.phaseID 
                    LEFT JOIN tbl_group g ON p.id_group = g.groupID  
                    WHERE g.id_customer = 1 ";

            $params = [];
            if (!empty($id)) {
                $sql .= " AND s.stationID = :id";
                $params[':id'] = $id;
            }

            $stmt = $dbh->prepare($sql);
            $stmt->execute($params);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => 1, 
                "message" => "Success", 
                "data" => $results 
            ]);
        } catch (Exception $e) {
            echo json_encode(["status" => 0, "message" => "SQL Error"]);
        }
    }

    function updateStationStatus($dbh) {
        // รับค่าจาก JSON Body (เนื่องจากฝั่ง React ส่งเป็น JSON)
        $input  = json_decode(file_get_contents("php://input"), true);
        $id     = $input['id'] ?? '';
        $status = $input['status'] ?? '';

        if (empty($id) || empty($status)) {
            echo json_encode(["status" => 0, "message" => "Missing ID or Status"]);
            exit;
        }

        try {
            $active_val = ($status === 'ON') ? 1 : 0;

            $sql = "UPDATE machine_status_current 
                    SET active_status = :active 
                    WHERE station_id = :id";
            
            $stmt = $dbh->prepare($sql);
            $result = $stmt->execute([
                'active' => $active_val,
                'id' => $id
            ]);

            echo json_encode([
                "status" => 1, 
                "message" => "Update Status to $status Success",
                "updated_id" => $id
            ]);
        } catch (Exception $e) {
            echo json_encode(["status" => 0, "message" => "Update Error"]);
        }
    }

?>