import "./ProjectDetails.css";

function ProjectDetails({ project, onClose }) {
    if (!project) return null;

    return (
        <div className="project-details">

            <div className="project-details-content">

                <div className="project-detail-item">
                    <span>Project Name</span>
                    <strong>{project.title}</strong>
                </div>

                <div className="project-detail-item">
                    <span>Client Name</span>
                    <strong>{project.client}</strong>
                </div>

                <div className="project-detail-item">
                    <span>Budget</span>
                    <strong>
                        ₹{Number(project.budget ?? 0).toLocaleString("en-IN")}
                    </strong>
                </div>

                <div className="project-detail-item">
                    <span>Status</span>
                    <strong>{project.status}</strong>
                </div>

                <div className="project-detail-item">
                    <span>Project ID</span>
                    <strong>{project.id}</strong>
                </div>

            </div>

            <div className="project-details-footer">
                <button
                    type="button"
                    className="details-close-btn"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>

        </div>
    );
}

export default ProjectDetails;