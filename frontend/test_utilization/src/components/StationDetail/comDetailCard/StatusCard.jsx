import styles from "./StatusCard.module.css";

export default function StatusCard({ status }) {
    if (!status || status.length === 0) {
        return (
            <div className={`${styles.statusCard} ${styles.empty}`}>
                <p>No Down Status</p>
            </div>
        );
    }

    return (
        <div className={styles.statusCard}>
            <h3 className={styles.statusTitle}>Station Status</h3>

            {status.map((s, i) => {
                // เลือกคลาสสีตามสถานะ
                const badgeClass = 
                    s.status === "Down" ? styles.red :
                    s.status === "Idle" ? styles.orange : styles.green;

                return (
                    <div key={i} className={styles.statusItem}>
                        <div className={styles.statusHeader}>
                            <div className={`${styles.statusBadge} ${badgeClass}`}>
                                {s.status}
                            </div>
                            <div className={styles.statusTime}>
                                🕒 {s.duedate_diff}
                            </div>
                        </div>

                        <div className={styles.statusDetail}>
                            <div className={`${styles.statusInfoGroup} ${styles.problemRow}`}>
                                <label>Problem Found</label>
                                <span>{s.problem_found || "-"}</span>
                            </div>

                            <div className={styles.statusInfoGroup}>
                                <label>Cause</label>
                                <span>{s.cause_of_problem || "-"}</span>
                            </div>

                            <div className={styles.statusInfoGroup}>
                                <label>Response</label>
                                <span>{s.response_down || "-"}</span>
                            </div>

                            <div className={styles.statusInfoGroup}>
                                <label>Alert By</label>
                                <span>{s.alert_by || "-"}</span>
                            </div>

                            <div className={styles.statusInfoGroup}>
                                <label>Verify By</label>
                                <span>{s.verify_by || "-"}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}