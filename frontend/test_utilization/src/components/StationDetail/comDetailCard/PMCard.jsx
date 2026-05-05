import styles from "./PMCard.module.css";

export default function PMCard({ pm }) {
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getStatus = () => {
        if (!pm) return { text: "-", color: "#94a3b8" }; 

        const d = pm.due_in_days;
        if (d < 0) return { text: "OVERDUE", color: "#ef4444" };   
        if (d <= 7) return { text: "URGENT", color: "#f59e0b" };  
        if (d <= 30) return { text: "DUE SOON", color: "#eab308" }; 

        return { text: "OK", color: "#10b981" }; 
    };

    const status = getStatus();

    return (
        <div className={styles.pmCard}>
            <div className={styles.pmHeader}>
                <img src="/hana.jpg" className={styles.pmLogo} alt="logo" />
                <h6 className={styles.pmTitle}>Preventive Maintenance</h6>
            </div>

            <div className={styles.pmBody}>
                <div className={styles.pmRow}>
                    <span className={styles.pmLabel}>M/C NAME</span>
                    <span className={styles.pmValue}>{pm?.station || "-"}</span>
                </div>

                <div className={styles.pmRow}>
                    <span className={styles.pmLabel}>LAST PM</span>
                    <span className={styles.pmValue}>{formatDate(pm?.pm_date)}</span>
                </div>

                <div className={styles.pmRow}>
                    <span className={styles.pmLabel}>NEXT DUE</span>
                    <span 
                        className={styles.pmValue} 
                        style={{ color: status.text === "OVERDUE" ? "#ef4444" : "#197916" }}
                    >
                        {formatDate(pm?.pm_duedate)}
                    </span>
                </div>
            </div>

            <div className={styles.pmFooter}>
                <span className={styles.daysLeftText}>
                    {pm?.due_in_days >= 0 ? `${pm.due_in_days} Days Left` : 'Late'}
                </span>
                <span
                    className={styles.pmStatusBadge}
                    style={{ background: status.color }}
                >
                    {status.text}
                </span>
            </div>
        </div>
    );
}