<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'core_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

header("Content-Type: application/json");
date_default_timezone_set("Asia/Bangkok");
 

$function = $_REQUEST['function'] ?? '';

/* ===============================
   LIST FILES
================================ */
if ($function === "get_files") {

    $id     = $_GET['id'] ?? '';
    $folder = "ID" . $id;

    $dir        = $base_dir . "/" . $folder;
    $base_dir   = $base_dir . "/" . $folder;
    $web_base  = $web_base . "/" . $folder;


    $result = [];

    if (is_dir($dir)) {
        $files = scandir($dir);

        foreach ($files as $file) {
            if ($file === "." || $file === "..") continue;

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            $safe = str_replace([' ', '#'], ['%20', '%23'], $file);

            $result[] = [
                "name" => $file,
                "file_url" => $web_base  . "/" . $safe,
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
    $target_dir = $base_dir .  "/" . $folder;

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
   UPLOAD SPARE IMAGE
================================ */
if ($function === "upload_image") {

    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $file = $_FILES['file'] ?? null;

    if (!$id || !$file || $file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
        echo json_encode(["status" => 0, "message" => "Invalid spare image upload"]);
        exit;
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($extension, $allowedExtensions, true)) {
        echo json_encode(["status" => 0, "message" => "Unsupported image type"]);
        exit;
    }

    $targetDir = $base_dir . "/model";
    if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true)) {
        echo json_encode(["status" => 0, "message" => "Failed to create image directory"]);
        exit;
    }

    $targetFile = $targetDir . "/ID" . $id . ".jpg";
    if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
        echo json_encode(["status" => 0, "message" => "Failed to save spare image"]);
        exit;
    }

    echo json_encode([
        "status" => 1,
        "message" => "Spare image uploaded",
        "id" => $id,
        "path" => $web_base . "model/ID" . $id . ".jpg"
    ]);
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