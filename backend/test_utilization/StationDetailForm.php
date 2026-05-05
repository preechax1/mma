<?php
    require_once 'core_helper.php';

    /* =====================================================
    ROUTER LOGIC (URL Segments)
    ===================================================== */
    $route = getAction('StationDetailForm');
    $action = $route['action'];
    $id = $route['id'];

    if (!$action) {
        sendResponse(400, 'Action not specified');
    }

    /* =====================================================
    ROUTE MAP
    ===================================================== */
    switch ($action) {
        case 'stationstatus':   getStationStatus($dbh, $id); break;
        case 'equipment':       getEquipment($dbh, $id); break;
        case 'stationupdate':   updateStationDetail($dbh, $base_dir); break;
        case 'FailurePareto':   getFailurePareto($dbh); break; // สมมติว่ามีฟังก์ชันนี้
        case 'TopDowntime':     getTopDowntime($dbh); break;   // สมมติว่ามีฟังก์ชันนี้
        case 'table_station':   getTableStation($dbh); break;  // สมมติว่ามีฟังก์ชันนี้
        default:
            echo json_encode(["status" => 0, "message" => "Action '$action' not found"]);
            break;
    }

    /* =====================================================
    FUNCTIONS
    ===================================================== */

    function getStationStatus($dbh, $id) {
        if (!$id) { echo json_encode(["status" => 0, "message" => "ID required"]); exit; }
        
        $data = [];
        // 1. ดึงข้อมูลสถานะปัจจุบัน
        $sql = "SELECT s.stationID, s.station, s.product, c.machine_status AS status,
                    p.problem, p.cause_of_problem, p.corrective_action, p.failure_category
                FROM tbl_station s
                LEFT JOIN machine_status_current c ON s.stationID = c.station_id
                LEFT JOIN machine_problem p ON p.machine_problem_id = (
                    SELECT mp.machine_problem_id FROM machine_problem mp 
                    WHERE mp.station_id = s.stationID ORDER BY mp.machine_problem_id DESC LIMIT 1
                )
                WHERE s.stationID = :id LIMIT 1";

        $stmt = $dbh->prepare($sql);
        $stmt->execute([":id" => $id]);
        $data['description'] = $stmt->fetch(PDO::FETCH_ASSOC);

        $current_status = $data['description']['status'] ?? '';

        // 2. Dropdown Options (Inner Helper Function)
        $getOpts = function($col) use ($dbh, $data, $current_status) {
            $sql = "SELECT DISTINCT $col FROM machine_problem WHERE $col IS NOT NULL AND $col <> '' ORDER BY $col LIMIT 50";
            $stmt = $dbh->prepare($sql); $stmt->execute();
            $list = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $curr_val = $data['description'][$col] ?? '';
            if($current_status == 'Down' && !empty($curr_val)){
                $list = array_values(array_unique(array_merge([$curr_val], $list)));
            } else {
                array_unshift($list, '');
                $list = array_values(array_unique($list));
            }
            return $list;
        };

        $data['problem_options'] = $getOpts('problem');
        $data['cause_options']   = $getOpts('cause_of_problem');
        $data['action_options']  = $getOpts('corrective_action');
        $data['failure_options'] = $getOpts('failure_category');

        // 3. Status Options
        $stmt = $dbh->prepare("SELECT DISTINCT machine_status FROM machine_status_history WHERE machine_status IS NOT NULL ORDER BY machine_status");
        $stmt->execute();
        $status_list = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if($current_status) $status_list = array_values(array_unique(array_merge([$current_status], $status_list)));
        
        $data['status_options'] = $status_list;

        echo json_encode($data);
    }

    function updateStationDetail($dbh, $base_dir) {
        try {
            // รับค่าจาก $_POST (เนื่องจากส่งเป็น FormData จากหน้าบ้าน)
            $id                = $_POST['stationID'] ?? ''; 
            $machine_status    = $_POST['status'] ?? '';
            $problem           = $_POST['problem'] ?? '';
            $cause_of_problem  = $_POST['cause_of_problem'] ?? '';
            $corrective_action = $_POST['corrective_action'] ?? '';
            $failure_category  = $_POST['failure_category'] ?? '';

            // ค้นหา record ล่าสุด
            $sql_check = "SELECT machine_current_id, machine_problem_id, machine_status 
                FROM machine_status_current 
                WHERE active_status = 1 AND station_id = :id 
                ORDER BY update_at DESC LIMIT 1";
            $stmt = $dbh->prepare($sql_check);
            $stmt->execute([":id" => $id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$data) { throw new Exception("Station not found"); }

            $machine_current_id = $data['machine_current_id'];
            $current_prob_id    = $data['machine_problem_id'];
            $machine_status_old = $data['machine_status'];

            // logic การเปลี่ยนสถานะ
            $status_down_group = ['Down', 'DOWN', 'DOWN EQUIPMENT', 'Setup', 'TE_Use'];
            $status_up_group   = ['Run', 'RUN', 'Idle', 'IDLE'];
            $activity_status   = 'same';

            if ($machine_status !== $machine_status_old) {
                if (in_array($machine_status, $status_down_group) && in_array($machine_status_old, $status_up_group)) $activity_status = 'Down';
                elseif (in_array($machine_status, $status_up_group) && in_array($machine_status_old, $status_down_group)) $activity_status = 'Up';
                else $activity_status = 'Update';
            }

            // จัดการ machine_problem
            if ($activity_status === 'Up') {
                if ($current_prob_id) {
                    $sql = "UPDATE machine_problem SET problem=:p, cause_of_problem=:c, corrective_action=:a, failure_category=:f, up_at=NOW(), update_at=NOW() WHERE machine_problem_id=:pid";
                    $dbh->prepare($sql)->execute([":p"=>$problem, ":c"=>$cause_of_problem, ":a"=>$corrective_action, ":f"=>$failure_category, ":pid"=>$current_prob_id]);
                }
                $current_prob_id = NULL;
            } elseif ($activity_status === 'Down') {
                $sql = "INSERT INTO machine_problem (station_id, problem, cause_of_problem, corrective_action, failure_category, down_at, update_at) VALUES (:sid, :p, :c, :a, :f, NOW(), NOW())";
                $stmt = $dbh->prepare($sql);
                $stmt->execute([":sid"=>$id, ":p"=>$problem, ":c"=>$cause_of_problem, ":a"=>$corrective_action, ":f"=>$failure_category]);
                $current_prob_id = $dbh->lastInsertId();
            } elseif (!empty($current_prob_id)) {
                $sql = "UPDATE machine_problem SET problem=:p, cause_of_problem=:c, corrective_action=:a, failure_category=:f, update_at=NOW() WHERE machine_problem_id=:pid";
                $dbh->prepare($sql)->execute([":p"=>$problem, ":c"=>$cause_of_problem, ":a"=>$corrective_action, ":f"=>$failure_category, ":pid"=>$current_prob_id]);
            }

            // Update Current & History
            $dbh->prepare("UPDATE machine_status_current SET machine_problem_id=:pid, machine_status=:s, update_at=NOW() WHERE machine_current_id=:cid")->execute([":pid"=>$current_prob_id, ":s"=>$machine_status, ":cid"=>$machine_current_id]);
            $dbh->prepare("INSERT INTO machine_status_history (station_id, machine_status, create_at) VALUES (:sid, :s, NOW())")->execute([":sid"=>$id, ":s"=>$machine_status]);

            // File Upload
            if (!empty($_FILES)) {
                $target_dir = rtrim($base_dir, '/') . "/ID" . $machine_current_id;
                if (!is_dir($target_dir)) mkdir($target_dir, 0755, true);
                foreach ($_FILES as $file) {
                    $tmp_names = (array)$file['tmp_name'];
                    $names = (array)$file['name'];
                    foreach ($tmp_names as $k => $tmp) {
                        if ($tmp != "") {
                            $fn = time() . "_" . preg_replace("/[^a-zA-Z0-9.]/", "_", basename($names[$k]));
                            move_uploaded_file($tmp, $target_dir . "/" . $fn);
                        }
                    }
                }
            }

            echo json_encode(["status" => 1, "message" => $machine_status_old . ' to ' . $machine_status . ' is ' . $activity_status ]);
        } catch (Exception $e) {
            echo json_encode(["status" => 0, "message" => $e->getMessage()]);
        }
    }

    function getEquipment($dbh, $id) {
        // ... (ยกโค้ด SQL เดิมของคุณมาใส่ในนี้)
        // แล้วปิดท้ายด้วย echo json_encode($result);
    }

?>