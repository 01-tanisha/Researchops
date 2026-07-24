import "./ProjectCard.css";

function ProjectCard({ project }) {

    const statusClass = project.status.toLowerCase();

    return (

        <div className="project-card">

            <h3>{project.title}</h3>

            <p><strong>Client:</strong> {project.client}</p>

            <span className={`status ${statusClass}`}>
                {project.status}
            </span>

            <div className="card-footer">

                <button>View</button>

                <button>Edit</button>

                <button>Delete</button>

            </div>

        </div>

    );
}

export default ProjectCard;