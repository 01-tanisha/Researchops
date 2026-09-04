import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import SearchBar from "../components/projects/SearchBar";
import AddProjectButton from "../components/projects/AddProjectButton";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectDetails from "../components/projects/ProjectDetails";
import "./Projects.css";
import DashboardLayout from "../components/layout/DashboardLayout";
import ConfirmationModal from "../components/common/ConfirmationModal";

import {
    getProjects,
    createProject,
    updateProject as updateProjectApi,
    deleteProject as deleteProjectApi,
    getClients,
} from "../services/api/projectApi";

function Projects() {
    const [searchTerm, setSearchTerm] = useState("");
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [title, setTitle] = useState("");
    const [client, setClient] = useState("");
    const [clientId, setClientId] = useState("");
    const [status, setStatus] = useState("Active");
    const [budget, setBudget] = useState("");

    const [editingProject, setEditingProject] = useState(null);
    const [viewingProject, setViewingProject] = useState(null);

    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: null,
        projectId: null,
    });

    useEffect(() => {
        async function fetchData() {
            try {
                setError("");

                const [projectsData, clientsData] = await Promise.all([
                    getProjects(),
                    getClients(),
                ]);

                setProjects(
                    Array.isArray(projectsData) ? projectsData : []
                );

                setClients(
                    Array.isArray(clientsData) ? clientsData : []
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
            status,
            budget: budget === "" ? 0 : Number(budget),
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
                    status,
                    budget: budget === "" ? 0 : Number(budget),
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
        setStatus("Active");
        setBudget("");
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

    function openViewModal(project) {
        setViewingProject(project);
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

        setClient(
            project.client ||
            project.client_name ||
            project.clientName ||
            ""
        );

        setStatus(project.status || "Active");
        setBudget(project.budget ?? "");

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
            client.includes(search)
        );
    });

    return (
        <DashboardLayout>
            <div className="dashboard-content">

                <div className="projects-header">
                    <h1>Projects</h1>

                    <AddProjectButton
                        onClick={() => {
                            setEditingProject(null);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                    />
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

                        client={client}
                        setClient={setClient}

                        clientId={clientId}
                        setClientId={handleClientChange}
                        clients={clients}

                        status={status}
                        setStatus={setStatus}

                        budget={budget}
                        setBudget={setBudget}

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

                <Modal
                    isOpen={viewingProject !== null}
                    onClose={() => setViewingProject(null)}
                    title="Project Details"
                >
                    <ProjectDetails
                        project={viewingProject}
                        onClose={() => setViewingProject(null)}
                    />
                </Modal>

                <div className="projects-grid">
                    {isLoading ? (
                        <div className="projects-message">
                            <p>Loading projects...</p>
                        </div>
                    ) : error ? (
                        <div className="projects-message projects-error">
                            <h3>Unable to load projects</h3>
                            <p>{error}</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="projects-message">
                            <h3>No projects found</h3>
                            <p>
                                Try changing your search or add a new project.
                            </p>
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDelete={openDeleteConfirmation}
                                onEdit={openEditModal}
                                onView={openViewModal}
                            />
                        ))
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