export default function DashboardHeader({ time }) {
  return (
    <div className="dashboard-header">
      <h1 className="dashboard-title">FEC DASHBOARD</h1>
      <div className="dashboard-clock">{time.toLocaleString()}</div>
    </div>
  );
}