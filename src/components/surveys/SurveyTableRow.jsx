import { useState } from "react";
import { deleteSurvey, updateSurvey } from "../../services/api/surveyApi";

function SurveyTableRow({
    survey,
    analytics,
    onView,
    onViewResponses,
    onSurveyUpdated,
    onSurveyDeleted,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(survey.title || "");
    const [client, setClient] = useState(survey.client_name || survey.client || "");
    const [status, setStatus] = useState(survey.status || "Draft");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function saveSurvey(event) {
        event.preventDefault();
        if (!title.trim() || !client.trim()) {
            setError("Survey name and client are required.");
            return;
        }

        setSaving(true);
        setError("");
        try {
            const updatedSurvey = await updateSurvey(survey.id, {
                title: title.trim(),
                client: client.trim(),
                status,
            });
            onSurveyUpdated(updatedSurvey);
            setIsEditing(false);
        } catch (saveError) {
            setError(saveError.message || "Unable to update survey.");
        } finally {
            setSaving(false);
        }
    }

    async function removeSurvey() {
        if (!window.confirm(`Delete survey "${survey.title}"? This cannot be undone.`)) return;

        setDeleting(true);
        setError("");
        try {
            await deleteSurvey(survey.id);
            onSurveyDeleted(survey.id);
        } catch (deleteError) {
            setError(deleteError.message || "Unable to delete survey.");
        } finally {
            setDeleting(false);
        }
    }

    function cancelEdit() {
        setTitle(survey.title || "");
        setClient(survey.client_name || survey.client || "");
        setStatus(survey.status || "Draft");
        setError("");
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <tr className="survey-table-edit-row">
                <td>
                    <input aria-label="Survey name" value={title} onChange={(event) => setTitle(event.target.value)} />
                    {error && <small className="survey-row-error">{error}</small>}
                </td>
                <td><input aria-label="Client name" value={client} onChange={(event) => setClient(event.target.value)} /></td>
                <td>{survey.project_title || "—"}</td>
                <td>{survey.project_manager_name || "Unassigned"}</td>
                <td>{survey.loi != null ? `${survey.loi} min` : "—"}</td>
                <td>{analytics?.loi != null ? `${analytics.loi} min` : "—"}</td>
                <td>{survey.incidence_rate != null ? `${survey.incidence_rate}%` : "—"}</td>
                <td>{analytics?.incidence_rate != null ? `${analytics.incidence_rate}%` : "—"}</td>
                <td>{analytics?.delivered_completes ?? "—"} / {survey.required_completes ?? 0}</td>
                <td>
                    <select aria-label="Survey status" value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Completed">Completed</option>
                        <option value="Billed">Billed</option>
                        <option value="Draft">Draft</option>
                        <option value="Quota Full">Quota Full</option>
                    </select>
                </td>
                <td className="survey-row-actions">
                    <button type="button" disabled={saving} onClick={saveSurvey}>{saving ? "Saving..." : "Save"}</button>
                    <button type="button" onClick={cancelEdit}>Cancel</button>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td className="survey-table-title">{survey.title}</td>
            <td>{survey.client_name || survey.client || "—"}</td>
            <td>{survey.project_title || "—"}</td>
            <td>{survey.project_manager_name || "Unassigned"}</td>
            <td>{survey.loi != null ? `${survey.loi} min` : "—"}</td>
            <td>{analytics?.loi != null ? `${analytics.loi} min` : "—"}</td>
            <td>{survey.incidence_rate != null ? `${survey.incidence_rate}%` : "—"}</td>
            <td>{analytics?.incidence_rate != null ? `${analytics.incidence_rate}%` : "—"}</td>
            <td>{analytics?.delivered_completes ?? 0} / {survey.required_completes ?? 0}</td>
            <td><span className={`survey-table-status ${String(survey.status || "").toLowerCase().replaceAll(" ", "-")}`}>{survey.status || "—"}</span></td>
            <td className="survey-row-actions">
                <button type="button" onClick={onView}>Details</button>
                <button type="button" onClick={() => setIsEditing(true)}>Edit</button>
                <button type="button" onClick={onViewResponses}>Responses</button>
                <button type="button" className="survey-row-delete" disabled={deleting} onClick={removeSurvey}>{deleting ? "Deleting..." : "Delete"}</button>
            </td>
        </tr>
    );
}

export default SurveyTableRow;
