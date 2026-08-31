import styles from "./FormCard.module.css";

export default function FormCard({ title, children }) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.indicator}></div>
                <h2 className={styles.title}>{title}</h2>
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    );
}