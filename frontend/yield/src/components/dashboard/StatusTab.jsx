import styles from "./StatusTab.module.css";

function StatusCard({ item }) {
    return (
        <div
            className={styles["status-card"]}
            data-status={item.status}
        >
            <div className={styles["status-title"]}>{item.status}</div>
            <div className={styles["status-value"]}>{item.total}</div>
        </div>
    );
}

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
