// D:\Docker\mma\frontend\fec\src\components\dashboard\StatusCard.jsx
import { COLORS } from "../../constants/colors";
import styles from "./StatusGrid.module.css";

export default function StatusCard({ item }) {
  return (
    <div
      className={styles["status-card"]}
      style={{ backgroundColor: COLORS[item.status] || "#334155" }}
    >
      {/* ต้องเรียกผ่าน styles เท่านั้นสำหรับ CSS Module */}
      <div className={styles["status-title"]}>{item.status}</div>
      <div className={styles["status-value"]}>{item.total}</div>
    </div>
  );
}