<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
date_default_timezone_set("Asia/Bangkok");

// ✅ ปรับให้เป็น path สัมพัทธ์สำหรับ Docker
$base_dir = __DIR__ . "/../uploads/fec/";

// ✅ สร้าง Full URL สำหรับให้ Frontend (คนละ Port) แสดงรูปได้
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];
$web_base = $protocol . "://" . $host . "/uploads/fec/";

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
        mkdir($target_dir, 0777, true);
    }

    if (!empty($_FILES['fileupload']['name'][0])) {

        foreach ($_FILES['fileupload']['tmp_name'] as $key => $tmp_name) {
            $file_name = basename($_FILES['fileupload']['name'][$key]);
            move_uploaded_file($tmp_name, $target_dir . "/" . $file_name);
        }

        echo json_encode(["status" => 1, "message" => "Upload success"]);
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