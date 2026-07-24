import "./ProjectCard.css";


function ProjectCard({ project, deleteProject  }) {

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

                <button onClick={() => {
                    if (window.confirm('Are you sure you want to delete this project?')) {
                        deleteProject(project.id);
                    }
                }}>

                    Delete

                </button>

            </div>

        </div>

    );
}

export default ProjectCard;