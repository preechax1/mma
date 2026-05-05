import KpiCard from "./KpiCard";

export default function KpiGrid({ kpiTotals }) {
  return (
    <div className="kpi-grid">
      {kpiTotals.map((item, index) => (
        <KpiCard key={index} item={item} />
      ))}
    </div>
  );
}