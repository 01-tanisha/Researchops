import { useState } from "react";
import { createSurvey } from "../../services/api/surveyApi";
import "./SurveyForm.css";


function SurveyForm({ onClose, onSurveyCreated }) {
    const [title, setTitle] = useState("");
    const [client, setClient] = useState("");
    const [status, setStatus] = useState("Draft");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim() || !client.trim()) {
            setError("Survey title and client are required.");
            return;
        }

        try {
            setIsSaving(true);
            setError("");

            const survey = await createSurvey({
                title: title.trim(),
                client: client.trim(),
                status,
            });

            onSurveyCreated(survey);
        } catch (submitError) {
            setError(
                submitError.message ||
                    "Failed to create survey."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (

        <form className="survey-form" onSubmit={handleSubmit}>

            <h2>
            Add Survey
            </h2>


            <div className="form-group">

                <label>
                    Survey Title
                </label>

                <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                        setTitle(event.target.value)
                    }
                    placeholder="Enter survey title"
                />

            </div>


            <div className="form-group">

                <label>
                    Client
                </label>

                <input
                    type="text"
                    value={client}
                    onChange={(event) =>
                        setClient(event.target.value)
                    }
                    placeholder="Enter client name"
                />

            </div>


            <div className="form-group">

                <label>
                    Status
                </label>

                <select
                    value={status}
                    onChange={(event) =>
                        setStatus(event.target.value)
                    }
                >

                    <option value="Draft">
                        Draft
                    </option>

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


                </select>

            </div>

            {error && (
                <p className="survey-error">
                    {error}
                </p>
            )}


            <div className="survey-form-actions">

                <button
                    type="button"
                    className="survey-cancel-btn"
                    onClick={onClose}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="survey-save-btn"
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Create Survey"}
                </button>

            </div>

        </form>

    );
}


export default SurveyForm;