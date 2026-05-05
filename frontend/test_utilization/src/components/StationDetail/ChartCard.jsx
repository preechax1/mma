import styles from "./ChartCard.module.css";

export default function ChartCard({ title, children }) {
    return (
        <div className={styles.chartCard}>
            {title && (
                <div className={styles.header}>
                    <h3 className={styles.chartTitle}>
                        {title}
                    </h3>
                    <div className={styles.titleUnderline}></div>
                </div>
            )}
            <div className={styles.chartContent}>
                {children}
            </div>
        </div>
    );
}