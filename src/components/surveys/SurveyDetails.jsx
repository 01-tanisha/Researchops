import { useEffect, useState } from "react";
import "./SurveyDetails.css";

import EditQuestion from "./EditQuestion";
import AddQuestion from "./AddQuestion";
import AddScreeningQuestion from "./AddScreeningQuestion";

import {
    getSurveyQuestions,
    getScreeningQuestions,
} from "../../services/api/surveyApi";


function SurveyDetails({ survey, onClose }) {

    const [questions, setQuestions] = useState([]);

    const [screeningQuestions, setScreeningQuestions] =
        useState([]);

    const [editingQuestion, setEditingQuestion] =
        useState(null);

    const [showAddQuestion, setShowAddQuestion] =
        useState(false);

    const [showAddScreening, setShowAddScreening] =
        useState(false);


    const [isLoadingQuestions, setIsLoadingQuestions] =
        useState(false);

    const [isLoadingScreening, setIsLoadingScreening] =
        useState(false);

    const [questionError, setQuestionError] =
        useState("");

    const [screeningError, setScreeningError] =
        useState("");

    const [linkCopied, setLinkCopied] =
    useState(false);

    useEffect(() => {

        if (!survey) return;

        async function fetchQuestions() {

            try {

                setIsLoadingQuestions(true);
                setQuestionError("");

                const data =
                    await getSurveyQuestions(survey.id);

                setQuestions(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(error);

                setQuestionError(
                    "Unable to load survey questions."
                );

            } finally {

                setIsLoadingQuestions(false);

            }
        }

        fetchQuestions();

    }, [survey]);


    useEffect(() => {

        if (!survey) return;

        async function fetchScreeningQuestions() {

            try {

                setIsLoadingScreening(true);
                setScreeningError("");

                const data =
                    await getScreeningQuestions(
                        survey.id
                    );

                setScreeningQuestions(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(error);

                setScreeningError(
                    "Unable to load screening questions."
                );

            } finally {

                setIsLoadingScreening(false);

            }
        }

        fetchScreeningQuestions();

    }, [survey]);


    // Cleanup timeout when component unmounts or linkCopied changes
    useEffect(() => {
        if (!linkCopied) return;

        const timeoutId = setTimeout(() => {
            setLinkCopied(false);
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [linkCopied]);


    const handleCopyPublicLink = async () => {
        if (!survey.public_token) {
            alert("Public survey link is not available.");
            return;
        }

        const publicLink = `${window.location.origin}/survey/${survey.public_token}`;

        try {
            await navigator.clipboard.writeText(publicLink);
            setLinkCopied(true);
        } catch (error) {
            console.error("Failed to copy survey link:", error);
            alert("Unable to copy the survey link.");
        }
    };


    if (!survey) return null;


    return (
        <div className="survey-details">

            {/* HEADER */}

            <div className="survey-details-header">

                <h2>Survey Details</h2>

            </div>


            {/* SURVEY INFORMATION */}

            <div className="survey-details-content">

                <div className="survey-detail-item">

                    <span>Survey Name</span>

                    <strong>
                        {survey.title}
                    </strong>

                </div>


                <div className="survey-detail-item">

                    <span>Client Name</span>

                    <strong>
                        {survey.client}
                    </strong>

                </div>


                <div className="survey-detail-item">

                    <span>Status</span>

                    <strong>
                        {survey.status}
                    </strong>

                </div>


                <div className="survey-detail-item">

                    <span>Survey ID</span>

                    <strong>
                        {survey.id}
                    </strong>

                </div>

            </div>


            {/* SCREENING QUESTIONS */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">

                    <h3>
                        Screening Questions
                    </h3>

                    <button
                        type="button"
                        className="add-screening-btn"
                        onClick={() =>
                            setShowAddScreening(true)
                        }
                    >
                        + Add Screening Question
                    </button>

                </div>


                {isLoadingScreening && (
                    <p className="questions-message">
                        Loading screening questions...
                    </p>
                )}


                {!isLoadingScreening &&
                    screeningError && (
                        <p className="questions-error">
                            {screeningError}
                        </p>
                    )}


                {!isLoadingScreening &&
                    !screeningError &&
                    screeningQuestions.length === 0 && (

                        <p className="questions-message">

                            No screening questions
                            added yet.

                        </p>
                    )}


                {!isLoadingScreening &&
                    !screeningError &&
                    screeningQuestions.length > 0 && (

                        <div className="questions-list">

                            {screeningQuestions.map(
                                (question, index) => (

                                    <div
                                        className="survey-question-card"
                                        key={question.id}
                                    >

                                        <div className="question-number">

                                            <span>
                                                Screening Question{" "}
                                                {index + 1}
                                            </span>

                                        </div>


                                        <div className="question-text">

                                            <strong>
                                                {
                                                    question.question_text
                                                }
                                            </strong>

                                        </div>


                                        <div className="question-meta">

                                            <span>
                                                Type:{" "}
                                                {
                                                    formatQuestionType(
                                                        question.question_type
                                                    )
                                                }
                                            </span>


                                            <span>

                                                {question.required
                                                    ? "Required"
                                                    : "Optional"}

                                            </span>

                                        </div>


                                        {question.options &&
                                            question.options.length >
                                                0 && (

                                                <div className="question-options">

                                                    <span>
                                                        Options:
                                                    </span>

                                                    <ul>

                                                        {question.options.map(
                                                            (
                                                                option,
                                                                optionIndex
                                                            ) => (

                                                                <li
                                                                    key={
                                                                        optionIndex
                                                                    }
                                                                >
                                                                    {option}
                                                                </li>

                                                            )
                                                        )}

                                                    </ul>

                                                </div>
                                            )}

                                    </div>

                                )
                            )}

                        </div>
                    )}

            </div>


            {/* MAIN SURVEY QUESTIONS */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">

                    <h3>
                        Survey Questions
                    </h3>

                    <button
                        type="button"
                        className="add-screening-btn"
                        onClick={() => setShowAddQuestion(true)}
                    >
                        + Add Question
                    </button>

                </div>


                {isLoadingQuestions && (

                    <p className="questions-message">
                        Loading questions...
                    </p>

                )}


                {!isLoadingQuestions &&
                    questionError && (

                        <p className="questions-error">
                            {questionError}
                        </p>

                    )}


                {!isLoadingQuestions &&
                    !questionError &&
                    questions.length === 0 && (

                        <p className="questions-message">

                            No questions added to
                            this survey yet.

                        </p>

                    )}


                {!isLoadingQuestions &&
                    !questionError &&
                    questions.length > 0 && (

                        <div className="questions-list">

                            {questions.map(
                                (question, index) => (

                                    <div
                                        className="survey-question-card"
                                        key={question.id}
                                    >

                                        <div className="question-number">

                                            <span>
                                                Question{" "}
                                                {index + 1}
                                            </span>

                                        </div>


                                        <div className="question-text">

                                            <strong>
                                                {
                                                    question.question_text
                                                }
                                            </strong>

                                        </div>


                                        <div className="question-meta">

                                            <span>
                                                Type:{" "}
                                                {
                                                    formatQuestionType(
                                                        question.question_type
                                                    )
                                                }
                                            </span>


                                            <span>

                                                {question.required
                                                    ? "Required"
                                                    : "Optional"}

                                            </span>

                                        </div>


                                        {question.options &&
                                            question.options.length >
                                                0 && (

                                                <div className="question-options">

                                                    <span>
                                                        Options:
                                                    </span>

                                                    <ul>

                                                        {question.options.map(
                                                            (
                                                                option,
                                                                optionIndex
                                                            ) => (

                                                                <li
                                                                    key={
                                                                        optionIndex
                                                                    }
                                                                >
                                                                    {option}
                                                                </li>

                                                            )
                                                        )}

                                                    </ul>

                                                </div>
                                            )}

                                    </div>

                                )
                            )}

                        </div>
                    )}

            </div>


            {/* FOOTER */}

            <div className="survey-details-footer">

        <button
        type="button"
        className="copy-survey-link-btn"
        onClick={handleCopyPublicLink}
        >
        {linkCopied
            ? "✓ Link Copied"
            : "🔗 Copy Public Survey Link"}
    </button>

    <button
        type="button"
        className="survey-details-close-btn"
        onClick={onClose}
    >
        Close
    </button>

</div>


            {/* ADD MAIN QUESTION POPUP */}

            {showAddQuestion && (
                <AddQuestion
                    surveyId={survey.id}
                    onClose={() => setShowAddQuestion(false)}
                    onQuestionAdded={(newQuestion) => {
                        setQuestions((previous) => [...previous, newQuestion]);
                    }}
                />
            )}


            {/* ADD SCREENING QUESTION POPUP */}

            {showAddScreening && (

                <AddScreeningQuestion
                    surveyId={survey.id}

                    onClose={() =>
                        setShowAddScreening(false)
                    }

                    onQuestionCreated={(newQuestion) => {

                        setScreeningQuestions(
                            (previous) => [
                                ...previous,
                                newQuestion,
                            ]
                        );

                    }}
                />

            )}


            {/* EDIT MAIN QUESTION */}

            {editingQuestion && (

                <EditQuestion
                    question={editingQuestion}

                    onClose={() =>
                        setEditingQuestion(null)
                    }

                    onQuestionUpdated={(updatedQuestion) => {

                        setQuestions(
                            (previous) =>
                                previous.map(
                                    (question) =>
                                        question.id ===
                                        updatedQuestion.id
                                            ? updatedQuestion
                                            : question
                                )
                        );

                    }}
                />

            )}

        </div>
    );
}


function formatQuestionType(type) {

    const types = {

        text: "Text",

        single_choice:
            "Single Choice",

        multiple_choice:
            "Multiple Choice",

        rating:
            "Rating",

        yes_no:
            "Yes / No",

    };

    return types[type] || type;
}


export default SurveyDetails;