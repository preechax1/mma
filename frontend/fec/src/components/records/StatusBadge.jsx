import styles from "./Record.module.css";

export default function StatusBadge({ status }) {
  // Convert status to class name (e.g., "Pass" -> "statusPass")
  const statusClass = `status${status?.trim().replace(/\s+/g, '')}` || "status-default";
  const className = styles[statusClass] || styles["status-badge"];

  return (
    <div className={`${styles["status-badge"]} ${className}`}>
      {status}
    </div>
  );
}