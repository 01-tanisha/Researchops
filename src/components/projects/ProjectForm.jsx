import "../../pages/Projects.css";

function ProjectForm({
  title,
  setTitle,
  client,
  setClient,
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
        <input
          type="text"
          placeholder="Enter Client Name"
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />
      </div>

      <div>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Active</option>
          <option>Completed</option>
          <option>Paused</option>
        </select>
      </div>

      <div className="project-form-buttons">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="save-btn" onClick={onSave}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export default ProjectForm;
