import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    getPublicSurvey,
    submitScreeningAnswers,
    getSurveyQuestions,
    submitSurveyResponse,
} from "../../services/api/surveyApi";

import "./PublicSurvey.css";

function PublicSurvey() {
    const { publicToken } = useParams();

    const [survey, setSurvey] = useState(null);
    const [mainQuestions, setMainQuestions] = useState([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [answers, setAnswers] = useState({});
    const [mainAnswers, setMainAnswers] = useState({});

    const [step, setStep] = useState("details");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [surveyPaused, setSurveyPaused] = useState(false);

    // --------------------------------
    // LOAD PUBLIC SURVEY
    // --------------------------------

    useEffect(() => {
        const loadSurvey = async () => {
            try {
                setIsLoading(true);
                setError("");
                setSurveyPaused(false);

                const data = await getPublicSurvey(publicToken);

                setSurvey(data);
            } catch (err) {
                if (
                    err.message?.toLowerCase().includes("not live")
                ) {
                    setSurveyPaused(true);
                } else {
                    setError(
                        err.message ||
                        "Unable to load survey."
                    );
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadSurvey();
    }, [publicToken]);

    // --------------------------------
    // NAME + EMAIL
    // --------------------------------

    const handleDetailsSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your Gmail address.");
            return;
        }

        const gmailRegex =
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!gmailRegex.test(email.trim())) {
            setError("Please enter a valid Gmail address.");
            return;
        }

        setError("");

        setStep("screening");
    };

    // --------------------------------
    // SCREENING ANSWERS
    // --------------------------------

    const handleScreeningAnswer = (
        questionId,
        value
    ) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: value,
        }));
    };

    // --------------------------------
    // SUBMIT SCREENING
    // --------------------------------

    const handleScreeningSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // Required validation
        for (
            const question
            of survey.screening_questions
        ) {
            if (
                question.required &&
                !answers[question.id]
            ) {
                setError(
                    `Please answer question ${survey.screening_questions.indexOf(question) + 1}.`
                );

                return;
            }
        }

        try {
            setIsSubmitting(true);

            const result =
                await submitScreeningAnswers(
                    publicToken,
                    answers,
                    name,
                    email
                );

            // WRONG ANSWER
            if (!result.eligible) {
                setStep("disqualified");
                return;
            }

            // CORRECT ANSWERS
            // Fetch main survey questions
            const questions =
                await getSurveyQuestions(survey.id);

            setMainQuestions(questions);

            setStep("mainSurvey");

        } catch (err) {
            setError(
                err.message ||
                "Unable to submit screening answers."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // --------------------------------
    // MAIN SURVEY ANSWERS
    // --------------------------------

    const handleMainAnswer = (
        questionId,
        value
    ) => {
        setMainAnswers((previous) => ({
            ...previous,
            [questionId]: value,
        }));
    };

    const handleMainSurveySubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required questions
    for (const question of mainQuestions) {
        if (
            question.required &&
            !mainAnswers[question.id]
        ) {
            setError(
                `Please answer question ${
                    mainQuestions.indexOf(question) + 1
                }.`
            );
            return;
        }
    }

    try {
        setIsSubmitting(true);

        // Convert answers into backend format
        const formattedAnswers = mainQuestions.map(
            (question) => ({
                question: question.id,
                answer: mainAnswers[question.id] || "",
            })
        );

        // Save responses in Django
        await submitSurveyResponse(
            survey.id,
            {
                respondent_name: name.trim(),
                respondent_id: email.trim(),
                answers: formattedAnswers,
            }
        );

        // Show success page
        setStep("submitted");

    } catch (err) {
        console.error(
            "Survey submission error:",
            err
        );

        setError(
            err.message ||
            "Unable to submit survey. Please try again."
        );

    } finally {
        setIsSubmitting(false);
    }
};

    // --------------------------------
    // LOADING
    // --------------------------------

    if (isLoading) {
        return (
            <div className="public-survey-page">
                <div className="public-survey-card status-card">
                    <div className="loader"></div>

                    <h2>Loading Survey...</h2>

                    <p>
                        Please wait while we load the survey.
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------
    // PAUSED SURVEY
    // --------------------------------

    if (surveyPaused) {
        return (
            <div className="public-survey-page">
                <div className="public-survey-card status-card">

                    <div className="status-icon">
                        ⏸
                    </div>

                    <h1>
                        Survey Not Live
                    </h1>

                    <p>
                        This survey is not live at the moment.
                    </p>

                    <p className="status-subtext">
                        Please check back later.
                    </p>

                </div>
            </div>
        );
    }

    // --------------------------------
    // GENERAL ERROR
    // --------------------------------

    if (error && !survey) {
        return (
            <div className="public-survey-page">
                <div className="public-survey-card status-card">

                    <div className="status-icon error-icon">
                        !
                    </div>

                    <h1>
                        Unable to Load Survey
                    </h1>

                    <p>
                        {error}
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="public-survey-page">

            <div className="public-survey-card">

                {/* =================================
                    DETAILS
                ================================= */}

                {step === "details" && (
                    <>
                        <div className="survey-top">
                            <h1>{survey.title}</h1>

                            <p>
                                Welcome! Please enter your
                                details to participate.
                            </p>
                        </div>

                        <form
                            onSubmit={handleDetailsSubmit}
                            className="public-survey-form"
                        >

                            <div className="public-form-group">
                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="public-form-group">
                                <label>
                                    Gmail Address
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="example@gmail.com"
                                />
                            </div>

                            {error && (
                                <div className="form-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="public-survey-button"
                            >
                                Continue
                            </button>

                        </form>
                    </>
                )}

                {/* =================================
                    SCREENING
                ================================= */}

                {step === "screening" && (
                    <>
                        <div className="survey-top">
                            <h1>
                                Screening Questions
                            </h1>

                            <p>
                                Please answer all the questions
                                below to check your eligibility.
                            </p>
                        </div>

                        <form
                            onSubmit={handleScreeningSubmit}
                            className="screening-form"
                        >

                            {survey.screening_questions.length === 0 ? (

                                <div className="empty-screening">
                                    No screening questions available.
                                </div>

                            ) : (

                                survey.screening_questions.map(
                                    (question, index) => (

                                        <div
                                            className="screening-question-card"
                                            key={question.id}
                                        >

                                            <div className="question-label">
                                                <span className="question-number">
                                                    {index + 1}
                                                </span>

                                                <span>
                                                    {question.question_text}

                                                    {question.required && (
                                                        <b className="required-star">
                                                            *
                                                        </b>
                                                    )}
                                                </span>
                                            </div>

                                            {/* TEXT */}

                                            {(!question.options?.length ||
                                                question.question_type === "text") && (

                                                <input
                                                    type="text"
                                                    className="screening-input"
                                                    value={
                                                        answers[
                                                            question.id
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleScreeningAnswer(
                                                            question.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter your answer"
                                                />
                                            )}

                                            {/* SINGLE CHOICE */}

                                            {(question.question_type === "single_choice" ||
                                                (!question.question_type && question.options?.length > 0)) && (

                                                <div className="screening-options">

                                                    {question.options.map(
                                                        (
                                                            option,
                                                            optionIndex
                                                        ) => (

                                                            <label
                                                                className="screening-option"
                                                                key={
                                                                    optionIndex
                                                                }
                                                            >

                                                                <input
                                                                    type="radio"
                                                                    name={`screening-${question.id}`}
                                                                    value={option}
                                                                    checked={
                                                                        answers[
                                                                            question.id
                                                                        ] === option
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleScreeningAnswer(
                                                                            question.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                                <span>
                                                                    {option}
                                                                </span>

                                                            </label>
                                                        )
                                                    )}

                                                </div>
                                            )}

                                            {/* YES / NO */}

                                            {question.question_type ===
                                                "yes_no" && (

                                                <div className="screening-options">

                                                    <label className="screening-option">

                                                        <input
                                                            type="radio"
                                                            name={`screening-${question.id}`}
                                                            value="Yes"
                                                            checked={
                                                                answers[
                                                                    question.id
                                                                ] === "Yes"
                                                            }
                                                            onChange={(e) =>
                                                                handleScreeningAnswer(
                                                                    question.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            Yes
                                                        </span>

                                                    </label>

                                                    <label className="screening-option">

                                                        <input
                                                            type="radio"
                                                            name={`screening-${question.id}`}
                                                            value="No"
                                                            checked={
                                                                answers[
                                                                    question.id
                                                                ] === "No"
                                                            }
                                                            onChange={(e) =>
                                                                handleScreeningAnswer(
                                                                    question.id,
                                                                    e.target.value
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
                                )
                            )}

                            {error && (
                                <div className="form-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="public-survey-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Checking Eligibility..."
                                    : "Submit Screening"}
                            </button>

                        </form>
                    </>
                )}

                {/* =================================
                    DISQUALIFIED
                ================================= */}

                {step === "disqualified" && (
                    <div className="result-page">

                        <div className="result-icon disqualified-icon">
                            ✕
                        </div>

                        <h1>
                            You Are Disqualified
                        </h1>

                        <p>
                            Thank you for your interest
                            in participating in this survey.
                        </p>

                        <p className="result-subtext">
                            Unfortunately, your responses
                            do not meet the screening
                            requirements for this survey.
                        </p>

                    </div>
                )}

                {/* =================================
                    MAIN SURVEY
                ================================= */}

                {step === "mainSurvey" && (
                    <>
                        <div className="survey-top">
                            <h1>
                                {survey.title}
                            </h1>

                            <p>
                                Welcome, {name}. You are
                                eligible to participate.
                            </p>
                        </div>

                        <div className="eligible-banner">
                            ✓ Screening completed successfully
                        </div>

                        <div className="main-survey-section">

                            <h2>
                                Survey Questions
                            </h2>

                            {mainQuestions.length === 0 ? (

                                <div className="empty-screening">
                                    No survey questions have
                                    been added yet.
                                </div>

                            ) : (

                                mainQuestions.map(
                                    (question, index) => (

                                        <div
                                            className="main-question-card"
                                            key={question.id}
                                        >

                                            <div className="question-label">

                                                <span className="question-number">
                                                    {index + 1}
                                                </span>

                                                <span>
                                                    {question.question_text}

                                                    {question.required && (
                                                        <b className="required-star">
                                                            *
                                                        </b>
                                                    )}
                                                </span>

                                            </div>

                                            {/* TEXT */}

                                            {question.question_type ===
                                                "text" && (

                                                <input
                                                    type="text"
                                                    className="screening-input"
                                                    value={
                                                        mainAnswers[
                                                            question.id
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleMainAnswer(
                                                            question.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter your answer"
                                                />
                                            )}

                                            {/* SINGLE CHOICE */}

                                            {question.question_type ===
                                                "single_choice" && (

                                                <div className="screening-options">

                                                    {question.options?.map(
                                                        (
                                                            option,
                                                            optionIndex
                                                        ) => (

                                                            <label
                                                                className="screening-option"
                                                                key={
                                                                    optionIndex
                                                                }
                                                            >

                                                                <input
                                                                    type="radio"
                                                                    name={`main-${question.id}`}
                                                                    value={option}
                                                                    checked={
                                                                        mainAnswers[
                                                                            question.id
                                                                        ] === option
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleMainAnswer(
                                                                            question.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                                <span>
                                                                    {option}
                                                                </span>

                                                            </label>
                                                        )
                                                    )}

                                                </div>
                                            )}

                                            {question.question_type === "multiple_choice" && (
                                                <div className="screening-options">
                                                    {question.options?.map((option, optionIndex) => {
                                                        const selected = Array.isArray(mainAnswers[question.id])
                                                            ? mainAnswers[question.id]
                                                            : [];

                                                        return (
                                                            <label className="screening-option" key={optionIndex}>
                                                                <input
                                                                    type="checkbox"
                                                                    value={option}
                                                                    checked={selected.includes(option)}
                                                                    onChange={(e) => {
                                                                        const next = e.target.checked
                                                                            ? [...selected, option]
                                                                            : selected.filter((value) => value !== option);
                                                                        handleMainAnswer(question.id, next);
                                                                    }}
                                                                />
                                                                <span>{option}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* YES / NO */}

                                            {question.question_type ===
                                                "yes_no" && (

                                                <div className="screening-options">

                                                    {["Yes", "No"].map(
                                                        (option) => (

                                                            <label
                                                                className="screening-option"
                                                                key={option}
                                                            >

                                                                <input
                                                                    type="radio"
                                                                    name={`main-${question.id}`}
                                                                    value={option}
                                                                    checked={
                                                                        mainAnswers[
                                                                            question.id
                                                                        ] === option
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleMainAnswer(
                                                                            question.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                                <span>
                                                                    {option}
                                                                </span>

                                                            </label>
                                                        )
                                                    )}

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
                                                                        mainAnswers[
                                                                            question.id
                                                                        ] ===
                                                                        String(rating)
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleMainAnswer(
                                                                            question.id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                                <span>
                                                                    {rating}
                                                                </span>

                                                            </label>
                                                        )
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    )
                                )
                            )}

                            {mainQuestions.length > 0 && (
                                <form
                                    className="main-survey-submit-form"
                                    onSubmit={handleMainSurveySubmit}
                                >
                                    {error && <div className="form-error">{error}</div>}
                                    <button
                                        type="submit"
                                        className="public-survey-button"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Submitting Response..."
                                            : "Submit Survey"}
                                    </button>
                                </form>
                            )}

                        </div>
                    </>
                )}

                {step === "submitted" && (
                    <div className="result-page success-page">
                        <div className="result-icon success-icon">✓</div>
                        <h1>Response Submitted</h1>
                        <p>
                            Thank you, {name}. Your survey response has been recorded.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default PublicSurvey;