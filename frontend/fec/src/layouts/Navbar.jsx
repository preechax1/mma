import React from "react";
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
    };
    localStorage.setItem("user", JSON.stringify(payload));
    return payload;
  };

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : getUserFromQuery();

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user");
      window.location.href = "http://localhost:5175/?logout=1";
    }
  };

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
              {user?.displayName || user?.member || user?.username || "Unknown User"}
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
