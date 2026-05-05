export default function InputField({
  label,
  name,
  value,
  onChange,
  disabled
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full border bg-white text-gray-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
      />
    </div>
  );
}