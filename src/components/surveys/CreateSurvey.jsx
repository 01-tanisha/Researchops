import { useState } from "react";
import { createSurvey } from "../../services/api/surveyApi";

function CreateSurvey({ onClose, onSurveyCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Survey title is required.");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const newSurvey = await createSurvey({
                title: title.trim(),
                description: description.trim(),
                status: "Draft",
            });

            onSurveyCreated(newSurvey);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to create survey.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-survey-overlay">
            <div className="create-survey-modal">
                <div className="create-survey-header">
                    <h2>Create Survey</h2>

                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Survey Title</label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter survey title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            placeholder="Enter survey description"
                            rows="4"
                        />
                    </div>

                    {error && (
                        <p className="form-error">
                            {error}
                        </p>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Creating..."
                                : "Create Survey"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateSurvey;