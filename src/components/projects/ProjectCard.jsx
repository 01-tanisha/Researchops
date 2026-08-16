import "./ProjectCard.css";


function ProjectCard({ project, onDelete, onEdit }) {

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

                <button onClick={() => onEdit(project)}>Edit</button>

                <button type="button" onClick={() => onDelete(project)}>

                    Delete

                </button>

            </div>

        </div>

    );
}

export default ProjectCard;