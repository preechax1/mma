<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

header("Content-Type: application/json");
date_default_timezone_set("Asia/Bangkok");

// ✅ ปรับให้เป็น path สัมพัทธ์สำหรับ Docker DEV
// $base_dir = __DIR__ . "/../web_upload/fec/";

// ✅ สร้าง Full URL สำหรับให้ Frontend (คนละ Port) แสดงรูปได้
// $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
// $host = $_SERVER['HTTP_HOST'];
// $web_base = $protocol . "://" . $host . "/web_upload/fec/";


$base_dir = "D:/Storage_MMA_TE/WebAppData/DataFile/fec";
$web_base = "/web_upload/fec";

$function = $_REQUEST['function'] ?? '';

/* ===============================
   LIST FILES
================================ */
if ($function === "get_files") {

    $id = $_GET['id'] ?? '';
    $folder = "ID" . $id;
    $dir = $base_dir . $folder;

    $result = [];

    if (is_dir($dir)) {
        $files = scandir($dir);

        foreach ($files as $file) {
            if ($file === "." || $file === "..") continue;

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            $safe = str_replace([' ', '#'], ['%20', '%23'], $file);

            $result[] = [
                "name" => $file,
                "file_url" => $web_base . $folder . "/" . $safe,
                "full_path" => $dir . "/" . $file,
                "ext" => $ext
            ];
        }
    }

    echo json_encode($result);
    exit;
}

/* ===============================
   UPLOAD FILE
================================ */
if ($function === "upload") {

    $id = $_POST['id'] ?? '';
    $folder = "ID" . $id;
    $target_dir = $base_dir . $folder;

    if (!is_dir($target_dir)) {
        if (!mkdir($target_dir, 0777, true)) {
            echo json_encode(["status" => 0, "message" => "Failed to create directory. Path might be incorrect."]);
            exit;
        }
    }

    if (!empty($_FILES['fileupload']['name'][0])) {

        $success_count = 0;
        foreach ($_FILES['fileupload']['tmp_name'] as $key => $tmp_name) {
            if ($tmp_name) {
                $file_name = basename($_FILES['fileupload']['name'][$key]);
                if (move_uploaded_file($tmp_name, $target_dir . "/" . $file_name)) {
                    $success_count++;
                }
            }
        }

        if ($success_count > 0) {
            echo json_encode(["status" => 1, "message" => "Upload success"]);
        } else {
            echo json_encode(["status" => 0, "message" => "Upload failed. Check permissions or path."]);
        }
    } else {
        echo json_encode(["status" => 0, "message" => "No file"]);
    }

    exit;
}

/* ===============================
   DELETE FILE
================================ */
if ($function === "remove_file") {

    $path = $_POST['name'] ?? '';

    if ($path && file_exists($path)) {
        unlink($path);
        echo json_encode(["status" => 1]);
    } else {
        echo json_encode(["status" => 0]);
    }

    exit;
}