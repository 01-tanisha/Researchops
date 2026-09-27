import "./Users.css";

function Users({
  managers = [],
  loading = false,
}) {
  return (
    <div className="users-panel">
      <div className="manager-panel-heading">
        <h2>Project Managers</h2>
        <span>{loading ? "…" : managers.length}</span>
      </div>
      {loading ? (
        <p className="manager-panel-empty">Loading manager directory...</p>
      ) : managers.length === 0 ? (
        <p className="manager-panel-empty">No project managers are available.</p>
      ) : (
        <ul className="manager-summary-list">
          {managers.slice(0, 5).map((manager) => (
            <li key={manager.id}>
              <span className="manager-summary-avatar">
                {(manager.name || "P").charAt(0).toUpperCase()}
              </span>
              <span className="manager-summary-name">
                <strong>{manager.name}</strong>
                <small>{manager.company || manager.job_title || "Project Manager"}</small>
              </span>
              <span className={`manager-summary-state ${manager.is_active ? "active" : "inactive"}`}>
                {manager.is_active ? "Active" : "Setup"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;