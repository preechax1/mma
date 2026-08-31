import styles from "./UserInfoCard.module.css";

export default function UserInfoCard({ user, displayName, onLogout }) {
  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.heroTitle}>สวัสดี, {displayName || "ผู้ใช้"}!</h2>
          <p className={styles.subtitle}>{user?.position || "ตำแหน่งไม่ได้ระบุ"} • รหัส: {user?.memberID || "-"}</p>
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          ออกจากระบบ
        </button>
      </div>

      <section className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>เกี่ยวกับ MMA</h3>
        <p className={styles.text}>
          MMA (Modern Manufacturing Assistant) เป็นโซลูชันแบบบูรณาการที่ช่วยเพิ่มประสิทธิภาพในการทำงานภายในโรงงานผ่านการตรวจสอบสถานะเครื่องจักรแบบเรียลไทม์ และการวิเคราะห์ข้อมูลเชิงลึก
        </p>
        <ul className={styles.featureList}>
          <li>Monitoring Real-time</li>
          <li>Usage Analysis</li>
          <li>Energy Efficiency</li>
          <li>Role-based Access</li>
        </ul>
      </section>
    </div>
  );
}
