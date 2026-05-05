import { COLORS } from "../../constants/colors";

export default function KpiCard({ item }) {
  return (
    <div
      className="kpi-card"
      style={{ background: COLORS[item.name] || "#334155" }}
    >
      <div className="kpi-title">{item.name}</div>
      <div className="kpi-value">{item.value}</div>
    </div>
  );
}