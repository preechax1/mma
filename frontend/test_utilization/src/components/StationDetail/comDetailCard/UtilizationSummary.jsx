import styles from "./UtilizationSummary.module.css";

export default function UtilizationSummary({ summary }) {
  if (!summary) return null;

  const utilValue = parseFloat(summary.utilization) || 0;

  // ฟังก์ชันเลือกสี (ใช้ค่าสีเดิมที่คุณตั้งไว้ เพราะเน้น High Contrast สำหรับโรงงาน)
  const getStyleConfig = (val) => {
    if (val >= 80) return { color: "#16a34a", bg: "#22c55e" }; 
    if (val >= 50) return { color: "#d97706", bg: "#f59e0b" }; 
    return { color: "#dc2626", bg: "#ef4444" };               
  };

  const config = getStyleConfig(utilValue);

  return (
    <div className={styles.utilCardFixed}>
      <div className={styles.utilHeaderFixed}>
        <h4 className={styles.utilTitleText}>Efficiency Summary</h4>
        <div className={styles.utilDateBadge}>{summary.ut_day}</div>
      </div>

      <div className={styles.utilBodyFixed}>
        <div className={styles.utilMainValRow}>
          <span className={styles.utilLabelText}>Utilization</span>
          <span className={styles.utilPercentNumber} style={{ color: config.color }}>
            {utilValue.toFixed(1)}%
          </span>
        </div>

        <div className={styles.utilBarBg}>
          <div 
            className={styles.utilBarFill} 
            style={{ 
              width: `${Math.min(utilValue, 100)}%`,
              backgroundColor: config.bg 
            }}
          ></div>
        </div>
      </div>

      <div className={styles.utilGridFooter}>
        <div className={styles.utilStatItem}>
          <label>MTBF</label>
          <span className={styles.utilStatVal}>
            {summary.MTBF?.toFixed(0) || "0"} <small className={styles.smallUnit}>min</small>
          </span>
        </div>
        <div className={styles.utilStatItem}>
          <label>MTTR</label>
          <span className={styles.utilStatVal}>
            {summary.MTTR || "0"} <small className={styles.smallUnit}>min</small>
          </span>
        </div>
      </div>
    </div>
  );
}