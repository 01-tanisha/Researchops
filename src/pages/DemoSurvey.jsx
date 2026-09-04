import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TakeSurvey from "../components/surveys/TakeSurvey";

function DemoSurvey() {
    const { surveyId } = useParams();
    const [survey, setSurvey] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSurvey = async () => {
            try {
                const response = await fetch(
                    `/api/surveys/${surveyId}/`
                );

                if (!response.ok) {
                    throw new Error("Survey not found.");
                }

                setSurvey(await response.json());
            } catch (loadError) {
                setError(loadError.message || "Unable to load survey.");
            }
        };

        loadSurvey();
    }, [surveyId]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!survey) {
        return <p>Loading survey...</p>;
    }

    return (
        <TakeSurvey
            survey={survey}
            onClose={() => window.close()}
        />
    );
}

export default DemoSurvey;