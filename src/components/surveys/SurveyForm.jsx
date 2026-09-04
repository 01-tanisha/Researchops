import { useEffect, useState } from "react";
import { createSurvey } from "../../services/api/surveyApi";
import { getClients, getProjects } from "../../services/api/projectApi";
import "./SurveyForm.css";

function SurveyForm({ onClose, onSurveyCreated }) {
    const [title, setTitle] = useState("");

    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);

    const [clientId, setClientId] = useState("");
    const [projectId, setProjectId] = useState("");

    const [client, setClient] = useState("");
    const [status, setStatus] = useState("Draft");

    // Survey Requirements
    const [targeting, setTargeting] = useState("");
    const [incidenceRate, setIncidenceRate] = useState("");
    const [loi, setLoi] = useState("");
    const [requiredCompletes, setRequiredCompletes] = useState("");
    const [clientCpi, setClientCpi] = useState("");

    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setIsLoadingData(true);
                setError("");

                const [clientsData, projectsData] = await Promise.all([
                    getClients(),
                    getProjects(),
                ]);

                setClients(
                    Array.isArray(clientsData)
                        ? clientsData
                        : []
                );

                setProjects(
                    Array.isArray(projectsData)
                        ? projectsData
                        : []
                );
            } catch (loadError) {
                console.error(
                    "Error loading clients/projects:",
                    loadError
                );

                setError(
                    loadError.message ||
                    "Failed to load clients and projects."
                );
            } finally {
                setIsLoadingData(false);
            }
        }

        loadData();
    }, []);

    const handleClientChange = (event) => {
        const selectedClientId = event.target.value;

        setClientId(selectedClientId);
        setProjectId("");

        const selectedClient = clients.find(
            (item) =>
                String(item.id) === String(selectedClientId)
        );

        setClient(
            selectedClient
                ? selectedClient.company || selectedClient.name
                : ""
        );
    };

    const filteredProjects = projects.filter((project) => {
        if (!clientId) {
            return false;
        }

        const projectClientId =
            project.client_id ??
            project.client_obj_id ??
            project.client_obj?.id;

        return (
            String(projectClientId) ===
            String(clientId)
        );
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Survey title is required.");
            return;
        }

        if (!clientId) {
            setError("Please select a client.");
            return;
        }

        if (!projectId) {
            setError("Please select a project.");
            return;
        }

        if (
            requiredCompletes !== "" &&
            Number(requiredCompletes) < 0
        ) {
            setError("Required completes cannot be negative.");
            return;
        }

        if (
            incidenceRate !== "" &&
            (Number(incidenceRate) < 0 ||
                Number(incidenceRate) > 100)
        ) {
            setError("Incidence rate must be between 0 and 100.");
            return;
        }

        if (loi !== "" && Number(loi) < 0) {
            setError("LOI cannot be negative.");
            return;
        }

        if (clientCpi !== "" && Number(clientCpi) < 0) {
            setError("Client CPI cannot be negative.");
            return;
        }

        try {
            setIsSaving(true);
            setError("");

            const survey = await createSurvey({
                title: title.trim(),

                // Keep old client field for compatibility
                client: client.trim(),

                // Relationships
                client_id: Number(clientId),
                project_id: Number(projectId),

                status,

                // Survey Requirements
                targeting: targeting.trim(),
                incidence_rate:
                    incidenceRate === ""
                        ? null
                        : Number(incidenceRate),
                loi:
                    loi === ""
                        ? null
                        : Number(loi),
                required_completes:
                    requiredCompletes === ""
                        ? 0
                        : Number(requiredCompletes),
                client_cpi:
                    clientCpi === ""
                        ? 0
                        : Number(clientCpi),
            });

            onSurveyCreated(survey);
        } catch (submitError) {
            console.error(
                "Error creating survey:",
                submitError
            );

            setError(
                submitError.message ||
                "Failed to create survey."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form
            className="survey-form"
            onSubmit={handleSubmit}
        >
            <h2>Add Survey</h2>

            <div className="form-group">
                <label>Survey Title</label>

                <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                        setTitle(event.target.value)
                    }
                    placeholder="Enter survey title"
                    disabled={isLoadingData}
                />
            </div>

            <div className="form-group">
                <label>Client</label>

                <select
                    value={clientId}
                    onChange={handleClientChange}
                    disabled={
                        isLoadingData ||
                        clients.length === 0
                    }
                >
                    <option value="">
                        {isLoadingData
                            ? "Loading clients..."
                            : clients.length === 0
                                ? "No clients available"
                                : "Select Client"}
                    </option>

                    {clients.map((item) => (
                        <option
                            key={item.id}
                            value={item.id}
                        >
                            {item.company || item.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Project</label>

                <select
                    value={projectId}
                    onChange={(event) =>
                        setProjectId(event.target.value)
                    }
                    disabled={
                        isLoadingData ||
                        !clientId ||
                        filteredProjects.length === 0
                    }
                >
                    <option value="">
                        {!clientId
                            ? "Select client first"
                            : filteredProjects.length === 0
                                ? "No projects for this client"
                                : "Select Project"}
                    </option>

                    {filteredProjects.map((project) => (
                        <option
                            key={project.id}
                            value={project.id}
                        >
                            {project.title}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Targeting</label>

                <textarea
                    value={targeting}
                    onChange={(event) =>
                        setTargeting(event.target.value)
                    }
                    placeholder="Example: Male, 25-40, Delhi"
                    rows="3"
                />
            </div>

            <div className="form-group">
                <label>Incidence Rate (%)</label>

                <input
                    type="number"
                    value={incidenceRate}
                    onChange={(event) =>
                        setIncidenceRate(event.target.value)
                    }
                    placeholder="Example: 35"
                    min="0"
                    max="100"
                    step="0.01"
                />
            </div>

            <div className="form-group">
                <label>LOI (Minutes)</label>

                <input
                    type="number"
                    value={loi}
                    onChange={(event) =>
                        setLoi(event.target.value)
                    }
                    placeholder="Example: 10"
                    min="0"
                    step="0.01"
                />
            </div>

            <div className="form-group">
                <label>Required Completes</label>

                <input
                    type="number"
                    value={requiredCompletes}
                    onChange={(event) =>
                        setRequiredCompletes(event.target.value)
                    }
                    placeholder="Example: 100"
                    min="0"
                    step="1"
                />
            </div>

            <div className="form-group">
                <label>Client CPI (₹)</label>

                <input
                    type="number"
                    value={clientCpi}
                    onChange={(event) =>
                        setClientCpi(event.target.value)
                    }
                    placeholder="Example: 50"
                    min="0"
                    step="0.01"
                />
            </div>

            <div className="form-group">
                <label>Status</label>

                <select
                    value={status}
                    onChange={(event) =>
                        setStatus(event.target.value)
                    }
                >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                    <option value="Billed">Billed</option>
                </select>
            </div>

            {error && (
                <p className="survey-error">
                    {error}
                </p>
            )}

            <div className="survey-form-actions">
                <button
                    type="button"
                    className="survey-cancel-btn"
                    onClick={onClose}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="survey-save-btn"
                    disabled={
                        isSaving ||
                        isLoadingData
                    }
                >
                    {isSaving
                        ? "Saving..."
                        : "Create Survey"}
                </button>
            </div>
        </form>
    );
}

export default SurveyForm;