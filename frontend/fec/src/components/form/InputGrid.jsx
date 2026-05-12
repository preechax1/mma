import styles from "./InputGrid.module.css";

export default function InputGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}