import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";

export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");

        if (params.get("logout") === "1") {
            localStorage.removeItem("user");
            setUser(null);
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        } else if (user && user.token && redirect) {
            // ส่งกลับไปแอปอื่นพร้อม Token เท่านั้น
            const url = new URL(redirect);
            url.searchParams.set("token", user.token);
            window.location.href = url.toString();
        }
    }, [user]);

    useEffect(() => {
        const checkSession = () => {
            const userData = localStorage.getItem("user");
            if (userData && userData !== "undefined") {
                try {
                    const userObj = JSON.parse(userData);

                    // ถ้าเป็นข้อมูลเก่าที่ไม่มี Token ให้ล้างทิ้งแล้วบังคับ Login ใหม่
                    if (!userObj.token) {
                        localStorage.removeItem("user");
                        setUser(null);
                        return;
                    }

                    const loginTime = userObj.loginTimestamp;
                    const ONE_HOUR = 60 * 60 * 1000;

                    if (loginTime && (Date.now() - loginTime > ONE_HOUR)) {
                        localStorage.removeItem("user");
                        setUser(null);
                        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
                        window.location.reload();
                    } else {
                        setUser(userObj);
                    }
                } catch (e) {
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkSession();
        const interval = setInterval(checkSession, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/" element={user ? <Home /> : <Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}