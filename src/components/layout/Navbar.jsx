import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        ResearchOps AI
      </div>

      <div className="nav-center">
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <div className="nav-buttons">
        <button className="login-btn">Login</button>
        <button className="start-btn">Get Started</button>
      </div>

    </nav>
  );
}

export default Navbar;