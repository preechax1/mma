import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css"; // Import CSS Module

export default function Navbar() {
  const navigate = useNavigate();

  // ดึงข้อมูล User จาก LocalStorage (ที่เซ็ตมาจากหน้า Login)
  const getUserFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const memberID = params.get("memberID");
    if (!memberID) return null;

    const payload = {
      memberID,
      member: params.get("member") || "",
      position: params.get("position") || "",
      username: params.get("username") || "",
      displayName: params.get("displayName") || params.get("member") || "",
      loginTimestamp: Date.now(), // บันทึกเวลาที่ login
    };
    localStorage.setItem("user", JSON.stringify(payload));
    return payload;
  };

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : getUserFromQuery();

  const handleLogout = (isAuto = false) => {
    if (isAuto || window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user");
      window.location.href = "http://localhost:5175/?logout=1";
    }
  };

  useEffect(() => {
    const checkLoginTimeout = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const loginTime = userData.loginTimestamp;
          
          if (loginTime) {
            const now = Date.now();
            const threeHours = 3 * 60 * 60 * 1000;

            if (now - loginTime > threeHours) {
              alert("เซสชันหมดอายุ (เกิน 3 ชั่วโมง) กรุณาเข้าสู่ระบบใหม่");
              handleLogout(true);
            }
          } else {
            // ถ้าไม่มี timestamp ให้ใส่ตัวปัจจุบัน (สำหรับคนที่ login ค้างไว้ก่อนหน้านี้)
            userData.loginTimestamp = Date.now();
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } catch (e) {
          console.error("Error parsing user data for timeout check", e);
        }
      }
    };

    checkLoginTimeout();
    const interval = setInterval(checkLoginTimeout, 60000); // ตรวจสอบทุก 1 นาที
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className={styles.topbar}>
      {/* ส่วน Logo */}
      <div className={styles.logo}>
        <span className={styles.mmaSpan}>MMA</span>Test Station
      </div>

      {/* ส่วนข้อมูลและปุ่มควบคุม */}
      <div className={styles.topInfo}>
        {/* ส่วนแสดงข้อมูลผู้ใช้และปุ่ม Logout */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.displayName ||
                user?.member ||
                user?.username ||
                "Unknown User"}
            </span>
            <span className={styles.userPos}>{user?.position || "Guest"}</span>
          </div>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
