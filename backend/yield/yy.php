<?php

$product = "Hydra N1030-60015 (pre-test)";

$weeks = [];

for ($ww = 3; $ww <= 52; $ww++) {

    $yield_goal = 85;

    // ใส่ข้อมูลจริงเฉพาะ WW3
    if ($ww == 3) {
        $in = 27;
        $out = 24;
        $yield = 89;

        $failure = [
            "RF Match" => 2,
            "Calibrate" => 1,
            "High Bandwidth" => 0,
            "TDR" => 0,
            "Noise" => 0,
            "sum" => 3
        ];
    } else {
        // Random ค่า in และ out
        $in  = rand(0, 100);
        $out = rand(0, $in); // out ไม่ควรเกิน in

        // Random failure แต่ละตัว
        $rf_match       = rand(0, 100);
        $calibrate      = rand(0, 100);
        $high_bandwidth = rand(0, 100);
        $tdr            = rand(0, 100);
        $noise          = rand(0, 100);
        $sum            = $rf_match + $calibrate + $high_bandwidth + $tdr + $noise;

        $failure = [
            "RF Match"       => $rf_match,
            "Calibrate"      => $calibrate,
            "High Bandwidth" => $high_bandwidth,
            "TDR"            => $tdr,
            "Noise"          => $noise,
            "sum"            => $sum
        ];

        // คำนวณ yield จาก out/in (ถ้า in > 0)
        $yield = ($in > 0) ? round(($out / $in) * 100, 2) : null;
    }

    $weeks[] = [
        "ww"         => $ww,
        "in"         => $in,
        "out"        => $out,
        "yield"      => $yield,
        "yield_goal" => $yield_goal,
        "failure"    => $failure
    ];
}

$data = [
    "product" => $product,
    "weeks"   => $weeks
];

header('Content-Type: application/json');
echo json_encode($data, JSON_PRETTY_PRINT);

?>