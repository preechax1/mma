import styles from "./InputField.module.css";

export default function InputField({
  label,
  name,
  value,
  onChange,
  disabled,
}) {
  return (
    <div className={styles.fieldWrapper}>
      <label className={styles.label}>{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={styles.input}
      />
    </div>
  );
}