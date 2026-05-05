import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/LoginService';
import styles from './Login.module.css'; // Import CSS Module

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.status === 1) {
        localStorage.setItem('user', JSON.stringify(res.user));
        navigate('/');
        window.location.reload(); 
      } else {
        alert(res.message || 'Username หรือ Password ไม่ถูกต้อง');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h2>Welcome Back</h2>
        <p>Machine Status Monitoring System</p>
        
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input 
              type="text" 
              placeholder="กรอกชื่อผู้ใช้งาน" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="กรอกรหัสผ่าน" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}