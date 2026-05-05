import React from "react";

export default function Home() {
  const userData = localStorage.getItem("user");
  const user =
    userData && userData !== "undefined" ? JSON.parse(userData) : null;

  const displayName = user
    ? user.displayName || user.member || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || ""
    : "";

    console.log("User Data:", user); // Debugging log to check user data structure  

  const buildAppUrl = (baseUrl) => {
    const params = new URLSearchParams({
      memberID: user?.memberID || "",
      member: user?.displayName || user?.member || "",
      position: user?.position || "",
      username: user?.username || "",
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handleSelectApp = (app) => {
    if (app === "fec") {
      window.location.href = buildAppUrl("http://localhost:5173");
    } else if (app === "test_utilization") {
      window.location.href = buildAppUrl("http://localhost:5174");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{ color: "#333", fontSize: "2.5rem", marginBottom: "0.5rem" }}
        >
          ยินดีต้อนรับสู่ระบบ MMA
        </h1>
        <p style={{ color: "#666", fontSize: "1.2rem" }}>ระบบจัดการการผลิต</p>
      </div>

      {/* User Info */}
      {user && (
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <h3>สวัสดี, {displayName || "ผู้ใช้"}!</h3>
          <p>ตำแหน่ง: {user.position || "-"}</p>
          <p>รหัสสมาชิก: {user.memberID || "-"}</p>
        </div>
      )}

      {/* Organization Introduction */}
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ color: "#333", marginBottom: "1rem" }}>
          เกี่ยวกับองค์กรของเรา
        </h2>
        <p style={{ lineHeight: "1.6", color: "#555" }}>
          MMA (ระบบจัดการการผลิต)
          เป็นระบบที่ครอบคลุมซึ่งออกแบบมาเพื่อปรับปรุงและเพิ่มประสิทธิภาพกระบวนการผลิต
          แพลตฟอร์มของเราให้โซลูชันแบบบูรณาการสำหรับการตรวจสอบอุปกรณ์
          การติดตามการใช้ทดสอบ และการจัดการการใช้พลังงานของโรงงาน
          ด้วยการวิเคราะห์ข้อมูลแบบเรียลไทม์และอินเทอร์เฟซที่ใช้งานง่าย
          เราช่วยองค์กรปรับปรุงประสิทธิภาพ ลดเวลาหยุดทำงาน
          และตัดสินใจโดยใช้ข้อมูล
        </p>
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ color: "#333" }}>คุณสมบัติหลัก:</h3>
          <ul style={{ color: "#555", paddingLeft: "2rem" }}>
            <li>การตรวจสอบสถานะอุปกรณ์แบบเรียลไทม์</li>
            <li>การวิเคราะห์และรายงานการใช้ทดสอบ</li>
            <li>การติดตามและเพิ่มประสิทธิภาพการใช้พลังงาน</li>
            <li>แดชบอร์ดที่ครอบคลุมพร้อมข้อมูลเชิงลึกภาพ</li>
            <li>การตรวจสอบความปลอดภัยและการเข้าถึงตามบทบาท</li>
          </ul>
        </div>
      </div>

      {/* Application Selection */}
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#333", marginBottom: "1rem" }}>
          แอปพลิเคชันที่มี
        </h2>
        <p style={{ color: "#666", marginBottom: "2rem" }}>
          เลือกแอปพลิเคชันเพื่อเข้าถึงคุณสมบัติและข้อมูลโดยละเอียด:
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              width: "250px",
            }}
          >
            <h3 style={{ color: "#28a745" }}>แอปพลิเคชัน FEC</h3>
            <p style={{ color: "#555", marginBottom: "1rem" }}>
              การตรวจสอบและวิเคราะห์การใช้พลังงานของโรงงาน
            </p>
            <button
              onClick={() => handleSelectApp("fec")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              เข้าถึง FEC
            </button>
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              width: "250px",
            }}
          >
            <h3 style={{ color: "#007bff" }}>การใช้ทดสอบ</h3>
            <p style={{ color: "#555", marginBottom: "1rem" }}>
              การติดตามและจัดการการใช้เครื่องทดสอบ
            </p>
            <button
              onClick={() => handleSelectApp("test_utilization")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              เข้าถึงการใช้ทดสอบ
            </button>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
