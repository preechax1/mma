import { useEffect } from "react";

export default function SelectField({
  label,
  name,
  value,
  options = [],
  textKey,
  onChange,
  disabled
}) {

  // 🔥 ถ้า value ว่าง → เลือกตัวแรกอัตโนมัติ
  useEffect(() => {
    if ((!value || value === "") && options.length > 0) {
      const firstOption = options[0];

      if (firstOption?.id !== undefined) {
        onChange({
          target: {
            name,
            value: firstOption.id
          }
        });
      }
    }
  }, [options]);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>

      <select
        name={name}
        value={value || (options[0]?.id ?? "")}
        onChange={onChange}
        disabled={disabled}
        className="w-full border bg-white text-gray-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
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