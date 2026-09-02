import { useState } from "react";
import {
    createScreeningQuestion,
} from "../../services/api/surveyApi";
import "./AddQuestion.css";

function AddScreeningQuestion({
    surveyId,
    onClose,
    onQuestionCreated,
}) {
    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState("text");
    const [options, setOptions] = useState([""]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [required, setRequired] = useState(true);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const needsOptions =
        questionType === "single_choice";

    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const removeOption = (index) => {
        if (options.length === 1) return;

        setOptions(
            options.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

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

        if (!correctAnswer.trim()) {
            setError("Correct answer is required.");
            return;
        }

        if (
            needsOptions &&
            !finalOptions.includes(correctAnswer.trim())
        ) {
            setError(
                "Correct answer must match one of the options."
            );
            return;
        }

        try {
            setIsSaving(true);

            const question =
                await createScreeningQuestion(
                    surveyId,
                    {
                        question_text:
                            questionText.trim(),

                        question_type:
                            questionType,

                        options:
                            finalOptions,

                        correct_answer:
                            correctAnswer.trim(),

                        required,
                    }
                );

            onQuestionCreated(question);
            onClose();

        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "Failed to create screening question."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="add-question-overlay">
            <div className="add-question-modal">

                <div className="add-question-header">
                    <h2>
                        Add Screening Question
                    </h2>

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
                        <label>
                            Screening Question
                        </label>

                        <textarea
                            value={questionText}
                            onChange={(e) =>
                                setQuestionText(
                                    e.target.value
                                )
                            }
                            rows="3"
                            placeholder="Enter screening question"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Question Type
                        </label>

                        <select
                            value={questionType}
                            onChange={(e) => {
                                const type =
                                    e.target.value;

                                setQuestionType(type);

                                if (
                                    type !==
                                    "single_choice"
                                ) {
                                    setOptions([""]);
                                }

                                setCorrectAnswer("");
                            }}
                        >
                            <option value="text">
                                Text
                            </option>

                            <option value="single_choice">
                                Single Choice
                            </option>

                            <option value="yes_no">
                                Yes / No
                            </option>
                        </select>
                    </div>

                    {needsOptions && (
                        <div className="options-section">

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
                                                removeOption(
                                                    index
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            )}

                            <button
                                type="button"
                                onClick={addOption}
                            >
                                + Add Option
                            </button>

                        </div>
                    )}

                    <div className="form-group">
                        <label>
                            Correct Answer
                        </label>

                        <input
                            type="text"
                            value={correctAnswer}
                            onChange={(e) =>
                                setCorrectAnswer(
                                    e.target.value
                                )
                            }
                            placeholder="Enter correct answer"
                        />
                    </div>

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
                                ? "Saving..."
                                : "Add Screening Question"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddScreeningQuestion;