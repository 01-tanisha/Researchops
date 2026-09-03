import "./ActivityPanel.css";

function ActivityPanel({
    activities = [],
    loading = false,
    error = ""
}) {
    return (
        <div className="activity-panel">

            <h2>Recent Activity</h2>

            {loading && (
                <p className="activity-message">
                    Loading recent activity...
                </p>
            )}

            {error && (
                <p className="activity-error">
                    {error}
                </p>
            )}

            {!loading && !error && activities.length === 0 && (
                <p className="activity-message">
                    No recent activity.
                </p>
            )}

            {!loading && !error && activities.length > 0 && (
                <ul>
                    {activities.map((activity) => (
                        <li key={activity.id}>
                            {activity.text}
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
}

export default ActivityPanel;