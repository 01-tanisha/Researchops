import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import SearchBar from "../components/projects/SearchBar";
import AddProjectButton from "../components/projects/AddProjectButton";
import ProjectForm from "../components/projects/ProjectForm";
import "./Projects.css";
import DashboardLayout from "../components/layout/DashboardLayout";
import ConfirmationModal from "../components/common/ConfirmationModal";

import {
    getProjects,
    createProject,
    updateProject as updateProjectApi,
    deleteProject as deleteProjectApi,
    getClients,
    getDashboardProjectManagers,
    getVendorAllocations,
} from "../services/api/projectApi";
import { getSurveyAnalytics, getSurveys } from "../services/api/surveyApi";

function Projects() {
    const [searchTerm, setSearchTerm] = useState("");
    const [projectStatusFilter, setProjectStatusFilter] = useState("All");
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [projectManagers, setProjectManagers] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [allocationsBySurvey, setAllocationsBySurvey] = useState({});
    const [analyticsBySurvey, setAnalyticsBySurvey] = useState({});

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [title, setTitle] = useState("");
    const [client, setClient] = useState("");
    const [clientId, setClientId] = useState("");
    const [projectManagerId, setProjectManagerId] = useState("");
    const [status, setStatus] = useState("Active");

    const [editingProject, setEditingProject] = useState(null);

    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: null,
        projectId: null,
    });

    useEffect(() => {
        async function fetchData() {
            try {
                setError("");

                const [projectsData, clientsData, surveysData, managersData] = await Promise.all([
                    getProjects(),
                    getClients(),
                    getSurveys(),
                    getDashboardProjectManagers(),
                ]);

                setProjects(
                    Array.isArray(projectsData) ? projectsData : []
                );

                setClients(
                    Array.isArray(clientsData) ? clientsData : []
                );
                setProjectManagers(
                    Array.isArray(managersData)
                        ? managersData.filter((manager) => manager.is_active)
                        : []
                );

                const safeSurveys = Array.isArray(surveysData) ? surveysData : [];
                setSurveys(safeSurveys);

                const allocationResults = await Promise.allSettled(
                    safeSurveys.map((survey) => getVendorAllocations(survey.id))
                );
                const analyticsResults = await Promise.allSettled(
                    safeSurveys.map((survey) => getSurveyAnalytics(survey.id))
                );
                setAllocationsBySurvey(
                    Object.fromEntries(
                        allocationResults.flatMap((result, index) =>
                            result.status === "fulfilled" && Array.isArray(result.value)
                                ? [[safeSurveys[index].id, result.value]]
                                : []
                        )
                    )
                );
                setAnalyticsBySurvey(
                    Object.fromEntries(
                        analyticsResults.flatMap((result, index) =>
                            result.status === "fulfilled"
                                ? [[safeSurveys[index].id, result.value]]
                                : []
                        )
                    )
                );
            } catch (error) {
                console.error("Error fetching project data:", error);
                setError(
                    "Unable to load projects or clients. Please try again."
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    function handleClientChange(value) {
        setClientId(value);

        const selectedClient = clients.find(
            (item) => String(item.id) === String(value)
        );

        setClient(
            selectedClient
                ? selectedClient.company || selectedClient.name
                : ""
        );
    }

    async function addProject() {
        if (title.trim() === "" || !clientId) {
            alert("Please fill all fields.");
            return;
        }

        const newProject = {
            title,
            client,
            client_id: Number(clientId),
            project_manager_id: projectManagerId || null,
            status,
        };

        try {
            const createdProject = await createProject(newProject);

            setProjects((currentProjects) => [
                ...currentProjects,
                createdProject,
            ]);

            resetForm();
            setIsModalOpen(false);

            setConfirmation({
                isOpen: false,
                type: null,
                projectId: null,
            });
        } catch (error) {
            console.error("Error adding project:", error);
            alert(error.message || "Could not add project.");
        }
    }

    async function updateProject() {
        if (!editingProject) return;

        if (title.trim() === "" || !clientId) {
            alert("Please fill all fields.");
            return;
        }

        try {
            const updatedProject = await updateProjectApi(
                editingProject.id,
                {
                    title,
                    client,
                    client_id: Number(clientId),
                    project_manager_id: projectManagerId || null,
                    status,
                }
            );

            setProjects((currentProjects) =>
                currentProjects.map((project) =>
                    project.id === updatedProject.id
                        ? updatedProject
                        : project
                )
            );

            resetForm();

            setEditingProject(null);
            setIsModalOpen(false);

            setConfirmation({
                isOpen: false,
                type: null,
                projectId: null,
            });
        } catch (error) {
            console.error("Error updating project:", error);
            alert(error.message || "Unable to update project.");
        }
    }

    async function deleteProject(projectId) {
        try {
            await deleteProjectApi(projectId);

            setProjects((currentProjects) =>
                currentProjects.filter(
                    (project) => project.id !== projectId
                )
            );

            setConfirmation({
                isOpen: false,
                type: null,
                projectId: null,
            });
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Unable to delete project.");
        }
    }

    function resetForm() {
        setTitle("");
        setClient("");
        setClientId("");
        setProjectManagerId("");
        setStatus("Active");
    }

    function openDeleteConfirmation(projectOrId) {
        const projectId =
            typeof projectOrId === "object" && projectOrId !== null
                ? projectOrId.id ??
                  projectOrId.project_id ??
                  null
                : projectOrId;

        if (!projectId) {
            alert("Unable to delete this project. Missing project ID.");
            return;
        }

        setConfirmation({
            isOpen: true,
            type: "delete",
            projectId,
        });
    }

    function handleSaveProject() {
        if (editingProject) {
            setConfirmation({
                isOpen: true,
                type: "update",
                projectId: editingProject.id,
            });

            return;
        }

        setConfirmation({
            isOpen: true,
            type: "add",
            projectId: null,
        });
    }

    function openEditModal(project) {
        setEditingProject(project);

        setTitle(project.title || "");

        const existingClientId =
            project.client_id ??
            project.client_obj_id ??
            project.client_obj?.id ??
            "";

        setClientId(existingClientId);
        setProjectManagerId(project.project_manager_id ?? "");

        setClient(
            project.client ||
            project.client_name ||
            project.clientName ||
            ""
        );

        setStatus(project.status || "Active");

        setIsModalOpen(true);
    }

    async function confirmDelete() {
        const id = confirmation.projectId;

        if (!id) return;

        await deleteProject(id);
    }

    async function confirmAdd() {
        await addProject();
    }

    const filteredProjects = projects.filter((project) => {
        const search = searchTerm.trim().toLowerCase();

        const matchesStatus =
            projectStatusFilter === "All" ||
            project.status === projectStatusFilter;

        if (!matchesStatus) return false;

        if (!search) return true;

        const title = String(
            project.title ?? ""
        ).toLowerCase();

        const client = String(
            project.client ??
            project.client_name ??
            project.clientName ??
            ""
        ).toLowerCase();

        return (
            title.includes(search) ||
            client.includes(search) ||
            surveys.some((survey) => {
                const surveyProjectId = survey.project_id ?? survey.project;
                return (
                    String(surveyProjectId) === String(project.id) &&
                    String(survey.title ?? "").toLowerCase().includes(search)
                );
            })
        );
    });

    const projectRows = filteredProjects.flatMap((project) => {
        const projectSurveys = surveys.filter(
            (survey) =>
                String(survey.project_id ?? survey.project) === String(project.id)
        );
        const clientId = project.client_obj_id ?? project.client_obj;
        const clientRecord = clients.find(
            (item) => String(item.id) === String(clientId)
        );
        const clientName =
            clientRecord?.company || clientRecord?.name || project.client || "—";

        if (projectSurveys.length === 0) {
            return [{ project, clientName, survey: null, allocation: null }];
        }

        return projectSurveys.flatMap((survey) => {
            const allocations = allocationsBySurvey[survey.id] ?? [];
            const rows = allocations.length > 0 ? allocations : [null];
            return rows.map((allocation) => ({
                project,
                clientName,
                survey,
                allocation,
            }));
        });
    });

    return (
        <DashboardLayout>
            <div className="dashboard-content">

                <div className="projects-header">
                    <h1>Projects</h1>

                    <div className="projects-header-actions">
                        <label className="project-status-filter">
                            <span>Status</span>
                            <select
                                value={projectStatusFilter}
                                onChange={(event) => setProjectStatusFilter(event.target.value)}
                                aria-label="Filter projects by status"
                            >
                                <option value="All">All projects</option>
                                <option value="Active">Active</option>
                                <option value="Paused">Paused</option>
                                <option value="Draft">Draft</option>
                                <option value="Billed">Billed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </label>
                        <AddProjectButton
                            onClick={() => {
                                setEditingProject(null);
                                resetForm();
                                setIsModalOpen(true);
                            }}
                        />
                    </div>
                </div>

                <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={
                        editingProject
                            ? "Edit Project"
                            : "Add Project"
                    }
                >
                    <ProjectForm
                        title={title}
                        setTitle={setTitle}

                        clientId={clientId}
                        setClientId={handleClientChange}
                        clients={clients}
                        projectManagerId={projectManagerId}
                        setProjectManagerId={setProjectManagerId}
                        projectManagers={projectManagers}

                        status={status}
                        setStatus={setStatus}

                        onSave={handleSaveProject}

                        onCancel={() => {
                            setIsModalOpen(false);
                            setEditingProject(null);
                            resetForm();
                        }}

                        buttonLabel={
                            editingProject
                                ? "Update Project"
                                : "Add Project"
                        }
                    />
                </Modal>

                <div className="projects-table-wrap">
                    {isLoading ? (
                        <div className="projects-message">
                            <p>Loading projects...</p>
                        </div>
                    ) : error ? (
                        <div className="projects-message projects-error">
                            <h3>Unable to load projects</h3>
                            <p>{error}</p>
                        </div>
                    ) : projectRows.length === 0 ? (
                        <div className="projects-message">
                            <h3>No projects found</h3>
                            <p>
                                Try changing your search or add a new project.
                            </p>
                        </div>
                    ) : (
                        <table className="projects-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Client</th>
                                    <th>Project Manager</th>
                                    <th>Survey</th>
                                    <th>Client LOI</th>
                                    <th>Vendor</th>
                                    <th>Vendor LOI</th>
                                    <th>Survey IR</th>
                                    <th>Assigned</th>
                                    <th>Delivered</th>
                                    <th>Vendor CPI</th>
                                    <th>Client CPI</th>
                                    <th>Profit Margin</th>
                                    <th>Actions</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectRows.map(({ project, clientName, survey, allocation }, index) => {
                                    const clientCpi = Number(survey?.client_cpi ?? 0);
                                    const vendorCpi = Number(allocation?.vendor_cpi ?? 0);
                                    const profitMargin = clientCpi > 0 && allocation?.vendor_cpi != null
                                        ? ((clientCpi - vendorCpi) / clientCpi) * 100
                                        : null;

                                    return (
                                        <tr key={`${project.id}-${survey?.id ?? "none"}-${allocation?.id ?? index}`}>
                                            <td className="project-name-cell">{project.title}</td>
                                            <td>{clientName}</td>
                                            <td>{project.project_manager_name || "Unassigned"}</td>
                                            <td>{survey?.title || "—"}</td>
                                            <td>{survey?.loi != null ? `${survey.loi} min` : "—"}</td>
                                            <td>{allocation?.vendor_name || allocation?.vendor?.name || "—"}</td>
                                            <td>{analyticsBySurvey[survey?.id]?.loi != null ? `${analyticsBySurvey[survey.id].loi} min` : "—"}</td>
                                            <td>{analyticsBySurvey[survey?.id]?.incidence_rate != null ? `${analyticsBySurvey[survey.id].incidence_rate}%` : "—"}</td>
                                            <td>{allocation?.assigned_completes ?? "—"}</td>
                                            <td>{allocation?.delivered_completes ?? "—"}</td>
                                            <td>{allocation?.vendor_cpi != null ? `₹${allocation.vendor_cpi}` : "—"}</td>
                                            <td>{survey?.client_cpi != null ? `₹${survey.client_cpi}` : "—"}</td>
                                            <td>{profitMargin != null ? `${profitMargin.toFixed(2)}%` : "—"}</td>
                                            <td>
                                                <div className="project-row-actions">
                                                    <button type="button" onClick={() => openEditModal(project)}>Edit</button>
                                                    <button type="button" onClick={() => openDeleteConfirmation(project)}>Delete</button>
                                                </div>
                                            </td>
                                            <td><span className={`status ${String(project.status ?? "").toLowerCase()}`}>{project.status}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={
                    confirmation.type === "delete"
                        ? "Delete Project?"
                        : confirmation.type === "add"
                            ? "Add Project?"
                            : "Update Project?"
                }
                message={
                    confirmation.type === "delete"
                        ? "Are you sure you want to permanently delete this project?"
                        : confirmation.type === "add"
                            ? "Are you sure you want to add this project?"
                            : "Are you sure you want to save these changes to this project?"
                }
                confirmText={
                    confirmation.type === "delete"
                        ? "Delete"
                        : confirmation.type === "add"
                            ? "Add"
                            : "Update"
                }
                onCancel={() =>
                    setConfirmation({
                        isOpen: false,
                        type: null,
                        projectId: null,
                    })
                }
                onConfirm={
                    confirmation.type === "delete"
                        ? confirmDelete
                        : confirmation.type === "add"
                            ? confirmAdd
                            : updateProject
                }
            />
        </DashboardLayout>
    );
}

export default Projects;