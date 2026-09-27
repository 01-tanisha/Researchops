import "./CTA.css";
import { Link } from "react-router-dom";

function CTA() {

    return(

        <section className="cta" id="contact">
            <p className="cta-kicker">YOUR NEXT STUDY STARTS HERE</p>
            <h2>Give the work a clearer way forward.</h2>
            <p>Create a project manager account and bring your research workflow together.</p>
            <div className="cta-actions">
                <Link to="/register">Create account <span aria-hidden="true">→</span></Link>
                <Link className="cta-login" to="/login">Already registered? Sign in</Link>
            </div>
        </section>

    );

}

export default CTA;