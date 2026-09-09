import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import styles from "./Layout.module.css";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const storedUser = localStorage.getItem("user");

      // 1. ถ้ามี Token ใน URL ให้จัดการก่อน
      if (token) {
        try {
          const payloadBase64 = token.split(".")[0];
          const decodedData = JSON.parse(atob(payloadBase64));
          const userData = decodedData.user;
          const payload = {
            memberID: userData.memberID || "",
            member: userData.member || "",
            position: userData.position || "",
            username: userData.log_use || "",
            displayName:
              userData.member ||
              `${userData.FirstName || ""} ${userData.LastName || ""}`.trim() ||
              "",
            loginTimestamp: Date.now(),
            token: token,
          };
          localStorage.setItem("user", JSON.stringify(payload));

          // ลบ Token ออกจาก URL และ "ไม่ต้องโหลดหน้าใหม่"
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);

          setIsAuthChecking(false);
          return;
        } catch (e) {
          console.error("Token error", e);
        }
      }

      // 2. ถ้าไม่มี Token แต่มีข้อมูลในเครื่อง
      if (storedUser && storedUser !== "undefined") {
        setIsAuthChecking(false);
      } else {
        // 3. ถ้าไม่มีทั้งคู่จริงๆ ถึงค่อยเด้ง (และต้องไม่มี Token ค้างอยู่ใน URL ด้วย)
        if (!token) {
          const currentUrl = window.location.origin + window.location.pathname;
          const loginUrl =
            import.meta.env.VITE_LOGIN_URL || "http://localhost:5175";
          window.location.href = `${loginUrl}/?redirect=${encodeURIComponent(currentUrl)}`;
        }
      }
    };

    checkAuth();
  }, []);

  React.useEffect(() => {
    if (!isAuthChecking && !user) {
      const loginUrl =
        import.meta.env.VITE_LOGIN_URL || "http://localhost:5175";
      const currentUrl = window.location.origin + window.location.pathname;
      window.location.href = `${loginUrl}/?logout=1&redirect=${encodeURIComponent(currentUrl)}`;
    }
  }, [isAuthChecking, user]);

  if (isAuthChecking || !user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        กำลังยืนยันตัวตน...
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.wrapper}>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
