import styles from "./TextareaField.module.css";

export default function TextareaField({
  label,
  name,
  value,
  onChange,
  disabled,
}) {
  return (
    <div className={styles.fieldWrapper}>
      <label className={styles.label}>{label}</label>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        rows={3}
        className={styles.textarea}
      />
    </div>
  );
}