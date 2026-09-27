import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link className="navbar-logo" to="/#top">
        <span className="brand-mark" aria-hidden="true">R</span>
        ResearchOps
      </Link>

      <div className="nav-center">
        <ul className="nav-links">
          <li><a href="#top">Overview</a></li>
          <li><a href="#features">Platform</a></li>
          <li><a href="#workflow">Workflow</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <div className="nav-buttons">
        <Link className="login-btn" to="/login">Sign in</Link>
        <Link className="start-btn" to="/register">Create account</Link>
      </div>
    </nav>
  );
}

export default Navbar;