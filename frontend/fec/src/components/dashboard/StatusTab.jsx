import styles from "./StatusTab.module.css";

// 1. Internal Component
function StatusCard({ item }) {
    return (
        <div
            className={styles["status-card"]}
            data-status={item.status} // ส่งชื่อ status ไปให้ CSS เลือกสี
        >
            <div className={styles["status-title"]}>{item.status}</div>
            <div className={styles["status-value"]}>{item.total}</div>
        </div>
    );
}

// 2. Main Component
export default function StatusTab({ statusData }) {
    if (!statusData || statusData.length === 0) return null;

    return (
        <div className={styles["status-grid"]}>
            {statusData.map((item, index) => (
                <StatusCard key={index} item={item} />
            ))}
        </div>
    );
}
