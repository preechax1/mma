import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
import StationDetail from "./pages/StationDetail";
import History from "./pages/History";
import Login from "./pages/Login"; // นำเข้าหน้า Login

import ManageStation from "./pages/ManageStation";

export default function App() {
  // เช็คสถานะการเข้าสู่ระบบ
  const user = JSON.parse(localStorage.getItem("user"));

  // ถ้ายังไม่ได้ Login ให้แสดงหน้า Login อย่างเดียว (ไม่มี Layout)
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
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
