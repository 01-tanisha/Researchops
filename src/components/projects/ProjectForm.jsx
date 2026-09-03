import "../../pages/Projects.css";

function ProjectForm({
    title,
    setTitle,
    client,
    setClient,
    status,
    setStatus,
    budget,
    setBudget,
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
                <input
                    type="text"
                    placeholder="Enter Client Name"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                />
            </div>

            <div>
                <label>Budget</label>
                <input
                    type="number"
                    placeholder="Enter Project Budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    step="0.01"
                />
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