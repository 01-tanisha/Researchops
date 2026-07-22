import { Link } from "react-router-dom";
import "./Sibebar.css";

function Sidebar() {
	return (
		<aside className="sidebar">
			<h2 className="logo">ResearchOps</h2>

			<div className="menu-title">MAIN</div>

			<nav>
				<Link to="/dashboard">Dashboard</Link>
				<Link to="/projects">Projects</Link>
			</nav>

			<div className="menu-title">MANAGEMENT</div>

			<nav>
				<Link to="/vendors">Vendors</Link>
				<Link to="/surveys">Surveys</Link>
			</nav>

			<div className="menu-title">ANALYTICS</div>

			<nav>
				<Link to="/reports">Reports</Link>
			</nav>

			<div className="menu-title">ACCOUNT</div>

			<nav>
				<Link to="/settings">Settings</Link>
			</nav>
		</aside>
	);
}

export default Sidebar;