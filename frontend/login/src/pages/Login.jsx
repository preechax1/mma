import React, { useState, useEffect } from "react";
import { login } from "../services/LoginService";
import styles from "./Login.module.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect) {
            setRedirectUrl(redirect);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(username, password);
            if (res.status === 1) {
                const user = res.data?.user || res.data || res;
                const token = res.data?.token || res.token || "";

                const displayName = user.member || `${user.FirstName || ""} ${user.LastName || ""}`.trim() || user.log_use || "";

                const userData = {
                    memberID: user.memberID || "",
                    member: user.member || "",
                    username: user.log_use || "",
                    firstName: user.FirstName || "",
                    lastName: user.LastName || "",
                    position: user.position || "",
                    displayName,
                    loginTimestamp: Date.now(),
                    token: token,
                };

                localStorage.setItem("user", JSON.stringify(userData));

                if (redirectUrl) {
                    const url = new URL(redirectUrl);
                    url.searchParams.set("token", userData.token); // Send only the token
                    window.location.href = url.toString();
                } else {
                    window.location.reload();
                }
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
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>ยินดีต้อนรับสู่ MMA</h2>
                <p className={styles.subtitle}>กรุณาเข้าสู่ระบบเพื่อเข้าถึงแอปพลิเคชัน</p>

                <form onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label>ชื่อผู้ใช้</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="ป้อนชื่อผู้ใช้"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>รหัสผ่าน</label>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="ป้อนรหัสผ่าน"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.button}
                    >
                        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                    </button>
                </form>
            </div>
        </div>
    );
}
