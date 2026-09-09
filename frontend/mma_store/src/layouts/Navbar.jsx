import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.position?.toLowerCase() === "admin";

  const redirectToLogin = () => {
    const currentUrl = window.location.origin + window.location.pathname;
    const loginUrl = import.meta.env.VITE_LOGIN_URL || "http://localhost:5175";
    window.location.href = `${loginUrl}/?logout=1&redirect=${encodeURIComponent(currentUrl)}`;
  };

  const handleLogout = (isAuto = false) => {
    if (isAuto || window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      logout();
      redirectToLogin();
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

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Store", path: "/store" },
    ...(isAdmin ? [{ label: "Spare", path: "/spare" }] : []),
    { label: "History", path: "/history" },
  ];

  const getNavLinkClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

  const getMobileNavLinkClass = ({ isActive }) =>
    isActive
      ? `${styles.mobileNavLink} ${styles.active}`
      : styles.mobileNavLink;

  return (
    <header className={styles.headerWrapper}>
      <nav className={styles.navbarContainer}>
        {/* LOGO */}
        <div className={styles.logo}>
          <NavLink to="/">
            <span className={styles.logoText}>MMA Spare</span>
          </NavLink>
        </div>

        {/* DESKTOP NAV LINKS */}
        <ul className={styles.navMenu}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={getNavLinkClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* RIGHT ACTION BUTTONS */}
        <div className={styles.actionGroup}>
          {user ? (
            <button
              onClick={() => handleLogout(false)}
              className={styles.btnSecondary}
            >
              Logout
            </button>
          ) : (
            <a href="#contact" className={styles.btnPrimary}>
              Contact
            </a>
          )}

          {/* MOBILE TOGGLE BUTTON */}
          <button
            className={styles.mobileToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
          <ul className={styles.mobileMenu}>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={getMobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
