import "../../pages/Projects.css";

function ProjectForm({
    title,
    setTitle,
    clientId,
    setClientId,
    clients = [],
    projectManagerId,
    setProjectManagerId,
    projectManagers = [],
    status,
    setStatus,
    onSave,
    onCancel,
    buttonLabel = "Add Project",
}) {
    return (
        <div className="project-form">

            <div>
                <label>Project Name</label>
                <input
                    type="text"
                    placeholder="Enter Project Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div>
                <label>Client Name</label>
                <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                >
                    <option value="">
                        Select Client
                    </option>

                    {clients.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.company || item.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Project Manager</label>
                <select
                    value={projectManagerId}
                    onChange={(event) => setProjectManagerId(event.target.value)}
                >
                    <option value="">Unassigned</option>
                    {projectManagers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                            {manager.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Paused">Paused</option>
                    <option value="Draft">Draft</option>
                    <option value="Billed">Billed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="project-form-buttons">
                <button
                    type="button"
                    className="cancel-btn"
                    onClick={onCancel}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="save-btn"
                    onClick={onSave}
                >
                    {buttonLabel}
                </button>
            </div>

        </div>
    );
}

export default ProjectForm;