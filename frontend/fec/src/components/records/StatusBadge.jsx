import styles from "./Record.module.css";

export default function StatusBadge({ status }) {
    // Convert status to class name (e.g., "Good" -> "statusGood")
    const statusClass = `status${status?.trim().replace(/\s+/g, '')}`;
    const className = styles[statusClass] || "";

    return (
        <div className={`${styles.statusBadge} ${className}`}>
            {status}
        </div>
    );
}