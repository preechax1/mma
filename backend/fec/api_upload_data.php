<?php
    require_once __DIR__ . '/../../library_api/upload_data.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    date_default_timezone_set('Asia/Bangkok');
    $DateNow = date('Y-m-d G:h:i');
    $DayNow = date('d-M-Y');
?>




<?php 
    if (isset($_POST['function']) && $_POST['function'] === 'upload') {
        try {
            $id = $_POST['id'] ?? '';
            $folder_data = "ID" . $id;

            $countfiles = count(array_filter($_FILES['fileupload']['name']));

            if ($countfiles > 0) {
                $uploader = new FileUploader("D:/Storage_MMA_TE/WebAppData/DataFile/");
                
                $uploader->upload('fec', $folder_data, 'fileupload');

                $upload_data = "✅ Copy/Upload File Data Complete";
                $DataUpload = 1;
            } else {
                $upload_data = "⚠️ No File for Upload";
                $DataUpload = 0;
            }
            echo json_encode([
                'status' => $DataUpload,
                'message' => $upload_data
            ]);

        } catch (Exception $e) {
            echo json_encode(['error' => "❌ Error: " . $e->getMessage()]);
        }
    }
?>



<?php
    if (isset($_POST['function']) && $_POST['function'] === 'remove_file') {
        try {
            if (empty($_POST['name'])) {
                echo json_encode(['msg' => "<div class='alert alert-danger'>⚠️ ไม่พบชื่อไฟล์</div>", 'status_return' => 0]);
                exit;
            }
            
            $base_dir = realpath("D:/Storage_MMA_TE/WebAppData/DataFile/fec");
            if ($base_dir === false) {
                echo json_encode(['msg' => "<div class='alert alert-danger'>🚫 Base dir ไม่ถูกต้อง</div>", 'status_return' => 0]);
                exit;
            }
            
            $base_dir = rtrim(str_replace(['\\','/'], DIRECTORY_SEPARATOR, $base_dir), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

            // รับ input และ normalize
            $input = $_POST['name'];
            $input = urldecode($input);                    // ถ้ามี %20 etc.
            $input = str_replace(['\\','/'], DIRECTORY_SEPARATOR, $input);
            $input = trim($input);

            // ถ้า user ส่ง path แบบ absolute (เต็ม) หรือแบบ relative ก็รองรับได้
            $dir_part = dirname($input);
            $base_name = basename($input);

            // ลอง realpath ของไดเรกทอรีที่เก็บไฟล์
            $real_dir = realpath($dir_part);

            // ถ้า realpath(dirname) ล้มเหลว ให้ลองประกอบจาก base_dir + substring หลัง 'fec' (ถ้ามี)
            if ($real_dir === false) {
                // ตัวอย่าง: ถ้า input = "D:/web_upload/fec/ID152/file.mp4" เราหวังว่า path จะอยู่ภายใต้ base_dir
                // ให้ตรวจสอบว่า input มี base_dir เป็น substring หรือไม่
                if (stripos($input, $base_dir) === 0) {
                    // ถ้าเริ่มต้นด้วย base_dir แต่ realpath ล้ม อาจเป็นเพราะไฟล์ยังไม่มีจริง หรือ permission ไม่พอ
                    $real_dir = $base_dir . dirname(substr($input, strlen($base_dir)));
                } else {
                    // ลองมองหา pattern "IDxxx/..." แล้วประกอบ path ภายใต้ base_dir
                    // หาก input เป็น "ID152/filename" หรือ "ID152\filename"
                    $maybe_under = $base_dir . DIRECTORY_SEPARATOR . ltrim($input, DIRECTORY_SEPARATOR);
                    $maybe_dir = dirname($maybe_under);
                    if (is_dir($maybe_dir) || file_exists($maybe_dir)) {
                        $real_dir = $maybe_dir;
                    } else {
                        // สุดท้ายยังหาไดเรกทอรีไม่เจอ
                        echo json_encode([
                            'msg' => "<div class='alert alert-danger'>🚫 พาธไดเรกทอรีไม่ถูกต้อง (realpath dirname ล้ม) — กรุณาตรวจสอบ</div>",
                            'status_return' => 0,
                            'debug' => ['base_dir' => $base_dir, 'input' => $input, 'dir_part' => $dir_part]
                        ]);
                        exit;
                    }
                }
            }

            // ประกอบ target path จาก real_dir + basename
            $target_path = rtrim(str_replace(['\\','/'], DIRECTORY_SEPARATOR, $real_dir), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $base_name;

            // ตรวจสอบว่า target_path อยู่ภายใต้ base_dir จริง
            $norm_target = str_replace(['\\','/'], DIRECTORY_SEPARATOR, $target_path);
            if (stripos($norm_target, $base_dir) !== 0) {
                echo json_encode([
                    'msg' => "<div class='alert alert-danger'>🚫 พาธไม่ถูกต้อง — ไม่อนุญาตให้ลบไฟล์นอกโฟลเดอร์ที่กำหนด</div>",
                    'status_return' => 0,
                    'debug' => ['base_dir' => $base_dir, 'constructed_target' => $norm_target]
                ]);
                exit;
            }

            // สุดท้าย ตรวจสอบการมีอยู่และสิทธิ์ แล้วลบ
            if (is_file($target_path)) {
                if (@unlink($target_path)) {
                    echo json_encode(['msg' => "<div class='alert alert-success'>✅ ลบไฟล์เรียบร้อย</div>", 'status_return' => 1]);
                } else {
                    // ล้มเหลว (สิทธิ์หรือใช้งานโดย process อื่น)
                    echo json_encode([
                        'msg' => "<div class='alert alert-danger'>❌ ลบไฟล์ไม่สำเร็จ — อาจเป็นปัญหา permission หรือไฟล์ถูกล็อค</div>",
                        'status_return' => 0,
                        'debug' => ['target' => $target_path, 'is_writable' => is_writable(dirname($target_path))]
                    ]);
                }
                exit;
            } elseif (is_dir($target_path)) {
                // ลบโฟลเดอร์แบบ recursive
                deleteFolder($target_path);
                echo json_encode(['msg' => "<div class='alert alert-success'>🗂️ ลบโฟลเดอร์เรียบร้อย</div>", 'status_return' => 1]);
                exit;
            } else {
                // อาจไฟล์ไม่มีจริง
                echo json_encode([
                    'msg' => "<div class='alert alert-danger'>❌ ไม่พบไฟล์หรือโฟลเดอร์</div>",
                    'status_return' => 0,
                    'debug' => ['constructed_target' => $target_path, 'file_exists' => file_exists($target_path)]
                ]);
                exit;
            }

        } catch (Exception $e) {
            echo json_encode(['msg' => 'Error: ' . $e->getMessage(), 'status_return' => 0]);
        }
    }
    
?>

 