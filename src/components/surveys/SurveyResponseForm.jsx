import { useEffect, useState } from "react";
import {
    getSurveyQuestions,
    submitSurveyResponse,
} from "../../services/api/surveyApi";
import "./SurveyResponseForm.css";

function SurveyResponseForm({ survey, onClose, onSubmitted }) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [respondentName, setRespondentName] = useState("");
    const [respondentEmail, setRespondentEmail] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!survey) {
            return;
        }

        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await getSurveyQuestions(survey.id);

                setQuestions(
                    Array.isArray(data) ? data : []
                );
            } catch (err) {
                console.error(err);

                setError(
                    "Unable to load survey questions."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, [survey]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: value,
        }));
    };

    const handleMultipleChoiceChange = (
        questionId,
        option
    ) => {
        setAnswers((previous) => {
            const currentAnswers =
                Array.isArray(previous[questionId])
                    ? previous[questionId]
                    : [];

            const alreadySelected =
                currentAnswers.includes(option);

            const updatedAnswers = alreadySelected
                ? currentAnswers.filter(
                      (item) => item !== option
                  )
                : [...currentAnswers, option];

            return {
                ...previous,
                [questionId]: updatedAnswers,
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        for (const question of questions) {
            if (!question.required) {
                continue;
            }

            const answer = answers[question.id];

            if (
                answer === undefined ||
                answer === null ||
                answer === "" ||
                (Array.isArray(answer) &&
                    answer.length === 0)
            ) {
                setError(
                    `Please answer Question ${questions.indexOf(question) + 1}.`
                );

                return;
            }
        }

        try {
            setIsSubmitting(true);

            const responseAnswers = questions.map(
                (question) => ({
                    question: question.id,
                    answer:
                        answers[question.id] ?? "",
                })
            );

            await submitSurveyResponse(
                survey.id,
                {
                    respondent_name:
                        respondentName.trim(),

                    respondent_email:
                        respondentEmail.trim(),

                    answers: responseAnswers,
                }
            );

            setSuccess(
                "Survey response submitted successfully."
            );

            if (onSubmitted) {
                onSubmitted();
            }
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                    "Failed to submit survey response."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!survey) {
        return null;
    }

    return (
        <div className="survey-response-overlay">
            <div className="survey-response-modal">

                <div className="survey-response-header">
                    <div>
                        <h2>{survey.title}</h2>

                        <p>
                            Client: {survey.client}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="response-close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {isLoading && (
                    <p className="response-message">
                        Loading questions...
                    </p>
                )}

                {!isLoading && error && (
                    <p className="response-error">
                        {error}
                    </p>
                )}

                {!isLoading &&
                    !error &&
                    questions.length === 0 && (
                        <p className="response-message">
                            This survey has no questions yet.
                        </p>
                    )}

                {!isLoading &&
                    questions.length > 0 && (
                        <form
                            className="survey-response-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="respondent-section">
                                <h3>
                                    Respondent Information
                                </h3>

                                <div className="form-group">
                                    <label>
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        value={respondentName}
                                        onChange={(event) =>
                                            setRespondentName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={respondentEmail}
                                        onChange={(event) =>
                                            setRespondentEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="questions-section">
                                <h3>
                                    Survey Questions
                                </h3>

                                {questions.map(
                                    (question, index) => (
                                        <div
                                            className="response-question-card"
                                            key={question.id}
                                        >
                                            <label>
                                                <strong>
                                                    Question{" "}
                                                    {index + 1}
                                                </strong>

                                                {question.required && (
                                                    <span className="required-star">
                                                        {" "}
                                                        *
                                                    </span>
                                                )}
                                            </label>

                                            <p className="response-question-text">
                                                {
                                                    question.question_text
                                                }
                                            </p>

                                            {question.question_type ===
                                                "text" && (
                                                <textarea
                                                    rows="4"
                                                    value={
                                                        answers[
                                                            question.id
                                                        ] || ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Enter your answer"
                                                />
                                            )}

                                            {question.question_type ===
                                                "single_choice" && (
                                                <div className="choice-list">
                                                    {question.options?.map(
                                                        (
                                                            option,
                                                            optionIndex
                                                        ) => (
                                                            <label
                                                                className="choice-item"
                                                                key={
                                                                    optionIndex
                                                                }
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`question-${question.id}`}
                                                                    value={
                                                                        option
                                                                    }
                                                                    checked={
                                                                        answers[
                                                                            question
                                                                                .id
                                                                        ] ===
                                                                        option
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleAnswerChange(
                                                                            question.id,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />

                                                                <span>
                                                                    {
                                                                        option
                                                                    }
                                                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                            {question.question_type ===
                                                "multiple_choice" && (
                                                <div className="choice-list">
                                                    {question.options?.map(
                                                        (
                                                            option,
                                                            optionIndex
                                                        ) => (
                                                            <label
                                                                className="choice-item"
                                                                key={
                                                                    optionIndex
                                                                }
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        Array.isArray(
                                                                            answers[
                                                                                question
                                                                                    .id
                                                                            ]
                                                                        ) &&
                                                                        answers[
                                                                            question
                                                                                .id
                                                                        ].includes(
                                                                            option
                                                                        )
                                                                    }
                                                                    onChange={() =>
                                                                        handleMultipleChoiceChange(
                                                                            question.id,
                                                                            option
                                                                        )
                                                                    }
                                                                />

                                                                <span>
                                                                    {
                                                                        option
                                                                    }
                                                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                            {question.question_type ===
                                                "rating" && (
                                                <select
                                                    value={
                                                        answers[
                                                            question.id
                                                        ] || ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select rating
                                                    </option>

                                                    <option value="1">
                                                        1
                                                    </option>

                                                    <option value="2">
                                                        2
                                                    </option>

                                                    <option value="3">
                                                        3
                                                    </option>

                                                    <option value="4">
                                                        4
                                                    </option>

                                                    <option value="5">
                                                        5
                                                    </option>
                                                </select>
                                            )}

                                            {question.question_type ===
                                                "yes_no" && (
                                                <div className="choice-list">
                                                    <label className="choice-item">
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            value="Yes"
                                                            checked={
                                                                answers[
                                                                    question
                                                                        .id
                                                                ] ===
                                                                "Yes"
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleAnswerChange(
                                                                    question.id,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            Yes
                                                        </span>
                                                    </label>

                                                    <label className="choice-item">
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            value="No"
                                                            checked={
                                                                answers[
                                                                    question
                                                                        .id
                                                                ] ===
                                                                "No"
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleAnswerChange(
                                                                    question.id,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            No
                                                        </span>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>

                            {error && (
                                <p className="response-error">
                                    {error}
                                </p>
                            )}

                            {success && (
                                <p className="response-success">
                                    {success}
                                </p>
                            )}

                            <div className="response-form-actions">
                                <button
                                    type="button"
                                    className="response-cancel-btn"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="response-submit-btn"
                                    disabled={
                                        isSubmitting
                                    }
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : "Submit Survey"}
                                </button>
                            </div>
                        </form>
                    )}
            </div>
        </div>
    );
}

export default SurveyResponseForm;