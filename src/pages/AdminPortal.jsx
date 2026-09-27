import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/auth/LogoutButton";
import {
    getClients,
    getManagerApplications,
    getProjects,
    getUsers,
    getVendors,
} from "../services/api/projectApi";
import { getSurveys } from "../services/api/surveyApi";
import "./AdminPortal.css";

const workAreas = [
    { label: "Projects", path: "/projects", key: "projects" },
    { label: "Surveys", path: "/surveys", key: "surveys" },
    { label: "Clients", path: "/clients", key: "clients" },
    { label: "Vendors", path: "/vendors", key: "vendors" },
    { label: "Reports", path: "/reports", key: "reports" },
];

function AdminPortal() {
    const [overview, setOverview] = useState({
        projects: [],
        surveys: [],
        clients: [],
        vendors: [],
        managers: [],
        applications: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([
            getProjects(),
            getSurveys(),
            getClients(),
            getVendors(),
            getUsers(),
            getManagerApplications(),
        ])
            .then(([projects, surveys, clients, vendors, managers, applications]) => {
                if (!active) return;
                setOverview({ projects, surveys, clients, vendors, managers, applications });
            })
            .catch((loadError) => {
                if (active) setError(loadError.message || "Unable to load admin overview.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const pendingApplications = overview.applications.filter(
        (application) => application.status === "Pending"
    );
    const activeProjects = overview.projects.filter(
        (project) => project.status === "Active"
    ).length;
    const activeSurveys = overview.surveys.filter(
        (survey) => survey.status === "Active"
    ).length;

    return (
        <div className="admin-portal">
            <aside className="admin-rail">
                <Link className="admin-brand" to="/admin">
                    <span>R</span>ResearchOps
                    <small>ADMIN PORTAL</small>
                </Link>
                <p className="admin-nav-label">OVERVIEW</p>
                <Link className="admin-nav-link selected" to="/admin">Admin home</Link>
                <Link className="admin-nav-link admin-verification-link" to="/admin/project-managers">
                    Manager verification
                    <strong>{loading ? "…" : pendingApplications.length}</strong>
                </Link>
                <p className="admin-nav-label">WORKSPACE</p>
                {workAreas.map((area) => (
                    <Link className="admin-nav-link" to={area.path} key={area.key}>
                        {area.label}
                        <span>{loading ? "…" : overview[area.key]?.length ?? ""}</span>
                    </Link>
                ))}
                <div className="admin-rail-footer">
                    <span>Signed in with administrator privileges</span>
                    <LogoutButton />
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <span>RESEARCHOPS / ADMIN</span>
                        <strong>System overview</strong>
                    </div>
                    <Link to="/admin/project-managers" className="admin-top-action">
                        Review requests <span>{loading ? "…" : pendingApplications.length}</span>
                    </Link>
                </header>

                <div className="admin-content">
                    <section className="admin-welcome">
                        <div>
                            <p>ADMINISTRATOR WORKSPACE</p>
                            <h1>All operations, one view.</h1>
                            <span>Review account requests and monitor work across the ResearchOps portal.</span>
                        </div>
                        <div className="admin-today">{new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
                    </section>

                    {error && <p className="admin-error" role="alert">{error}</p>}

                    <section className="admin-stat-grid" aria-label="Workspace totals">
                        {[
                            ["Project managers", overview.managers.length, "registered accounts"],
                            ["Verification requests", pendingApplications.length, "awaiting review"],
                            ["Projects", overview.projects.length, `${activeProjects} active`],
                            ["Surveys", overview.surveys.length, `${activeSurveys} active`],
                            ["Clients", overview.clients.length, "in workspace"],
                            ["Vendors", overview.vendors.length, "in workspace"],
                        ].map(([label, value, detail]) => (
                            <article className="admin-stat" key={label}>
                                <span>{label}</span>
                                <strong>{loading ? "—" : value}</strong>
                                <small>{loading ? "Loading" : detail}</small>
                            </article>
                        ))}
                    </section>

                    <section className="admin-panels">
                        <article className="admin-panel admin-project-panel">
                            <header>
                                <div><p>WORK IN PROGRESS</p><h2>Recent projects</h2></div>
                                <Link to="/projects">All projects →</Link>
                            </header>
                            {loading ? <p className="admin-empty">Loading projects...</p> : overview.projects.length === 0 ? <p className="admin-empty">No projects have been created yet.</p> : (
                                <div className="admin-project-list">
                                    {overview.projects.slice(0, 6).map((project) => (
                                        <div className="admin-project-row" key={project.id}>
                                            <div><strong>{project.title}</strong><span>{project.client_name || project.client || "No client"}</span></div>
                                            <span className={`admin-state-pill ${String(project.status).toLowerCase()}`}>{project.status}</span>
                                            <small>{overview.surveys.filter((survey) => String(survey.project_id) === String(project.id)).length} surveys</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>

                        <article className="admin-panel admin-verification-panel">
                            <header>
                                <div><p>ACCOUNT APPROVAL</p><h2>Manager verification</h2></div>
                                <Link to="/admin/project-managers">Open queue →</Link>
                            </header>
                            {loading ? <p className="admin-empty">Loading requests...</p> : pendingApplications.length === 0 ? (
                                <div className="admin-clear-state"><strong>Queue is clear</strong><span>No manager requests are waiting for review.</span></div>
                            ) : (
                                <div className="admin-request-list">
                                    {pendingApplications.slice(0, 5).map((application) => (
                                        <div className="admin-request-row" key={application.id}>
                                            <span className="admin-request-initial">{application.full_name.charAt(0).toUpperCase()}</span>
                                            <div><strong>{application.full_name}</strong><span>{application.job_title} · {application.company}</span></div>
                                            <Link to="/admin/project-managers" aria-label={`Review ${application.full_name}`}>Review</Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    </section>

                    <section className="admin-module-strip">
                        <header><div><p>ALL WORK AREAS</p><h2>Open a workspace</h2></div></header>
                        <div>
                            {workAreas.map((area) => (
                                <Link to={area.path} key={area.key}>
                                    <span>{area.label}</span>
                                    <strong>{loading ? "—" : overview[area.key]?.length ?? "—"}</strong>
                                    <small>Open area ↗</small>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default AdminPortal;