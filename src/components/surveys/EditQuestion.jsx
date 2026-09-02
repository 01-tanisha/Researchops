import { useState } from "react";
import { updateSurveyQuestion } from "../../services/api/surveyApi";
import "./AddQuestion.css";

function EditQuestion({
    question,
    onClose,
    onQuestionUpdated,
}) {
    const [questionText, setQuestionText] = useState(
        question.question_text || ""
    );

    const [questionType, setQuestionType] = useState(
        question.question_type || "text"
    );

    const [required, setRequired] = useState(
        question.required ?? true
    );

    const [options, setOptions] = useState(
        Array.isArray(question.options) && question.options.length
            ? question.options
            : [""]
    );

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const needsOptions =
        questionType === "single_choice" ||
        questionType === "multiple_choice";

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const removeOption = (index) => {
        if (options.length === 1) {
            return;
        }

        setOptions(
            options.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!questionText.trim()) {
            setError("Question text is required.");
            return;
        }

        let finalOptions = [];

        if (needsOptions) {
            finalOptions = options
                .map((option) => option.trim())
                .filter(Boolean);

            if (finalOptions.length < 2) {
                setError("Please add at least two options.");
                return;
            }
        }

        try {
            setIsSaving(true);
            setError("");

            const updatedQuestion =
                await updateSurveyQuestion(
                    question.id,
                    {
                        question_text: questionText.trim(),
                        question_type: questionType,
                        required,
                        options: finalOptions,
                    }
                );

            onQuestionUpdated(updatedQuestion);
            onClose();

        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "Failed to update question."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="add-question-overlay">
            <div className="add-question-modal">

                <div className="add-question-header">
                    <h2>Edit Question</h2>

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
                        <label>Question</label>

                        <textarea
                            value={questionText}
                            onChange={(e) =>
                                setQuestionText(e.target.value)
                            }
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Question Type</label>

                        <select
                            value={questionType}
                            onChange={(e) => {
                                const type = e.target.value;

                                setQuestionType(type);

                                if (
                                    type !== "single_choice" &&
                                    type !== "multiple_choice"
                                ) {
                                    setOptions([""]);
                                }
                            }}
                        >
                            <option value="text">
                                Text
                            </option>

                            <option value="single_choice">
                                Single Choice
                            </option>

                            <option value="multiple_choice">
                                Multiple Choice
                            </option>

                            <option value="rating">
                                Rating
                            </option>

                            <option value="yes_no">
                                Yes / No
                            </option>
                        </select>
                    </div>

                    {needsOptions && (
                        <div className="options-section">

                            <label>Options</label>

                            {options.map((option, index) => (
                                <div
                                    className="option-row"
                                    key={index}
                                >
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) =>
                                            handleOptionChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeOption(index)
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addOption}
                            >
                                + Add Option
                            </button>

                        </div>
                    )}

                    <div className="required-row">

                        <input
                            type="checkbox"
                            checked={required}
                            onChange={(e) =>
                                setRequired(
                                    e.target.checked
                                )
                            }
                        />

                        <label>
                            Required question
                        </label>

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
                            disabled={isSaving}
                        >
                            {isSaving
                                ? "Updating..."
                                : "Update Question"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditQuestion;