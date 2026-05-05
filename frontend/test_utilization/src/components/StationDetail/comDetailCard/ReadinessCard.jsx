import styles from "./ReadinessCard.module.css";

export default function ReadinessCard({ status }) {
    if (!status) return null;

    const isReady = status.readiness === "Ready";

    return (
        <div className={styles.readinessCard}>
            <h3 className={styles.readinessTitle}>
                <span style={{ color: isReady ? '#16a34a' : '#dc2626' }}>●</span> 
                Station Readiness
            </h3>

            <div className={styles.readinessRow}>
                <span className={styles.rowLabel}>PM Status</span>
                <span className={status.PM === "Done" ? styles.ok : styles.bad}>
                    {status.PM}
                </span>
            </div>

            <div className={styles.readinessRow}>
                <span className={styles.rowLabel}>Equipment</span>
                <span className={status.eqs === "OK" ? styles.ok : styles.bad}>
                    {status.eqs}
                </span>
            </div>

            <div className={styles.readinessRow}>
                <span className={styles.rowLabel}>Z-Chart</span>
                <span className={status.rec_z_chart === "Run" ? styles.ok : styles.bad}>
                    {status.rec_z_chart}
                </span>
            </div>

            {/* ส่วนสรุปผลด้านล่างสุด */}
            <div className={`${styles.readinessResult} ${isReady ? styles.ready : styles.notReady}`}>
                {isReady ? "✓ " : "⚠ "} {status.readiness}
            </div>
        </div>
    );
}