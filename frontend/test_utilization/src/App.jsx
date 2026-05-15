import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
import StationDetail from "./pages/StationDetail";
import History from "./pages/History";

import ManageStation from "./pages/ManageStation";

export default function App() {
  // เช็คสถานะการเข้าสู่ระบบ
  const user = JSON.parse(localStorage.getItem("user"));

  // ตรวจสอบ Token ใน URL (ถ้ามี)
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

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
        loginTimestamp: Date.now(),
        token: token,
      };
      localStorage.setItem("user", JSON.stringify(payload));
      // ลบ Token ออกจาก URL
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
      window.location.reload();
      return null;
    } catch (e) {
      console.error("Token error", e);
    }
  }

  // ถ้ายังไม่ได้ Login ให้เด้งไปหน้า Login กลาง
  if (!user) {
    const currentUrl = window.location.origin + window.location.pathname;
    window.location.href = `http://localhost:5175/?redirect=${encodeURIComponent(currentUrl)}`;
    return null;
  }

  // ถ้า Login แล้ว ให้แสดง Routes ตามปกติพร้อม Layout
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/detail" element={<StationDetail />} />
        <Route path="/history" element={<History />} />
        {user?.position === "admin" && (
          <Route path="/manage" element={<ManageStation />} />
        )}
        {/* ถ้าหลงไปหน้า login ทั้งที่ล็อกอินแล้ว ให้เด้งกลับหน้าแรก */}
        <Route path="/login" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
