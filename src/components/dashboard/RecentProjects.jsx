import "./RecentProjects.css";

function RecentProjects({ projects = [] }) {
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="recent-projects">
      <h2>Recent Projects</h2>

      {recentProjects.length === 0 ? (
        <p className="recent-projects-empty">
          No projects available yet.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {recentProjects.map((project) => (
              <tr key={project.id}>
                <td>{project.title}</td>
                <td>{project.client}</td>
                <td>{project.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RecentProjects;