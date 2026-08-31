import { useEffect } from "react";
import styles from "./SelectField.module.css";

export default function SelectField({
    label,
    name,
    value,
    options = [],
    textKey,
    onChange,
    disabled,
}) {
    // 🔥 ถ้า value ว่าง → เลือกตัวแรกอัตโนมัติ
    useEffect(() => {
        if ((!value || value === "") && options.length > 0) {
            const firstOption = options[0];

            if (firstOption?.id !== undefined) {
                onChange({
                    target: {
                        name,
                        value: firstOption.id,
                    },
                });
            }
        }
    }, [options]);

    return (
        <div className={styles.fieldWrapper}>
            <label className={styles.label}>{label}</label>
            <select
                name={name}
                value={value || (options[0]?.id ?? "")}
                onChange={onChange}
                disabled={disabled}
                className={styles.select}
            >
                {options.map((item, index) => (
                    <option key={index} value={item.id}>
                        {item[textKey]}
                    </option>
                ))}
            </select>
        </div>
    );
}
