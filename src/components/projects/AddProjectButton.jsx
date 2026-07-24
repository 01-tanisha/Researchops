function AddProjectButton({ onClick }) {

    return (

        <button
            className="add-project"
            onClick={onClick}
        >
            + Add Project
        </button>

    );
}

export default AddProjectButton;