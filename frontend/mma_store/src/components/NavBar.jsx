import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Boxes, ClipboardList, LogOut, Menu, PackageSearch, Settings, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './NavBar.module.css';

const NavBar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.position?.toLowerCase() === 'admin';

    const navItems = [
        { label: 'Dashboard', path: '/', icon: BarChart3 },
        { label: 'Store', path: '/store', icon: Boxes },
        ...(isAdmin ? [{ label: 'Spare', path: '/spare', icon: PackageSearch }] : []),
        { label: 'History', path: '/history', icon: ClipboardList },
    ];

    // Do not show navigation links if not logged in
    if (!user) {
        return (
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <Link to="/" className={styles.brand}>
                        <div className={styles.brandIcon}><Boxes size={22} /></div>
                        <div className={styles.brandText}>
                            <span className={styles.brandName}>MMA Spare</span>
                            <span className={styles.brandTagline}>Warehouse system</span>
                        </div>
                    </Link>
                </div>
            </header>
        );
    }

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <Link to="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
                    <div className={styles.brandIcon}><Boxes size={22} /></div>
                    <div className={styles.brandText}>
                        <span className={styles.brandName}>MMA Spare</span>
                        <span className={styles.brandTagline}>Warehouse system</span>
                    </div>
                </Link>

                <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
                    {navItems.map(({ label, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <Icon size={17} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.utility}>
                    <div className={styles.userBlock}>
                        <span className={styles.userAvatar}>{(user.username || 'U')[0].toUpperCase()}</span>
                        <span className={styles.greeting}>
                            <small>Signed in as</small>
                            <span className={styles.userName}>{user.username || user.displayName || 'User'}</span>
                        </span>
                    </div>

                    {isAdmin && (
                        <span className={styles.roleBadge}><Settings size={13} /> Admin</span>
                    )}

                    <button onClick={logout} className={styles.logoutButton}>
                        <LogOut className={styles.logoutIcon} size={18} />
                        Logout
                    </button>
                    <button
                        className={styles.menuToggle}
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default NavBar;
