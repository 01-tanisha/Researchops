import { useState } from "react";
import SearchBar from "../components/projects/SearchBar";
import AddProjectButton from "../components/projects/AddProjectButton";
import ProjectCard from "../components/projects/ProjectCard";
import "./Projects.css";

function Projects() {

  const [searchTerm, setSearchTerm] = useState("");

  const projects = [
    {
      id: 1,
      title: "Healthcare Survey",
      client: "ABC Pharma",
      status: "Active",
    },
    {
      id: 2,
      title: "Retail Feedback",
      client: "XYZ Retail",
      status: "Completed",
    },
    {
      id: 3,
      title: "Market Research",
      client: "Tech Corp",
      status: "Pending",
    },
  ];

  return (
    <div className="dashboard-content">

      <div className="projects-header">

    <h1>Projects</h1>

    <AddProjectButton/>

</div>

<SearchBar/>

      <div className="projects-grid">

        {projects
          .filter((p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.client.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}

      </div>

    </div>
  );
}

export default Projects;