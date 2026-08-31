<?php

    $devAction = '1';

    if ($devAction === '1') {
        $dbh = new PDO('mysql:host=mma_mysql;dbname=keysight', 'root', 'mma'); // Docker development
        $dbh->exec("SET sql_mode=''"); // Disable strict mode for MySQL to allow for more flexible queries

        //File path สำหรับ Local Docker DEV
        $base_dir = __DIR__ . "/../web_upload/";
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $web_base = $protocol . "://" . $host . "/web_upload/";

    } else {
        $dbh = new PDO('mysql:host=localhost;dbname=keysight', 'root'); // Production / local fallback

        //File path สำหรับ Local Product DEV
        $base_dir = "D:/Storage_MMA_TE/WebAppData/DataFile/";
        $web_base = "/web_upload/";
    }

?>
