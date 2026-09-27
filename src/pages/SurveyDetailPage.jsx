import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import SurveyDetails from "../components/surveys/SurveyDetails";
import { getSurvey } from "../services/api/surveyApi";
import "./SurveyDetailPage.css";

function SurveyDetailPage() {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        getSurvey(surveyId)
            .then((data) => {
                if (active) setSurvey(data);
            })
            .catch((loadError) => {
                if (active) setError(loadError.message || "Unable to load survey details.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [surveyId]);

    return (
        <DashboardLayout>
            <main className="survey-detail-page">
                <div className="survey-detail-page-heading">
                    <Link to="/surveys">← Back to surveys</Link>
                    {survey && <span>{survey.title}</span>}
                </div>

                {loading ? (
                    <p className="survey-detail-page-state">Loading survey details...</p>
                ) : error ? (
                    <div className="survey-detail-page-error">
                        <p>{error}</p>
                        <button type="button" onClick={() => navigate("/surveys")}>Return to surveys</button>
                    </div>
                ) : survey ? (
                    <SurveyDetails
                        survey={survey}
                        onSurveyUpdated={(updatedSurvey) =>
                            setSurvey((current) => ({ ...current, ...updatedSurvey }))
                        }
                        onClose={() => navigate("/surveys")}
                    />
                ) : null}
            </main>
        </DashboardLayout>
    );
}

export default SurveyDetailPage;