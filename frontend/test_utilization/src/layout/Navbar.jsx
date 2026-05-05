import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css'; // Import CSS Module

export default function Navbar() {
    const navigate = useNavigate();

    // ดึงข้อมูล User จาก LocalStorage (ที่เซ็ตมาจากหน้า Login)
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        // ใช้ Confirm Modal ของ Browser แบบง่าย
        if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            localStorage.removeItem('user');
            navigate('/login');
            window.location.reload(); // บังคับ App เช็ค state ใหม่
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