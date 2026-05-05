export default function Card({ title, value, color }) {
  return (
    <div className="card" style={{ borderLeft: `6px solid ${color || "#3b82f6"}` }}>
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
    </div>
  );
}