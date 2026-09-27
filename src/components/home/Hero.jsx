import "./Hero.css";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="hero-kicker"><span /> RESEARCH OPERATIONS, IN FOCUS</p>
        <h1>Make every study move with <em>purpose.</em></h1>
        <p className="hero-description">
          Keep project briefs, survey fieldwork, vendor allocations, and delivery
          in one clear line of sight.
        </p>
        <div className="hero-buttons">
          <Link className="primary-btn" to="/register">Create your account <span aria-hidden="true">→</span></Link>
          <a className="secondary-btn" href="#features">Explore the platform</a>
        </div>
        <p className="hero-note">For project managers coordinating research from kickoff to close.</p>
      </div>

      <div className="hero-visual" role="img" aria-label="Sample ResearchOps workspace showing project and survey activity">
        <div className="preview-window">
          <div className="preview-topbar">
            <div className="preview-brand"><span /> ResearchOps</div>
            <span className="preview-status"><i /> Example workspace</span>
          </div>
          <div className="preview-content">
            <div className="preview-heading">
              <div><small>WORKSPACE PREVIEW</small><h2>Fieldwork overview</h2></div>
              <span className="preview-period">This week⌄</span>
            </div>
            <div className="preview-metrics">
              <div><span>Active projects</span><strong>08</strong><small>Across 4 clients</small></div>
              <div><span>In field</span><strong>14</strong><small>Surveys collecting</small></div>
              <div><span>Completes</span><strong>1,284</strong><small>Delivered to date</small></div>
            </div>
            <div className="preview-work-title"><strong>Project activity</strong><span>View all →</span></div>
            <div className="preview-row"><span className="preview-dot dot-green" /><div><b>Retail pulse study</b><small>Northstar Insights · 3 vendors</small></div><span className="preview-tag tag-green">In field</span></div>
            <div className="preview-row"><span className="preview-dot dot-coral" /><div><b>Customer experience tracker</b><small>Meridian Group · 2 vendors</small></div><span className="preview-tag tag-coral">Review</span></div>
            <div className="preview-chart" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            <div className="preview-chart-labels"><span>MON</span><span>WED</span><span>FRI</span><span>SUN</span></div>
          </div>
        </div>
        <div className="preview-stamp"><span>01</span> ONE OPERATIONS VIEW</div>
      </div>
    </section>
  );
}

export default Hero;