import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import SearchBar from "../components/projects/SearchBar";
import AddProjectButton from "../components/projects/AddProjectButton";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import "./Projects.css";
import DashboardLayout from "../components/layout/DashboardLayout";
import ConfirmationModal from "../components/common/ConfirmationModal";

function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
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

  const API_URL = "http://127.0.0.1:8000/api/projects/";

  const fetchProjects = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  async function addProject() {
    if (title.trim() === "" || client.trim() === "") {
      alert("Please fill all fields.");
      return;
    }

    const newProject = { title, client, status };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      const createdProject = await response.json();
      if (!response.ok) throw new Error(createdProject.error || "Failed to add project");

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
      const response = await fetch(`${API_URL}${editingProject.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, client, status }),
      });

      if (!response.ok) throw new Error("Failed to update project.");

      const updatedProject = await response.json();
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
      const response = await fetch(`${API_URL}${projectId}/`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete project.");

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId)
      );

      setConfirmation({ isOpen: false, type: null, projectId: null });
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Unable to delete project.");
    }
  }

  function openDeleteConfirmation(projectId) {
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

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              deleteProject={openDeleteConfirmation}
              onEdit={openEditModal}
            />
          ))}
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
