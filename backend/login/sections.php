<?php
    require_once 'core_helper.php';

    $base_dir = getenv('LOGIN_BASE_DIR') ?: __DIR__ . "/../uploads/login";
    if (!is_dir($base_dir)) {
        $base_dir = "D:/Storage_MMA_TE/WebAppData/DataFile/login";
    }
    $web_base = getenv('LOGIN_WEB_BASE') ?: "/web_upload/login/";

    /* =====================================================
    ROUTER
    ===================================================== */
    $route      = getAction('sections');
    $action     = $route['action'];
    $id         = $route['id'];

    /* =====================================================
    DEFAULT ROUTE (/spares)
    ===================================================== */

    if (!$action) {
        sections();
        exit;
    }


    /* =====================================================
    ROUTE MAP
    ===================================================== */
    try {
        switch ($action) {
            case 'all_list':    all_list();     break;
            case 'login':       login();        break;
            case 'sections':    sections();     break;


            default:
                sendResponse(400, 'Error', 'Action Fail');
                break;
        }
    } catch (PDOException $e) {
        sendResponse(500, 'Database Error', $e->getMessage());
    }


    function sections() {
        global $web_base;
        
        // 1. ประกาศ Array ซ้อน Array ให้ถูกหลัก PHP
        $data = [
            [
                "id" => "hero",
                "label" => "HOME",
                "img" => $web_base . "home.jpg",
                "title" => "Welcome to MMA System",
                "subtitle" => "Manufacturing Management Applications",
                "description" => "A unified platform for managing equipment, utilization, and facility energy consumption with real-time insights.",
                "features" => [
                    "Real-time equipment status monitoring",
                    "Test utilization analytics and reporting",
                    "Energy consumption tracking and optimization",
                    "Comprehensive dashboard with visual insights",
                    "Secure user authentication and role-based access",
                ],
            ],
            [
                "id" => "user-info",
                "label" => "User Info",
                "title" => "Profile & Access",
                "description" => "View your member details, position, and access privileges.",
            ],
            [
                "id" => "app-utilization",
                "label" => "Utilization",
                "title" => "Test Utilization",
                "description" => "Analyze and manage equipment usage, test schedules, and performance metrics.",
                "appKey" => "test_utilization",
                "buttonText" => "Open Utilization",
            ],
            [
                "id" => "app-z-chart",
                "label" => "Z-Chart",
                "title" => "Z-Chart Analytics",
                "description" => "Monitor process stability and yield performance with Z-chart visualization.",
            ],
            [
                "id" => "app-1st-yield",
                "label" => "yield",
                "title" => "First Yield Performance",
                "description" => "Track first-pass yield and identify areas for production improvement.",
            ],
            [
                "id" => "app-knonging",
                "label" => "knonging",
                "title" => "Knonging",
                "description" => "Access specialized knonging tools and reports.",
            ],
            [
                "id" => "app-tdr",
                "label" => "TDR",
                "title" => "TDR Monitoring",
                "description" => "View test data rate and diagnostics information.",
            ],
            [
                "id" => "app-spare-parts",
                "label" => "MMASpare Parts",
                "title" => "Spare Parts Management",
                "description" => "Track spare parts inventory and request workflows.",
            ],
            [
                "id" => "app-Receive",
                "label" => "MMA Receive",
                "title" => "Receiving",
                "description" => "Manage inbound goods and receiving operations.",
            ],
            [
                "id" => "app-fec",
                "label" => "FEC",
                "title" => "Facility Energy Consumption",
                "description" => "Monitor power usage and energy efficiency across facilities.",
                "appKey" => "fec",
                "buttonText" => "Open FEC",
            ],
        ]; // ปิดท้ายด้วยเครื่องหมาย ;

        // 2. เรียกใช้ฟังก์ชัน response และปิดวงเล็บให้ครบ
        return response(200, 'Login successful', [
            'data' => $data
        ]);
    }
