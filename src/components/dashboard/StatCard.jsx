import "./Stat.css";

function StatCard({ title, value, color }) {
  return (
    <div className="stat-card">

      <h4>{title}</h4>

      <h2 style={{ color }}>{value}</h2>

    </div>
  );
}

export default StatCard;