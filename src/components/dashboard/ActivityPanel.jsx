import "./ActivityPanel.css";

function ActivityPanel({ activities = [] }) {

    return(

        <div className="activity-panel">

            <h2>

                Recent Activity

            </h2>

            <ul>

              {activities.length === 0 ? (
                <li className="activity-empty">No recent activity found.</li>
              ) : (
                activities.map((activity) => (
                  <li key={activity.id}>{activity.text}</li>
                ))
              )}

            </ul>

        </div>

    );

}

export default ActivityPanel;