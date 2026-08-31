import styles from "./AppCard.module.css";

const accentClass = {
  fec: styles.fec,
  test: styles.test,
};

export default function AppCard({ title, description, accent, onClick, buttonLabel }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <button className={`${styles.button} ${accentClass[accent] || ""}`} onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  );
}
