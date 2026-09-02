import { useState } from "react";
import {
    deleteSurvey,
    updateSurvey,
} from "../../services/api/surveyApi";

import "./SurveyCard.css";
import SurveyResponses from "./SurveyResponse";

function SurveyCard({
    survey,
    onSurveyUpdated,
    onSurveyDeleted,
    onView,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [showResponses, setShowResponses] = useState(false);

    const [title, setTitle] = useState(survey.title || "");
    const [client, setClient] = useState(survey.client || "");
    const [status, setStatus] = useState(
        survey.status || "Active"
    );

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");

    // -------------------------
    // UPDATE SURVEY
    // -------------------------
    const handleUpdate = async (event) => {
        event.preventDefault();

        if (!title.trim() || !client.trim()) {
            setError(
                "Survey name and client name are required."
            );
            return;
        }

        try {
            setIsSaving(true);
            setError("");

            const updatedSurvey = await updateSurvey(
                survey.id,
                {
                    title: title.trim(),
                    client: client.trim(),
                    status,
                }
            );

            onSurveyUpdated(updatedSurvey);
            setIsEditing(false);

        } catch (error) {
            console.error(
                "Error updating survey:",
                error
            );

            setError(
                error.message ||
                    "Failed to update survey."
            );
        } finally {
            setIsSaving(false);
        }
    };

    // -------------------------
    // DELETE SURVEY
    // -------------------------
    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${survey.title}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setIsDeleting(true);
            setError("");

            await deleteSurvey(survey.id);

            onSurveyDeleted(survey.id);

        } catch (error) {
            console.error(
                "Error deleting survey:",
                error
            );

            setError(
                error.message ||
                    "Failed to delete survey."
            );
        } finally {
            setIsDeleting(false);
        }
    };

    // -------------------------
    // CANCEL EDIT
    // -------------------------
    const handleCancelEdit = () => {
        setTitle(survey.title || "");
        setClient(survey.client || "");
        setStatus(survey.status || "Active");

        setError("");
        setIsEditing(false);
    };

    // -------------------------
    // OPEN RESPONSES
    // -------------------------
    const handleViewResponses = () => {
        setError("");
        setShowResponses(true);
    };

    // -------------------------
    // CLOSE RESPONSES
    // -------------------------
    const handleCloseResponses = () => {
        setShowResponses(false);
    };

    return (
        <>
            <div className="survey-card">

                {/* =========================
                    EDIT MODE
                ========================= */}
                {isEditing ? (
                    <form onSubmit={handleUpdate}>
                        <div className="survey-card-edit-form">

                            <div className="form-group">
                                <label>
                                    Survey Name
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Client Name
                                </label>

                                <input
                                    type="text"
                                    value={client}
                                    onChange={(event) =>
                                        setClient(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Paused">
                                        Paused
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Billed">
                                        Billed
                                    </option>

                                    <option value="Draft">
                                        Draft
                                    </option>
                                </select>
                            </div>

                            {error && (
                                <p className="survey-error">
                                    {error}
                                </p>
                            )}

                            <div className="survey-card-actions">

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : "Save"}
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>
                    </form>

                ) : (

                    /* =========================
                       VIEW MODE
                    ========================= */
                    <>

                        <div className="survey-card-header">

                            <h3>
                                {survey.title}
                            </h3>

                            <span className="survey-status">
                                {survey.status}
                            </span>

                        </div>

                        <div className="survey-card-content">

                            <p>
                                <strong>
                                    Client:
                                </strong>{" "}
                                {survey.client}
                            </p>

                            <p>
                                <strong>
                                    Survey ID:
                                </strong>{" "}
                                {survey.id}
                            </p>

                        </div>

                        {error && (
                            <p className="survey-error">
                                {error}
                            </p>
                        )}

                        {/* =========================
                            ACTION BUTTONS
                        ========================= */}
                        <div className="survey-card-actions">

                            <button
                                type="button"
                                onClick={onView}
                            >
                                View
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsEditing(true)
                                }
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleViewResponses
                                }
                            >
                                View Responses
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>

                        </div>

                    </>
                )}

            </div>

            {/* =========================
                RESPONSES MODAL
            ========================= */}
            {showResponses && (
                <SurveyResponses
                    survey={survey}
                    onClose={
                        handleCloseResponses
                    }
                />
            )}
        </>
    );
}

export default SurveyCard;