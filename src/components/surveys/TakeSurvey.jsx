import { useEffect, useState } from "react";

import {
    getSurveyQuestions,
    submitSurveyResponse,
} from "../../services/api/surveyApi";

import "./TakeSurvey.css";


function TakeSurvey({ survey, onClose }) {

    const [questions, setQuestions] = useState([]);

    const [answers, setAnswers] = useState({});

    const [respondentName, setRespondentName] =
        useState("");

    const [respondentId, setRespondentId] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] =
        useState(false);


    useEffect(() => {

        if (!survey) {
            return;
        }

        const fetchQuestions = async () => {

            try {

                setIsLoading(true);
                setError("");

                const data =
                    await getSurveyQuestions(
                        survey.id
                    );

                setQuestions(
                    Array.isArray(data)
                        ? data
                        : []
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


    const handleAnswerChange = (
        questionId,
        value
    ) => {

        setAnswers((previous) => ({
            ...previous,
            [questionId]: value,
        }));

    };


    const handleMultipleChoice = (
        questionId,
        option
    ) => {

        setAnswers((previous) => {

            const current =
                previous[questionId] || [];

            const updated =
                current.includes(option)
                    ? current.filter(
                        (item) =>
                            item !== option
                    )
                    : [
                        ...current,
                        option,
                    ];

            return {
                ...previous,
                [questionId]: updated,
            };

        });

    };


    const validateAnswers = () => {

        for (const question of questions) {

            if (!question.required) {
                continue;
            }

            const answer =
                answers[question.id];


            if (
                answer === undefined ||
                answer === null ||
                answer === "" ||
                (
                    Array.isArray(answer) &&
                    answer.length === 0
                )
            ) {

                return (
                    `Please answer Question ${
                        questions.indexOf(question) + 1
                    }.`
                );

            }

        }

        return null;

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        const validationError =
            validateAnswers();

        if (validationError) {

            setError(validationError);

            return;
        }

        if (!respondentName.trim() || !respondentId.trim()) {
            setError("Respondent name and ID are required.");
            return;
        }


        try {

            setIsSubmitting(true);
            setError("");


            for (const question of questions) {
                await submitSurveyResponse(
                    survey.id,
                    {
                        question: question.id,
                        answer: {
                            value: answers[question.id] ?? "",
                            respondent_name: respondentName.trim(),
                            respondent_id: respondentId.trim(),
                        },
                    }
                );
            }


            setSuccess(true);

            setTimeout(() => {
                onClose();
            }, 1200);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to submit survey."
            );

        } finally {

            setIsSubmitting(false);

        }

    };


    if (!survey) {
        return null;
    }


    return (

        <div className="take-survey-overlay">

            <div className="take-survey-modal">

                {/* Header */}

                <div className="take-survey-header">

                    <div>

                        <h2>
                            {survey.title}
                        </h2>

                        <p>
                            Client: {survey.client}
                        </p>

                    </div>


                    <button
                        type="button"
                        className="take-survey-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                {/* Success */}

                {success && (

                    <div className="survey-success">

                        <h3>
                            Survey Submitted Successfully
                        </h3>

                        <p>
                            Thank you for completing
                            this survey.
                        </p>

                        <button
                            type="button"
                            className="survey-success-btn"
                            onClick={onClose}
                        >
                            Close
                        </button>

                    </div>

                )}


                {/* Loading */}

                {!success && isLoading && (

                    <div className="take-survey-message">

                        Loading questions...

                    </div>

                )}


                {/* Error */}

                {!success &&
                    !isLoading &&
                    error && (

                    <div className="take-survey-error">

                        {error}

                    </div>

                )}


                {/* No Questions */}

                {!success &&
                    !isLoading &&
                    !error &&
                    questions.length === 0 && (

                    <div className="take-survey-message">

                        No questions have been
                        added to this survey yet.

                    </div>

                )}


                {/* Survey Form */}

                {!success &&
                    !isLoading &&
                    questions.length > 0 && (

                    <form
                        className="take-survey-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="respondent-fields">

                            <h3>Respondent Information</h3>

                            <label>
                                Name
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
                            </label>

                            <label>
                                Respondent ID
                                <input
                                    type="text"
                                    value={respondentId}
                                    onChange={(event) =>
                                        setRespondentId(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your ID"
                                />
                            </label>

                        </div>

                        {questions.map(
                            (question, index) => (

                            <div
                                className="take-question-card"
                                key={question.id}
                            >

                                <div className="take-question-number">

                                    Question {index + 1}

                                </div>


                                <label className="take-question-text">

                                    {question.question_text}

                                    {question.required && (

                                        <span className="required-mark">
                                            *
                                        </span>

                                    )}

                                </label>


                                {/* TEXT */}

                                {question.question_type ===
                                    "text" && (

                                    <textarea
                                        rows="4"
                                        value={
                                            answers[
                                                question.id
                                            ] || ""
                                        }
                                        onChange={(event) =>
                                            handleAnswerChange(
                                                question.id,
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your answer..."
                                    />

                                )}


                                {/* SINGLE CHOICE */}

                                {question.question_type ===
                                    "single_choice" && (

                                    <div className="take-options">
                                        {question.options?.map(
                                            (option) => (

                                            <label
                                                className="take-option"
                                                key={option}
                                            >

                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={option}
                                                    checked={
                                                        answers[
                                                            question.id
                                                        ] ===
                                                        option
                                                    }
                                                    onChange={() =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            option
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {option}
                                                </span>

                                            </label>

                                        ))}

                                    </div>

                                )}


                                {/* MULTIPLE CHOICE */}

                                {question.question_type ===
                                    "multiple_choice" && (

                                    <div className="take-options">

                                        {question.options?.map(
                                            (option) => (

                                            <label
                                                className="take-option"
                                                key={option}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        (
                                                            answers[
                                                                question.id
                                                            ] || []
                                                        ).includes(
                                                            option
                                                        )
                                                    }
                                                    onChange={() =>
                                                        handleMultipleChoice(
                                                            question.id,
                                                            option
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {option}
                                                </span>

                                            </label>

                                        ))}

                                    </div>

                                )}


                                {/* RATING */}

                                {question.question_type ===
                                    "rating" && (

                                    <div className="rating-options">

                                        {[1, 2, 3, 4, 5].map(
                                            (rating) => (

                                            <label
                                                key={rating}
                                                className="rating-option"
                                            >

                                                <input
                                                    type="radio"
                                                    name={`rating-${question.id}`}
                                                    value={rating}
                                                    checked={
                                                        String(
                                                            answers[
                                                                question.id
                                                            ] ?? ""
                                                        ) ===
                                                        String(rating)
                                                    }
                                                    onChange={(event) =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            event.target.value
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {rating}
                                                </span>

                                            </label>

                                        ))}

                                    </div>

                                )}


                                {/* YES / NO */}

                                {question.question_type ===
                                    "yes_no" && (

                                    <div className="take-options">

                                        <label className="take-option">

                                            <input
                                                type="radio"
                                                name={`yes-no-${question.id}`}
                                                value="Yes"
                                                checked={
                                                    answers[
                                                        question.id
                                                    ] === "Yes"
                                                }
                                                onChange={() =>
                                                    handleAnswerChange(
                                                        question.id,
                                                        "Yes"
                                                    )
                                                }
                                            />

                                            <span>
                                                Yes
                                            </span>

                                        </label>


                                        <label className="take-option">

                                            <input
                                                type="radio"
                                                name={`yes-no-${question.id}`}
                                                value="No"
                                                checked={
                                                    answers[
                                                        question.id
                                                    ] === "No"
                                                }
                                                onChange={() =>
                                                    handleAnswerChange(
                                                        question.id,
                                                        "No"
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

                        ))}


                        {/* Actions */}

                        <div className="take-survey-actions">

                            <button
                                type="button"
                                className="take-cancel-btn"
                                onClick={onClose}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="take-submit-btn"
                                disabled={isSubmitting}
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


export default TakeSurvey;