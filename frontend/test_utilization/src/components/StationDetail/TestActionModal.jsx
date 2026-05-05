import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./TestActionModal.module.css";

export const TestActionModal = ({ isOpen, onClose, station, onConfirm }) => {
  const [actionType, setActionType] = useState("register"); // 'register' หรือ 'cancel'
  const [testId, setTestId] = useState("");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      stationId: station.id_station,
      type: actionType,
      testId: actionType === "register" ? testId : station.current_test_id,
      reason: actionType === "cancel" ? reason : "",
      timestamp: new Date().toISOString(),
    };
    onConfirm(data);
    onClose();
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>จัดการสถานะการทดสอบ</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabGroup}>
          <button 
            className={`${styles.tab} ${actionType === "register" ? styles.activeTab : ""}`}
            onClick={() => setActionType("register")}
          >
            📥 Register Test
          </button>
          <button 
            className={`${styles.tab} ${actionType === "cancel" ? styles.activeTab : ""}`}
            onClick={() => setActionType("cancel")}
          >
            🚫 Cancel Test
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.stationInfo}>
            <span>Station: <strong>{station.station_name}</strong></span>
            <span>Status: <strong style={{ color: '#2563eb' }}>{station.status}</strong></span>
          </div>

          {actionType === "register" ? (
            <div className={styles.inputGroup}>
              <label>Test ID / Batch Number</label>
              <input 
                type="text" 
                required 
                placeholder="เช่น TST-2026-001"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
              />
              <p className={styles.hint}>กรอกรหัสการทดสอบใหม่เพื่อเริ่มกระบวนการ</p>
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label className={styles.dangerLabel}>เหตุผลที่ยกเลิกการทดสอบ</label>
              <textarea 
                required 
                placeholder="ระบุสาเหตุ เช่น เครื่องขัดข้อง หรือ ใส่ข้อมูลผิด..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className={styles.warningBox}>
                ⚠️ การยกเลิกจะทำให้ข้อมูลการทดสอบปัจจุบันถูกระงับทันที
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>ยกเลิก</button>
            <button 
              type="submit" 
              className={actionType === "register" ? styles.confirmBtn : styles.dangerBtn}
            >
              {actionType === "register" ? "เริ่มการทดสอบ" : "ยืนยันยกเลิกการทดสอบ"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};