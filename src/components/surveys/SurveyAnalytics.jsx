import { useEffect, useState } from "react";

import {
    getSurveyQuestions,
    getSurveyResponses,
} from "../../services/api/surveyApi";

import "./SurveyAnalytics.css";


function SurveyAnalytics({ survey, onClose }) {

    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] = useState("");


    useEffect(() => {

        if (!survey) {
            return;
        }

        const fetchAnalytics = async () => {

            try {

                setIsLoading(true);
                setError("");

                const [
                    questionsData,
                    responsesData,
                ] = await Promise.all([
                    getSurveyQuestions(survey.id),
                    getSurveyResponses(survey.id),
                ]);

                setQuestions(
                    Array.isArray(questionsData)
                        ? questionsData
                        : []
                );

                setResponses(
                    Array.isArray(responsesData)
                        ? responsesData
                        : []
                );

            } catch (error) {

                console.error(
                    "Error fetching survey analytics:",
                    error
                );

                setError(
                    "Unable to load survey analytics."
                );

            } finally {

                setIsLoading(false);

            }

        };

        fetchAnalytics();

    }, [survey]);


    const getQuestionAnswers = (
        questionId
    ) => {

        const answers = [];

        responses.forEach(
            (response) => {

                if (
                    !Array.isArray(
                        response.answers
                    )
                ) {
                    return;
                }

                const answer =
                    response.answers.find(
                        (item) =>
                            Number(item.question) ===
                            Number(questionId)
                    );

                if (answer) {

                    answers.push(
                        answer.answer
                    );

                }

            }
        );

        return answers;

    };


    const countAnswers = (
        questionId
    ) => {

        const answers =
            getQuestionAnswers(
                questionId
            );

        const counts = {};

        answers.forEach(
            (answer) => {

                if (Array.isArray(answer)) {

                    answer.forEach(
                        (item) => {

                            counts[item] =
                                (counts[item] || 0) + 1;

                        }
                    );

                } else {

                    const value =
                        String(answer);

                    counts[value] =
                        (counts[value] || 0) + 1;

                }

            }
        );

        return counts;

    };


    if (!survey) {
        return null;
    }


    return (

        <div className="survey-analytics">

            {/* Header */}

            <div className="analytics-header">

                <div>

                    <h2>
                        Survey Analytics
                    </h2>

                    <p>
                        {survey.title}
                    </p>

                </div>


                <button
                    type="button"
                    className="analytics-close-btn"
                    onClick={onClose}
                >
                    ×
                </button>

            </div>


            {/* Loading */}

            {isLoading && (

                <div className="analytics-message">

                    <p>
                        Loading analytics...
                    </p>

                </div>

            )}


            {/* Error */}

            {!isLoading && error && (

                <div className="analytics-message analytics-error">

                    <p>
                        {error}
                    </p>

                </div>

            )}


            {/* Analytics */}

            {!isLoading &&
                !error && (

                <>

                    {/* Summary */}

                    <div className="analytics-summary">

                        <div className="analytics-summary-card">

                            <span>
                                Total Responses
                            </span>

                            <strong>
                                {responses.length}
                            </strong>

                        </div>


                        <div className="analytics-summary-card">

                            <span>
                                Total Questions
                            </span>

                            <strong>
                                {questions.length}
                            </strong>

                        </div>

                    </div>


                    {/* Questions */}

                    <div className="analytics-questions">

                        {questions.length === 0 && (

                            <div className="analytics-message">

                                <p>
                                    No questions have been
                                    added to this survey yet.
                                </p>

                            </div>

                        )}


                        {questions.map(
                            (question, index) => {

                                const counts =
                                    countAnswers(
                                        question.id
                                    );

                                const entries =
                                    Object.entries(
                                        counts
                                    );


                                return (

                                    <div
                                        className="analytics-question-card"
                                        key={question.id}
                                    >

                                        <div className="analytics-question-header">

                                            <span>
                                                Question{" "}
                                                {index + 1}
                                            </span>

                                            <h3>
                                                {
                                                    question.question_text
                                                }
                                            </h3>

                                            <small>
                                                Type:{" "}
                                                {formatQuestionType(
                                                    question.question_type
                                                )}
                                            </small>

                                        </div>


                                        {entries.length === 0 && (

                                            <p className="analytics-no-data">

                                                No responses
                                                available for
                                                this question.

                                            </p>

                                        )}


                                        {entries.length > 0 && (

                                            <div className="analytics-answer-list">

                                                {entries.map(
                                                    (
                                                        [
                                                            answer,
                                                            count,
                                                        ]
                                                    ) => {

                                                        const percentage =
                                                            responses.length > 0
                                                                ? (
                                                                    count /
                                                                    responses.length
                                                                ) *
                                                                100
                                                                : 0;


                                                        return (

                                                            <div
                                                                className="analytics-answer-row"
                                                                key={
                                                                    answer
                                                                }
                                                            >

                                                                <div className="analytics-answer-label">

                                                                    <span>
                                                                        {
                                                                            answer
                                                                        }
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            count
                                                                        }
                                                                    </strong>

                                                                </div>


                                                                <div className="analytics-answer-bar-container">

                                                                    <div
                                                                        className="analytics-answer-bar"
                                                                        style={{
                                                                            width:
                                                                                `${percentage}%`,
                                                                        }}
                                                                    />

                                                                </div>


                                                                <span className="analytics-percentage">

                                                                    {percentage.toFixed(
                                                                        0
                                                                    )}
                                                                    %

                                                                </span>

                                                            </div>

                                                        );

                                                    }
                                                )}

                                            </div>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>

                </>

            )}


            {/* Footer */}

            <div className="analytics-footer">

                <button
                    type="button"
                    onClick={onClose}
                >
                    Close
                </button>

            </div>

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


export default SurveyAnalytics;