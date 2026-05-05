<?php
    // $dbh = new PDO('mysql:host=localhost;dbname=keysight', 'root', 'mma'); // Server Production

    $dbh = new PDO('mysql:host=mma_mysql;dbname=keysight', 'root', 'mma'); // Server Development (Docker)
    $dbh->exec("SET sql_mode=''"); // Disable strict mode for MySQL to allow for more flexible queries
?>
