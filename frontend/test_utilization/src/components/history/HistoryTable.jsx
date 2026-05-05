import { calcMinutes, formatDuration } from "../../utils/historyUtils";
import styles from "./HistoryTable.module.css";

export default function HistoryTable({ rows, onOpenFiles }) {
    
    // ฟังก์ชันช่วยเลือก Class สำหรับ Category
    const getCategoryClass = (cat) => {
        const category = cat?.toLowerCase();
        if (category === 'critical' || category === 'high') return styles.badgeCritical;
        if (category === 'warning' || category === 'medium') return styles.badgeWarning;
        return styles.badgeNormal;
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.historyTable}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Station</th>
                        <th>Category</th>
                        <th>Problem</th>
                        <th>Cause / Action</th>
                        <th>By</th>
                        <th>Start - End Time</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const durationMins = calcMinutes(row.start_time, row.end_time);
                            return (
                                <tr key={row.id ?? index}>
                                    <td className={styles.idCol}>#{row.id}</td>
                                    <td>
                                        <button
                                            onClick={() => onOpenFiles(row.id)}
                                            className={styles.btnStation}
                                            title="View related files"
                                        >
                                            {row.station || "-"}
                                        </button>
                                    </td>

                                    <td>
                                        <span className={`
                                            ${styles.badgeCritical} 
                                            ${!row.action ? styles.badgeCritical : getCategoryClass(row.category)}
                                        `}>
                                            {row.category || "Under Verify"}
                                        </span>
                                    </td>

                                    <td className={styles.problemCol}>{row.problem || "-"}</td>
                                    <td>
                                        <div className={styles.causeText}><strong>C:</strong> {row.cause || "-"}</div>
                                        <div className={styles.actionText}><strong>A:</strong> {row.action || "-"}</div>
                                    </td>
                                    <td>
                                        <span className={styles.engineerName}>👤 {row.engineer || "-"}</span>
                                    </td>
                                    <td className={styles.timeCol}>
                                        <div>{row.start_time || "-"}</div>
                                        <div className={styles.endTime}>{row.end_time || "-"}</div>
                                    </td>
                                    <td>
                                        <span className={styles.durationValue}>
                                            {formatDuration(durationMins)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
            </table>
            
            {rows.length === 0 && (
                <div className={styles.emptyState}>
                    <p>No downtime records found matching your filters.</p>
                </div>
            )}
        </div>
    );
}