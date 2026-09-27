import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
    deleteUser,
    getUsers,
    getManagerApplications,
    reviewManagerApplication,
} from "../services/api/projectApi";
import "./ProjectManagers.css";

function ProjectManagers() {
    const [managers, setManagers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [reviewingId, setReviewingId] = useState(null);
    const [notice, setNotice] = useState("");
    const [setupLink, setSetupLink] = useState("");

    useEffect(() => {
        let active = true;

        Promise.all([getUsers(), getManagerApplications()])
            .then(([users, requestList]) => {
                if (active) {
                    setManagers(Array.isArray(users) ? users : []);
                    setApplications(Array.isArray(requestList) ? requestList : []);
                }
            })
            .catch((loadError) => {
                if (active) {
                    setError(loadError.message || "Unable to load project managers.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    async function handleReview(application, action) {
        const actionLabel = action === "approve" ? "approve account setup for" : "reject";
        if (!window.confirm(`Are you sure you want to ${actionLabel} ${application.full_name}?`)) return;

        setReviewingId(application.id);
        setError("");
        setNotice("");
        setSetupLink("");
        try {
            const result = await reviewManagerApplication(application.id, action);
            setApplications((current) => current.map((item) =>
                item.id === application.id
                    ? { ...item, status: result.status }
                    : item
            ));
            setNotice(result.message);
            if (result.setup_url) {
                setSetupLink(new URL(result.setup_url, window.location.origin).toString());
            }
            if (action === "approve") {
                const users = await getUsers();
                setManagers(Array.isArray(users) ? users : []);
            }
        } catch (reviewError) {
            setError(reviewError.message || "Unable to review this request.");
        } finally {
            setReviewingId(null);
        }
    }

    async function handleDelete(manager) {
        const displayName = `${manager.first_name} ${manager.last_name}`.trim() || manager.username;
        if (!window.confirm(`Delete the project manager account for ${displayName}?`)) return;

        setDeletingId(manager.id);
        setError("");
        try {
            await deleteUser(manager.id);
            setManagers((current) => current.filter((item) => item.id !== manager.id));
        } catch (deleteError) {
            setError(deleteError.message || "Unable to delete this account.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <DashboardLayout>
            <main className="manager-page">
                <header className="manager-page-header">
                    <div>
                        <p className="manager-eyebrow">ADMINISTRATION</p>
                        <h1>Project managers</h1>
                        <p>Verify employer details before enabling account setup.</p>
                    </div>
                    <div className="manager-count">
                        <strong>{managers.length}</strong>
                        <span>Accounts</span>
                    </div>
                </header>

                {error && <p className="manager-error" role="alert">{error}</p>}
                {notice && <p className="manager-notice" role="status">{notice}</p>}
                {setupLink && (
                    <div className="manager-invite">
                        <div>
                            <strong>Account setup link</strong>
                            <span>{setupLink}</span>
                            <small>Valid for 48 hours and usable once. It was also emailed to the applicant when email delivery is configured.</small>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(setupLink)}
                        >
                            Copy link
                        </button>
                    </div>
                )}

                <section className="manager-section">
                    <header className="manager-section-header">
                        <div>
                            <h2>Verification requests</h2>
                            <p>Check the company and work details before approving account setup.</p>
                        </div>
                        <span>{applications.filter((item) => item.status === "Pending").length} pending</span>
                    </header>
                    <div className="manager-table-wrap">
                        {loading ? (
                            <p className="manager-state">Loading verification requests...</p>
                        ) : applications.length === 0 ? (
                            <p className="manager-state">No verification requests yet.</p>
                        ) : (
                            <table className="manager-table verification-table">
                                <thead>
                                    <tr>
                                        <th>Applicant</th>
                                        <th>Company / role</th>
                                        <th>Work contact</th>
                                        <th>Verification information</th>
                                        <th>Request</th>
                                        <th>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((application) => (
                                        <tr key={application.id}>
                                            <td>
                                                <strong className="manager-name">{application.full_name}</strong>
                                                <small>@{application.username}</small>
                                            </td>
                                            <td>
                                                <strong>{application.company}</strong>
                                                <small>{application.job_title}</small>
                                            </td>
                                            <td>
                                                <a href={`mailto:${application.work_email}`}>{application.work_email}</a>
                                                <small>{application.work_phone || "No phone provided"}</small>
                                            </td>
                                            <td className="verification-details">{application.verification_details}</td>
                                            <td>
                                                {new Date(application.created_at).toLocaleDateString()}
                                                <small className={`manager-status ${application.status.toLowerCase()}`}>{application.status}</small>
                                            </td>
                                            <td>
                                                {application.status === "Pending" ? (
                                                    <div className="manager-review-actions">
                                                        <button
                                                            type="button"
                                                            className="manager-approve"
                                                            disabled={reviewingId === application.id}
                                                            onClick={() => handleReview(application, "approve")}
                                                        >
                                                            {reviewingId === application.id ? "Working..." : "Approve"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="manager-reject"
                                                            disabled={reviewingId === application.id}
                                                            onClick={() => handleReview(application, "reject")}
                                                        >Reject</button>
                                                    </div>
                                                ) : application.status === "Approved" && !application.account_active ? (
                                                    <span className="manager-pending-setup">Awaiting setup</span>
                                                ) : application.status === "Approved" ? (
                                                    <span className="manager-active-setup">Account active</span>
                                                ) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                <section className="manager-section">
                    <header className="manager-section-header">
                        <div>
                            <h2>Project manager accounts</h2>
                            <p>Approved account requests and their activation status.</p>
                        </div>
                    </header>
                    <div className="manager-table-wrap" aria-label="Project manager accounts">
                    {loading ? (
                        <p className="manager-state">Loading project managers...</p>
                    ) : managers.length === 0 && !error ? (
                        <p className="manager-state">No project manager accounts have registered yet.</p>
                    ) : managers.length > 0 ? (
                        <table className="manager-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {managers.map((manager) => (
                                    <tr key={manager.id}>
                                        <td className="manager-name">
                                            {[manager.first_name, manager.last_name].filter(Boolean).join(" ") || "—"}
                                        </td>
                                        <td>{manager.username}</td>
                                        <td>{manager.email || "—"}</td>
                                        <td>{manager.date_joined ? new Date(manager.date_joined).toLocaleDateString() : "—"}</td>
                                        <td>
                                            <span className={`manager-status ${manager.is_active ? "is-active" : "is-inactive"}`}>
                                                {manager.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="manager-delete"
                                                disabled={deletingId === manager.id}
                                                onClick={() => handleDelete(manager)}
                                            >
                                                {deletingId === manager.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}
                    </div>
                </section>
            </main>
        </DashboardLayout>
    );
}

export default ProjectManagers;