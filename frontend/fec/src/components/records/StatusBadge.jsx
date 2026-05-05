import { COLORS } from "../../constants/colors";

function hexToRGBA(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function StatusBadge({ status }) {
  const color = COLORS[status?.trim()] || "#9ca3af";

  return (
    <div
      className="status-badge"
      style={{
        backgroundColor: hexToRGBA(color, 0.15),
        color: color,
        border: `1px solid ${hexToRGBA(color, 0.4)}`
      }}
    >
      {status}
    </div>
  );
}