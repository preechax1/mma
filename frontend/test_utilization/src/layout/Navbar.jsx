import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css'; // Import CSS Module

export default function Navbar() {
    const navigate = useNavigate();

    // ดึงข้อมูล User จาก LocalStorage (ที่เซ็ตมาจากหน้า Login)
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = (isAuto = false) => {
        if (isAuto || window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            localStorage.removeItem('user');
            const currentUrl = window.location.origin + window.location.pathname;
            window.location.href = `http://localhost:5175/?logout=1&redirect=${encodeURIComponent(currentUrl)}`;
        }
    };

    React.useEffect(() => {
        const checkLoginTimeout = () => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    const loginTime = userData.loginTimestamp;
                    
                    if (loginTime) {
                        const now = Date.now();
                        const ONE_HOUR = 60 * 60 * 1000;

                        if (now - loginTime > ONE_HOUR) {
                            alert("เซสชันหมดอายุ (เกิน 1 ชั่วโมง) กรุณาเข้าสู่ระบบใหม่");
                            handleLogout(true);
                        }
                    } else {
                        userData.loginTimestamp = Date.now();
                        localStorage.setItem("user", JSON.stringify(userData));
                    }
                } catch (e) {
                    console.error("Error parsing user data for timeout check", e);
                }
            }
        };

        checkLoginTimeout();
        const interval = setInterval(checkLoginTimeout, 60000);
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
                            {user?.member || 'Unknown User'}
                        </span>
                        <span className={styles.userPos}>
                            {user?.position || 'Guest'}
                        </span>
                    </div>

                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}