import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { activateProjectManagerAccount } from "../services/api/projectApi";
import "./ProjectManagerRegister.css";

function ProjectManagerRegister() {
    const [form, setForm] = useState({
        full_name: "",
        work_email: "",
        company: "",
        job_title: "",
        work_phone: "",
        username: "",
        verification_details: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    function updateField(event) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to create your account.");
            }

            setSubmitted(true);
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <main className="account-page register-page">
                <section className="account-aside">
                    <Link className="account-brand" to="/">ResearchOps</Link>
                    <p className="account-kicker">REQUEST RECEIVED</p>
                    <h1>Your details are with the admin team.</h1>
                    <p className="account-aside-copy">
                        They will verify your role and company before approving account setup.
                    </p>
                </section>
                <section className="account-form-area">
                    <div className="account-form account-submission-state">
                        <span className="account-state-marker">01</span>
                        <h2>Verification in progress</h2>
                        <p>
                            After approval, we’ll send a secure setup link to your work email.
                            You can create your password from that link.
                        </p>
                        <Link className="account-submit account-state-link" to="/">Return to home</Link>
                    </div>
                </section>
            </main>
        );
    }

    const activationToken = new URLSearchParams(window.location.search).get("token");
    if (window.location.pathname.endsWith("/complete") && activationToken) {
        return <ProjectManagerAccountSetup token={activationToken} />;
    }

    return (
        <main className="account-page register-page">
            <section className="account-aside">
                <Link className="account-brand" to="/">ResearchOps</Link>
                <p className="account-kicker">PROJECT MANAGER VERIFICATION</p>
                <h1>First, let’s confirm your work details.</h1>
                <p className="account-aside-copy">
                    An administrator reviews every request to verify the applicant’s company and role.
                    Account setup opens only after approval.
                </p>
                <div className="account-aside-rule" />
                <p className="account-aside-note">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </section>

            <section className="account-form-area">
                <form className="account-form" onSubmit={handleSubmit}>
                    <div className="account-form-heading">
                        <span>STEP 1 OF 2</span>
                        <h2>Request access</h2>
                        <p>Provide work details an administrator can verify.</p>
                    </div>

                    <label>
                        Full name
                        <input name="full_name" autoComplete="name" value={form.full_name} onChange={updateField} required />
                    </label>

                    <label>
                        Company work email
                        <input
                            name="work_email"
                            type="email"
                            autoComplete="email"
                            value={form.work_email}
                            onChange={updateField}
                            required
                        />
                    </label>

                    <div className="account-name-fields">
                        <label>
                            Company
                            <input name="company" autoComplete="organization" value={form.company} onChange={updateField} required />
                        </label>
                        <label>
                            Job title
                            <input name="job_title" autoComplete="organization-title" value={form.job_title} onChange={updateField} required />
                        </label>
                    </div>

                    <label>
                        Work phone <span className="account-optional">Optional</span>
                        <input name="work_phone" type="tel" autoComplete="tel" value={form.work_phone} onChange={updateField} />
                    </label>

                    <label>
                        Requested username
                        <input
                            name="username"
                            autoComplete="username"
                            value={form.username}
                            onChange={updateField}
                            required
                        />
                    </label>

                    <label>
                        How can we verify your role?
                        <textarea
                            name="verification_details"
                            rows="3"
                            placeholder="For example, your team, department, company profile, or a manager who can confirm your employment."
                            value={form.verification_details}
                            onChange={updateField}
                            required
                        />
                    </label>

                    {error && <p className="account-error" role="alert">{error}</p>}

                    <button className="account-submit" type="submit" disabled={loading}>
                        {loading ? "Sending request..." : "Send for verification"}
                    </button>

                    <p className="account-mobile-login">
                        Already registered? <Link to="/login">Sign in</Link>
                    </p>
                </form>
            </section>
        </main>
    );
}

function ProjectManagerAccountSetup({ token }) {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await activateProjectManagerAccount({
                token,
                password,
                confirm_password: confirmPassword,
            });
            navigate("/login", { replace: true, state: { message: data.message } });
        } catch (activationError) {
            setError(activationError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="account-page register-page">
            <section className="account-aside">
                <Link className="account-brand" to="/">ResearchOps</Link>
                <p className="account-kicker">APPROVED PROJECT MANAGER</p>
                <h1>Your account is ready for setup.</h1>
                <p className="account-aside-copy">Choose a password to finish activating your approved account.</p>
            </section>
            <section className="account-form-area">
                <form className="account-form" onSubmit={handleSubmit}>
                    <div className="account-form-heading">
                        <span>STEP 2 OF 2</span>
                        <h2>Set your password</h2>
                        <p>This secure setup link can only be used once.</p>
                    </div>
                    <label>
                        Password
                        <input type="password" autoComplete="new-password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required />
                    </label>
                    <label>
                        Confirm password
                        <input type="password" autoComplete="new-password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                    </label>
                    {error && <p className="account-error" role="alert">{error}</p>}
                    <button className="account-submit" type="submit" disabled={loading}>
                        {loading ? "Activating account..." : "Activate account"}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default ProjectManagerRegister;