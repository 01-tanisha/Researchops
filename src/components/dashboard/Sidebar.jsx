import "./Sibebar.css";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <h2 className="logo">
        ResearchOps
      </h2>

      <nav>

        <Link to="/dashboard">Dashboard</Link>

        <Link to="/projects">Projects</Link>

        <Link to="/vendors">Vendors</Link>

        <Link to="/surveys">Surveys</Link>

        <Link to="/reports">Reports</Link>

        <Link to="/settings">Settings</Link>

      </nav>

    </aside>
  );
}

export default Sidebar;