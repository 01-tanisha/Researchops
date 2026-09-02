import { useEffect, useState } from "react";
import { getSurveyResponses } from "../../services/api/surveyApi";
import "./AdminResponses.css";

const getAnswerValue = (answer) => {
    if (answer && typeof answer === "object" && !Array.isArray(answer)) {
        return answer.value ?? "No answer";
    }

    return answer ?? "No answer";
};

function AdminResponses({ survey, onClose }) {
    const [responses, setResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!survey) {
            return;
        }

        const fetchResponses = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await getSurveyResponses(survey.id);
                setResponses(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                console.error("Error fetching responses:", fetchError);
                setError("Unable to load survey responses.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchResponses();
    }, [survey]);

    if (!survey) {
        return null;
    }

    const answeredQuestions = new Set(
        responses.map((response) => response.question)
    ).size;

    const answerCounts = responses.reduce(
        (counts, response) => {
            const answer = getAnswerValue(response.answer);
            const values = Array.isArray(answer) ? answer : [answer];

            values.forEach((value) => {
                const label = String(value ?? "No answer");
                counts[label] = (counts[label] || 0) + 1;
            });

            return counts;
        },
        {}
    );

    return (
        <div className="admin-responses">
            <div className="survey-responses-header">
                <div>
                    <h2>Survey Responses</h2>
                    <p>{survey.title}</p>
                </div>

                <button
                    type="button"
                    className="responses-close-btn"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            <div className="responses-summary">
                <div className="response-summary-card">
                    <span>Total Answers</span>
                    <strong>{responses.length}</strong>
                </div>

                <div className="response-summary-card">
                    <span>Questions Answered</span>
                    <strong>{answeredQuestions}</strong>
                </div>
            </div>

            {isLoading && (
                <div className="responses-message">
                    <p>Loading responses...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="responses-message responses-error">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && responses.length === 0 && (
                <div className="responses-message">
                    <h3>No responses yet</h3>
                    <p>No one has submitted this survey yet.</p>
                </div>
            )}

            {!isLoading && !error && responses.length > 0 && (
                <div className="responses-list">
                    {responses.map((response, index) => (
                        <div className="response-card" key={response.id}>
                            <div className="response-card-header">
                                <div>
                                    <span className="response-number">
                                        Answer {index + 1}
                                    </span>
                                    <h3>
                                        {response.question_text ||
                                            "Survey question"}
                                    </h3>

                                    <p>
                                        {response.respondent_name ||
                                            "Anonymous"}
                                        {response.respondent_id
                                            ? ` (ID: ${response.respondent_id})`
                                            : ""}
                                    </p>
                                </div>

                                <span className="response-date">
                                    {response.created_at
                                        ? new Date(
                                              response.created_at
                                          ).toLocaleString()
                                        : ""}
                                </span>
                            </div>

                            <div className="response-answers">
                                <div className="response-answer">
                                    <div className="answer-question">
                                        <span>Answer</span>
                                    </div>
                                    <div className="answer-value">
                                        {Array.isArray(getAnswerValue(response.answer))
                                            ? getAnswerValue(response.answer).join(", ")
                                            : String(getAnswerValue(response.answer))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && !error && responses.length > 0 && (
                <div className="responses-list">
                    <div className="response-card">
                        <div className="response-card-header">
                            <div>
                                <span className="response-number">
                                    Analytics
                                </span>
                                <h3>Answer distribution</h3>
                            </div>
                        </div>

                        <div className="response-answers">
                            {Object.entries(answerCounts).map(
                                ([answer, count]) => (
                                    <div
                                        className="response-answer"
                                        key={answer}
                                    >
                                        <div className="answer-question">
                                            <strong>{answer}</strong>
                                        </div>
                                        <div className="answer-value">
                                            {count} answer
                                            {count === 1 ? "" : "s"}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="responses-footer">
                <button
                    type="button"
                    className="responses-close-footer-btn"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default AdminResponses;
