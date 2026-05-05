<?php
$server = "198.10.10.105";
$dbname = "hana-mod";
$user = "sa";
$pass = "hm2474";

try {
    $dbh = new PDO(
        "sqlsrv:Server=$server;Database=$dbname;Encrypt=yes;TrustServerCertificate=yes",
        $user,
        $pass
    );
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "✅ SQL Server Connected!";
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
