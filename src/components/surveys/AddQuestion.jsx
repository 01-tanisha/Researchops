import { useState } from "react";
import { createSurveyQuestion } from "../../services/api/surveyApi";
import "./AddQuestion.css";
function AddQuestion({ surveyId, onClose, onQuestionAdded }) {
    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState("text");
    const [required, setRequired] = useState(true);
    const [options, setOptions] = useState([""]);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const showOptions =
        questionType === "single_choice" ||
        questionType === "multiple_choice";

    const handleAddOption = () => {
        setOptions((prevOptions) => [...prevOptions, ""]);
    };

    const handleOptionChange = (index, value) => {
        setOptions((prevOptions) => {
            const updatedOptions = [...prevOptions];
            updatedOptions[index] = value;
            return updatedOptions;
        });
    };

    const handleRemoveOption = (index) => {
        setOptions((prevOptions) =>
            prevOptions.filter(
                (_, optionIndex) => optionIndex !== index
            )
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!questionText.trim()) {
            setError("Question text is required.");
            return;
        }

        const cleanedOptions = options
            .map((option) => option.trim())
            .filter((option) => option !== "");

        if (showOptions && cleanedOptions.length < 2) {
            setError("Please add at least two options.");
            return;
        }

        try {
            setIsSaving(true);

            const questionData = {
                question_text: questionText.trim(),
                question_type: questionType,
                required: required,
                options: showOptions ? cleanedOptions : [],
            };

            const newQuestion = await createSurveyQuestion(
                surveyId,
                questionData
            );

            onQuestionAdded(newQuestion);
            onClose();
        } catch (error) {
            console.error(
                "Error creating question:",
                error
            );

            setError(
                error.message ||
                    "Failed to create question."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="question-modal-overlay">
            <div className="question-modal">
                <div className="question-modal-header">
                    <h3>Add Question</h3>

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="questionText">
                            Question
                        </label>

                        <textarea
                            id="questionText"
                            value={questionText}
                            onChange={(event) =>
                                setQuestionText(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your question"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="questionType">
                            Question Type
                        </label>

                        <select
                            id="questionType"
                            value={questionType}
                            onChange={(event) =>
                                setQuestionType(
                                    event.target.value
                                )
                            }
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

                    {showOptions && (
                        <div className="form-group">
                            <label>
                                Options
                            </label>

                            {options.map(
                                (option, index) => (
                                    <div
                                        className="option-row"
                                        key={index}
                                    >
                                        <input
                                            type="text"
                                            value={option}
                                            placeholder={`Option ${
                                                index + 1
                                            }`}
                                            onChange={(
                                                event
                                            ) =>
                                                handleOptionChange(
                                                    index,
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                        {options.length >
                                            1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveOption(
                                                        index
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                )
                            )}

                            <button
                                type="button"
                                onClick={handleAddOption}
                            >
                                + Add Option
                            </button>
                        </div>
                    )}

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={required}
                                onChange={(event) =>
                                    setRequired(
                                        event.target.checked
                                    )
                                }
                            />

                            Required
                        </label>
                    </div>

                    {error && (
                        <p className="question-form-error">
                            {error}
                        </p>
                    )}

                    <div className="question-modal-actions">
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
                                ? "Saving..."
                                : "Add Question"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddQuestion;