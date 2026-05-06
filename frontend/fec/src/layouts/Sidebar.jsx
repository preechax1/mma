import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

// คุณสามารถเพิ่ม Icon ได้ที่นี่ในอนาคต (เช่นจาก react-icons)
export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "FEC Record", path: "/record/records", icon: "⚙️" },
    { name: "FEC History", path: "/records?history=1", icon: "📜" },
    { name: "FEC Manage", path: "/updateform", icon: "🚨" },
  ];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navMenu}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <p>© 2026 MMA OP3</p>
      </div>
    </aside>
  );
}
