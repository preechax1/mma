<?php
 
    /* =====================================================
    CONTROLLER FUNCTIONS
    ===================================================== */

    function listFiles($id, $base_dir, $web_base) {
        if (!$id) sendResponse(400, 'Missing ID');

        $folder = "ID_" . $id;
        $dir = rtrim($base_dir, "/\\") . DIRECTORY_SEPARATOR . $folder;

        $result = [];
        if (is_dir($dir)) {
            $files = array_diff(scandir($dir), array('.', '..'));
            foreach ($files as $file) {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                $result[] = [
                    "name"     => $file,
                    "file_url" => $web_base . $folder . "/" . rawurlencode($file),
                    "ext"      => $ext,
                    "size"     => round(filesize($dir . DIRECTORY_SEPARATOR . $file) / 1024, 2) . ' KB'
                ];
            }
        }
        sendResponse(200, 'Success', $result);
    }


    function uploadFile($id, $base_dir) {
        // รับ ID จาก URL หรือจาก FormData ก็ได้
        $target_id = $id ?? $_POST['id'] ?? null;
        if (!$target_id) sendResponse(400, 'Missing ID');

        $target_dir = rtrim($base_dir, "/\\") . DIRECTORY_SEPARATOR . "ID_" . $target_id;

        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        if (!empty($_FILES['file'])) {
            $file = $_FILES['file'];
            // จัดการกรณี Single หรือ Multiple Files
            $names     = is_array($file['name']) ? $file['name'] : [$file['name']];
            $tmp_names = is_array($file['tmp_name']) ? $file['tmp_name'] : [$file['tmp_name']];

            $success_count = 0;
            foreach ($names as $key => $name) {
                $clean_name = basename($name);
                $target_path = $target_dir . DIRECTORY_SEPARATOR . $clean_name;
                if (move_uploaded_file($tmp_names[$key], $target_path)) {
                    $success_count++;
                }
            }
            sendResponse(200, "Uploaded $success_count file(s) successfully");
        } else {
            sendResponse(400, 'No file found in request');
        }
    }

    function deleteFile($id, $base_dir) {
        // รับค่าจาก POST (JSON หรือ FormData)
        $data = json_decode(file_get_contents('php://input'), true);
        $filename = $data['name'] ?? $_POST['name'] ?? null;
        
        if (!$id || !$filename) {
            sendResponse(400, 'ID and File Name are required');
        }

        $clean_name = basename($filename);
        $target_file = rtrim($base_dir, "/\\") . DIRECTORY_SEPARATOR . "ID_" . $id . DIRECTORY_SEPARATOR . $clean_name;

        if (file_exists($target_file)) {
            if (unlink($target_file)) {
                sendResponse(200, 'File deleted successfully');
            } else {
                sendResponse(500, 'Failed to delete file');
            }
        } else {
            sendResponse(404, 'File not found on server');
        }
    }