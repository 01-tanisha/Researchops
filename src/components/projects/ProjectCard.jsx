import "./ProjectCard.css";


function ProjectCard({ project, onDelete, onEdit, onView }) {

    const statusClass = String(
        project.status ?? ""
    ).toLowerCase();

    function handleView() {

        if (onView) {
            onView(project);
        }

    }


    return (

        <div className="project-card">

            <h3>{project.title}</h3>

            <p>
                <strong>Client:</strong> {project.client}
            </p>

            <span className={`status ${statusClass}`}>
                {project.status}
            </span>

            <div className="card-footer">

                <button
                    type="button"
                    onClick={handleView}
                >
                    View
                </button>

                <button
                    type="button"
                    onClick={() => onEdit(project)}
                >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={() => onDelete(project)}
                >
                    Delete
                </button>

            </div>

        </div>

    );
}

export default ProjectCard;