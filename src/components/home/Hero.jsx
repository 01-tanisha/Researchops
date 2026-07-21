import "./Hero.css";
import heroImage from "../../assets/hero.png";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-left">

        <h1>
          Manage Market Research Projects
          Efficiently
        </h1>

        <p>
          ResearchOps AI helps project managers
          manage vendors, surveys, quotas,
          reports and project tracking from one place.
        </p>

        <div className="hero-buttons">

          <button className="primary-btn">
            Get Started
          </button>

          <button className="secondary-btn">
            Watch Demo
          </button>

        </div>

      </div>

      <div className="hero-right">

        <img
          src={heroImage}
          alt="Hero"
        />

      </div>

    </section>
  );
}

export default Hero;