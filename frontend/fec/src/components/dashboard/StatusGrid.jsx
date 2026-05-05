// D:\Docker\mma\frontend\fec\src\components\dashboard\StatusGrid.jsx
import StatusCard from "./StatusCard";
import styles from "./StatusGrid.module.css";

export default function StatusGrid({ statusData }) {
  return (
    /* เปลี่ยนจาก styles.statusGrid เป็น styles["status-grid"] ให้ตรงกับ CSS */
    <div className={styles["status-grid"]}>
      {statusData.map((item, index) => (
        <StatusCard key={index} item={item} />
      ))}
    </div>
  );
}