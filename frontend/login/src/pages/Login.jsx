import React, { useState } from "react";
import { login } from "../services/LoginService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.status === 1) {
        const payload = res.data && (res.data.member || res.data.memberID || res.data.position)
          ? res.data
          : res;
        const displayName = payload.member || `${payload.FirstName || ""} ${payload.LastName || ""}`.trim() || payload.log_use || "";
        const userData = {
          memberID: payload.memberID || "",
          member: payload.member || "",
          username: payload.log_use || "",
          firstName: payload.FirstName || "",
          lastName: payload.LastName || "",
          position: payload.position || "",
          displayName,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        window.location.reload();
      } else {
        alert(res.message || res.detail || "Username หรือ Password ไม่ถูกต้อง");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>ยินดีต้อนรับสู่ MMA</h2>
        <p>กรุณาเข้าสู่ระบบเพื่อเข้าถึงแอปพลิเคชัน</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label>ชื่อผู้ใช้</label>
            <input
              type="text"
              placeholder="ป้อนชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>รหัสผ่าน</label>
            <input
              type="password"
              placeholder="ป้อนรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
