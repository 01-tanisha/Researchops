import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        ResearchOps AI
      </div>

      <div className="nav-center">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/features">Features</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>

      <div className="nav-buttons">
        <Link to="/login">

        <button className="login-btn">Login</button></Link>
        <button className="start-btn">Get Started</button>
      </div>

    </nav>
  );
}

export default Navbar;