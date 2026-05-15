import React from "react";
import styles from "./Home.module.css";

export default function Home() {
  const userData = localStorage.getItem("user");
  const user = userData && userData !== "undefined" ? JSON.parse(userData) : null;

  const displayName = user
    ? user.displayName || user.member || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || ""
    : "";

  const buildAppUrl = (baseUrl) => {
    const url = new URL(baseUrl);
    url.searchParams.set("token", user?.token || ""); // ส่งแค่ Token
    return url.toString();
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
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>MMA Portal</h1>
        <p>ระบบจัดการการผลิตและตรวจสอบสถานะอัจฉริยะ</p>
      </header>

      {/* User Info Card */}
      <div className={styles.card}>
        <div className={styles.userInfo}>
          <div className={styles.userText}>
            <h3>สวัสดี, {displayName || "ผู้ใช้"}!</h3>
            <p>{user?.position || "ตำแหน่งไม่ได้ระบุ"} • รหัส: {user?.memberID || "-"}</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            ออกจากระบบ
          </button>
        </div>

        <div className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>เกี่ยวกับ MMA</h2>
          <p>
            MMA (Modern Manufacturing Assistant) 
            เป็นโซลูชันแบบบูรณาการที่ช่วยเพิ่มประสิทธิภาพในการทำงานภายในโรงงาน 
            ผ่านการตรวจสอบสถานะเครื่องจักรแบบเรียลไทม์ และการวิเคราะห์ข้อมูลเชิงลึก
          </p>
          <ul className={styles.featureList}>
            <li>Monitoring Real-time</li>
            <li>Usage Analysis</li>
            <li>Energy Efficiency</li>
            <li>Role-based Access</li>
          </ul>
        </div>
      </div>

      {/* Application Selection */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>เลือกแอปพลิเคชัน</h2>
        <div className={styles.appGrid}>
          <div className={styles.appCard}>
            <h3 style={{ color: "#10b981" }}>แอปพลิเคชัน FEC</h3>
            <p>ตรวจสอบและวิเคราะห์การใช้พลังงาน พร้อมรายงานสถานะแบบละเอียด</p>
            <button
              onClick={() => handleSelectApp("fec")}
              className={`${styles.appBtn} ${styles.fecBtn}`}
            >
              เข้าใช้งาน FEC
            </button>
          </div>

          <div className={styles.appCard}>
            <h3 style={{ color: "#3b82f6" }}>การใช้ทดสอบ (Utilization)</h3>
            <p>ติดตามการใช้งานเครื่องทดสอบ และจัดการตารางการทำงานของแต่ละสถานี</p>
            <button
              onClick={() => handleSelectApp("test_utilization")}
              className={`${styles.appBtn} ${styles.testBtn}`}
            >
              เข้าใช้งาน Utilization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
