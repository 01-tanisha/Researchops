import { useState } from "react";
import Modal from "../components/common/Modal";
import SearchBar from "../components/projects/SearchBar";
import AddProjectButton from "../components/projects/AddProjectButton";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import "./Projects.css";
import DashboardLayout from "../components/layout/DashboardLayout";

function Projects() {

  const [searchTerm, setSearchTerm] = useState("");

  const [projects, setProjects] = useState([

{
id:1,
title:"Healthcare Survey",
client:"ABC Pharma",
status:"Active"
},

{
id:2,
title:"Retail Feedback",
client:"XYZ Retail",
status:"Completed"
},

{
id:3,
title:"Market Research",
client:"Tech Corp",
status:"Pending"
}

]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState("Active");

  // 4️⃣ Functions (ADD BELOW THE STATES)
  function addProject(){

    if(title.trim()==="" || client.trim()===""){

        alert("Please fill all fields.");

        return;

    }

    const confirmAdd = window.confirm(
        "Are you sure you want to add this project?"
    );

    if(!confirmAdd){

        return;

    }

    const newProject={

        id:projects.length+1,

        title,

        client,

        status

    };

    setProjects([...projects,newProject]);

    setTitle("");

    setClient("");

    setStatus("Active");

    setIsModalOpen(false);

}

function deleteProject(id){

    const updatedProjects = projects.filter(

        (project)=>project.id!==id

    );

    setProjects(updatedProjects);

}

  // 5️⃣ Filter projects
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
                onSave={addProject}
                onCancel={() => setIsModalOpen(false)}
              />
            </Modal>
            <div className="projects-grid">

                {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} deleteProject={deleteProject} />
                ))}

            </div>

        </div>
        </DashboardLayout>
      );
}

export default Projects;