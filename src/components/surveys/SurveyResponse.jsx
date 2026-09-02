import { useCallback, useEffect, useState } from "react";
import {
    getScreeningResponses,
    getSurveyResponses,
} from "../../services/api/surveyApi";
import "./SurveyResponse.css";

function SurveyResponses({ survey, onClose }) {
    const [responses, setResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * ==============================
     * LOAD RESPONSES
     * ==============================
     */

    const loadResponses = useCallback(async () => {
        if (!survey?.id) {
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const [surveyData, screeningData] =
                await Promise.all([
                    getSurveyResponses(survey.id),
                    getScreeningResponses(survey.id),
                ]);

            const mainResponses = Array.isArray(surveyData)
                ? surveyData.map((response) => ({
                      ...response,
                      response_type: "survey",
                  }))
                : [];

            const screening = Array.isArray(screeningData)
                ? screeningData.map((response) => ({
                      ...response,
                      response_type: "screening",
                  }))
                : [];

            setResponses([
                ...mainResponses,
                ...screening,
            ]);
        } catch (err) {
            console.error(
                "Failed to load responses:",
                err
            );

            setError(
                err.message ||
                    "Unable to load survey responses."
            );
        } finally {
            setIsLoading(false);
        }
    }, [survey.id]);

    /*
     * ==============================
     * LOAD ON SURVEY CHANGE
     * ==============================
     */

    useEffect(() => {
        queueMicrotask(loadResponses);
    }, [loadResponses]);

    /*
     * ==============================
     * SEPARATE RESPONSES
     * ==============================
     */

    const surveyResponses = responses.filter(
        (response) =>
            response.response_type === "survey"
    );

    const screeningResponses = responses.filter(
        (response) =>
            response.response_type === "screening"
    );

    /*
     * ==============================
     * GROUP MAIN SURVEY RESPONSES
     * ==============================
     */

    const groupedSubmissions =
        surveyResponses.reduce(
            (groups, response) => {
                let submissionId =
                    response.submission_id;

                /*
                 * Fallback for old responses
                 */

                if (!submissionId) {
                    submissionId =
                        "old-" +
                        (
                            response.respondent_id ||
                            response.respondent_name ||
                            response.id
                        );
                }

                if (!groups[submissionId]) {
                    groups[submissionId] = {
                        submission_id:
                            response.submission_id ||
                            null,

                        respondent_name:
                            response.respondent_name ||
                            "Anonymous",

                        respondent_id:
                            response.respondent_id ||
                            "—",

                        created_at:
                            response.created_at,

                        answers: [],

                        screeningAnswers: [],

                        screeningEligible:
                            null,
                    };
                }

                groups[submissionId].answers.push(
                    response
                );

                return groups;
            },
            {}
        );

    /*
     * ==============================
     * ATTACH SCREENING RESPONSES
     * ==============================
     */

    screeningResponses.forEach((response) => {
        const respondentKey =
            response.respondent_id ||
            response.respondent_name;

        /*
         * Find matching submission.
         *
         * First try respondent ID/email.
         */

        const matchingSubmission =
            submissionsForMatching(
                Object.values(groupedSubmissions),
                respondentKey
            );

        if (matchingSubmission) {
            matchingSubmission.screeningAnswers.push(
                response
            );

            matchingSubmission.screeningEligible =
                response.eligible;
            return;
        }

        const attemptId =
            `screening-${response.screening_attempt_id || respondentKey || response.id}`;

        if (!groupedSubmissions[attemptId]) {
            groupedSubmissions[attemptId] = {
                submission_id: null,
                respondent_name: response.respondent_name || "Anonymous",
                respondent_id: response.respondent_id || "—",
                created_at: response.created_at,
                answers: [],
                screeningAnswers: [],
                screeningEligible: response.eligible,
            };
        }

        groupedSubmissions[attemptId].screeningAnswers.push(response);
    });

    /*
     * ==============================
     * SUBMISSIONS
     * ==============================
     */

    const submissions = Object.values(
        groupedSubmissions
    );

    /*
     * ==============================
     * SCREENING ANALYTICS
     * ==============================
     */

    const screeningAttempts = new Map();

    screeningResponses.forEach((response) => {
        const respondentKey =
            response.respondent_id ||
            response.respondent_name ||
            response.id;

        if (!screeningAttempts.has(respondentKey)) {
            screeningAttempts.set(
                respondentKey,
                response
            );
        }
    });

    const uniqueScreeningAttempts =
        Array.from(
            screeningAttempts.values()
        );

    const eligibleCount = Object.values(groupedSubmissions).filter(
        (submission) => submission.answers.length > 0
    ).length;

    const disqualifiedCount =
        uniqueScreeningAttempts.filter(
            (response) =>
                response.eligible === false
        ).length;

    /*
     * ==============================
     * MAIN ANALYTICS
     * ==============================
     */

    const totalSubmissions =
        submissions.length;

    /*
     * ==============================
     * RENDER
     * ==============================
     */

    return (
        <div className="survey-responses-overlay">

            <div className="survey-responses-modal">

                {/* ================= HEADER ================= */}

                <div className="survey-responses-header">

                    <div>
                        <h2>{survey.title}</h2>

                        <p>
                            Responses from survey
                            participants
                        </p>
                    </div>

                    <button
                        className="survey-responses-close"
                        onClick={onClose}
                        type="button"
                    >
                        ×
                    </button>

                </div>

                {/* ================= LOADING ================= */}

                {isLoading && (
                    <div className="responses-state">
                        Loading responses...
                    </div>
                )}

                {/* ================= ERROR ================= */}

                {error && (
                    <div className="responses-error">
                        {error}
                    </div>
                )}

                {/* ================= ANALYTICS ================= */}

                {!isLoading && !error && (
                    <div className="response-stats">

                        <div className="response-stat-card">

                            <span className="stat-value">
                                {totalSubmissions}
                            </span>

                            <span className="stat-label">
                                Total Respondents
                            </span>

                        </div>

                        <div className="response-stat-card">

                            <span className="stat-value">
                                {eligibleCount}
                            </span>

                            <span className="stat-label">
                                Eligible Respondents
                            </span>

                        </div>

                        <div className="response-stat-card">

                            <span className="stat-value">
                                {disqualifiedCount}
                            </span>

                            <span className="stat-label">
                                Disqualified
                            </span>

                        </div>

                    </div>
                )}

                {/* ================= NO RESPONSES ================= */}

                {!isLoading &&
                    !error &&
                    responses.length === 0 && (
                        <div className="responses-state">

                            <div className="empty-response-icon">
                                📋
                            </div>

                            <h3>
                                No Responses Yet
                            </h3>

                            <p>
                                Responses will appear
                                here when participants
                                complete the survey.
                            </p>

                        </div>
                    )}

                {/* ================= SUBMISSIONS ================= */}

                {!isLoading &&
                    !error &&
                    submissions.length > 0 && (
                        <div className="submission-list">

                            {submissions.map(
                                (
                                    submission,
                                    submissionIndex
                                ) => (
                                    <div
                                        className="submission-card"
                                        key={
                                            submission
                                                .submission_id ||
                                            submissionIndex
                                        }
                                    >

                                        {/* ================= SUBMISSION HEADER ================= */}

                                        <div className="submission-header">

                                            <div>

                                                <h3>
                                                    Submission #
                                                    {submissionIndex +
                                                        1}
                                                </h3>

                                                <p>
                                                    {
                                                        submission.respondent_name
                                                    }
                                                </p>

                                            </div>

                                            <div className="submission-date">

                                                {submission.created_at
                                                    ? new Date(
                                                          submission.created_at
                                                      ).toLocaleString()
                                                    : "—"}

                                            </div>

                                        </div>

                                        {/* ================= RESPONDENT DETAILS ================= */}

                                        <div className="submission-details">

                                            <div>
                                                <strong>
                                                    Respondent:
                                                </strong>{" "}
                                                {
                                                    submission.respondent_name
                                                }
                                            </div>

                                            <div>
                                                <strong>
                                                    Email / ID:
                                                </strong>{" "}
                                                {
                                                    submission.respondent_id
                                                }
                                            </div>

                                        </div>

                                        {/* ================= SCREENING RESULT ================= */}

                                        {submission.screeningEligible !==
                                            null && (
                                            <div className="screening-result">

                                                <strong>
                                                    Screening Result:
                                                </strong>{" "}

                                                {submission.screeningEligible ===
                                                true ? (
                                                    <span className="eligible-result">
                                                        ✓ Eligible
                                                    </span>
                                                ) : (
                                                    <span className="disqualified-result">
                                                        ✕ Disqualified
                                                    </span>
                                                )}

                                            </div>
                                        )}

                                        {/* ================= SCREENING ANSWERS ================= */}

                                        {submission.screeningAnswers
                                            .length > 0 && (
                                            <div className="screening-section">

                                                <h4>
                                                    Screening Answers
                                                </h4>

                                                {submission.screeningAnswers.map(
                                                    (
                                                        response,
                                                        index
                                                    ) => (
                                                        <div
                                                            className="submission-answer"
                                                            key={
                                                                response.id ||
                                                                index
                                                            }
                                                        >

                                                            <div className="answer-question">

                                                                Q
                                                                {index +
                                                                    1}
                                                                .{" "}

                                                                {
                                                                    response.question_text
                                                                }

                                                            </div>

                                                            <div className="answer-value">

                                                                {typeof response.answer ===
                                                                "object"
                                                                    ? JSON.stringify(
                                                                          response.answer
                                                                      )
                                                                    : response.answer ||
                                                                      "—"}

                                                            </div>

                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        )}

                                        {/* ================= MAIN SURVEY ================= */}

                                        <div className="survey-section">

                                            <h4>
                                                Main Survey Answers
                                            </h4>

                                            <div className="submission-answers">

                                                {submission.answers.map(
                                                    (
                                                        response,
                                                        answerIndex
                                                    ) => (
                                                        <div
                                                            className="submission-answer"
                                                            key={
                                                                response.id ||
                                                                answerIndex
                                                            }
                                                        >

                                                            <div className="answer-question">

                                                                Q
                                                                {answerIndex +
                                                                    1}
                                                                .{" "}

                                                                {
                                                                    response.question_text
                                                                }

                                                            </div>

                                                            <div className="answer-value">

                                                                {typeof response.answer ===
                                                                "object"
                                                                    ? JSON.stringify(
                                                                          response.answer
                                                                      )
                                                                    : response.answer ||
                                                                      "—"}

                                                            </div>

                                                        </div>
                                                    )
                                                )}

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                {/* ================= FOOTER ================= */}

                <div className="survey-responses-footer">

                    <span className="response-count">

                        {totalSubmissions}{" "}

                        {totalSubmissions === 1
                            ? "Respondent"
                            : "Respondents"}

                    </span>

                    <button
                        className="responses-refresh-btn"
                        onClick={loadResponses}
                        type="button"
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="responses-close-btn"
                        onClick={onClose}
                        type="button"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
}

/*
 * ==============================
 * MATCH SCREENING TO SUBMISSION
 * ==============================
 */

function submissionsForMatching(
    submissions,
    respondentKey
) {
    if (!respondentKey) {
        return null;
    }

    return (
        submissions.find(
            (submission) =>
                submission.respondent_id ===
                respondentKey
        ) ||
        submissions.find(
            (submission) =>
                submission.respondent_name ===
                respondentKey
        ) ||
        null
    );
}

export default SurveyResponses;