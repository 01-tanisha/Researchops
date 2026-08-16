import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import SearchBar from "../components/projects/SearchBar";
import AddProjectButton from "../components/projects/AddProjectButton";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import "./Projects.css";
import DashboardLayout from "../components/layout/DashboardLayout";
import ConfirmationModal from "../components/common/ConfirmationModal";
import {
    getProjects,
    createProject,
    updateProject as updateProjectApi,
    deleteProject as deleteProjectApi
} from "../services/api/projectApi";


function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState("Active");
  const [editingProject, setEditingProject] = useState(null);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    type: null,
    projectId: null,
  });


 useEffect(() => {

    async function fetchProjects() {

        try {

            const data = await getProjects();

            setProjects(data);

        } catch (error) {

            console.error(
                "Error fetching projects:",
                error
            );

        } finally {

            setIsLoading(false);

        }

    }

    fetchProjects();

}, []);


  async function addProject() {
    if (title.trim() === "" || client.trim() === "") {
      alert("Please fill all fields.");
      return;
    }

    const newProject = { title, client, status };

    try {
      const createdProject = await createProject(newProject);

      setProjects((currentProjects) => [...currentProjects, createdProject]);
      setTitle("");
      setClient("");
      setStatus("Active");
      setIsModalOpen(false);
      setConfirmation({ isOpen: false, type: null, projectId: null });
    } catch (error) {
      console.error("Error adding project:", error);
      alert(error.message || "Could not add project.");
    }
  }

  async function updateProject() {
    if (!editingProject) return;
    if (title.trim() === "" || client.trim() === "") {
      alert("Please fill all fields.");
      return;
    }

    try {
      const updatedProject = await updateProjectApi(editingProject.id, {
        title,
        client,
        status,
      });

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      );

      setTitle("");
      setClient("");
      setStatus("Active");
      setEditingProject(null);
      setIsModalOpen(false);
      setConfirmation({ isOpen: false, type: null, projectId: null });
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Unable to update project.");
    }
  }

  async function deleteProject(projectId) {
    try {
      await deleteProjectApi(projectId);

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId)
      );

      setConfirmation({ isOpen: false, type: null, projectId: null });
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Unable to delete project.");
    }
  }

  function openDeleteConfirmation(projectOrId) {
    const projectId =
      typeof projectOrId === "object" && projectOrId !== null
        ? projectOrId.id ?? projectOrId.project_id ?? null
        : projectOrId;

    if (!projectId) {
      alert("Unable to delete this project. Missing project ID.");
      return;
    }

    setConfirmation({ isOpen: true, type: "delete", projectId });
  }

  function handleSaveProject() {
    if (editingProject) {
      setConfirmation({ isOpen: true, type: "update", projectId: editingProject.id });
      return;
    }

    setConfirmation({ isOpen: true, type: "add", projectId: null });
  }

  function openEditModal(project) {
    setEditingProject(project);
    setTitle(project.title);
    setClient(project.client);
    setStatus(project.status);
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

    const title = String(project.title ?? "").toLowerCase();
    const client = String(
      project.client ?? project.client_name ?? project.clientName ?? ""
    ).toLowerCase();

    return title.includes(search) || client.includes(search);
  });

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        <div className="projects-header">
          <h1>Projects</h1>
          <AddProjectButton onClick={() => setIsModalOpen(true)} />
        </div>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ProjectForm
            title={title}
            setTitle={setTitle}
            client={client}
            setClient={setClient}
            status={status}
            setStatus={setStatus}
            onSave={handleSaveProject}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingProject(null);
              setTitle("");
              setClient("");
              setStatus("Active");
            }}
            buttonLabel={editingProject ? "Update Project" : "Add Project"}
          />
        </Modal>

        <div className="projects-grid">

    {isLoading ? (

        <div className="projects-message">
            <p>Loading projects...</p>
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
          setConfirmation({ isOpen: false, type: null, projectId: null })
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
