const SURVEY_API_URL = "http://127.0.0.1:8000/api/surveys/";
const API_BASE = "http://127.0.0.1:8000";

export async function getSurveys() {

    const response = await fetch(SURVEY_API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch surveys.");
    }

    return await response.json();
}

export async function getSurvey(id) {
    const response = await fetch(
        `${SURVEY_API_URL}${id}/`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch survey.");
    }

    return response.json();
}


export async function createSurvey(surveyData) {

    const response = await fetch(SURVEY_API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(surveyData),

    });

    if (!response.ok) {
        throw new Error("Failed to create survey.");
    }

    return await response.json();
}


export async function updateSurvey(id, surveyData) {

    const response = await fetch(
        `${SURVEY_API_URL}${id}/`,
        {

            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(surveyData),

        }
    );

    if (!response.ok) {
        throw new Error("Failed to update survey.");
    }

    return await response.json();
}


export async function deleteSurvey(id) {

    const response = await fetch(
        `${SURVEY_API_URL}${id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete survey.");
    }

    return await response.json();
}

export async function getSurveyQuestions(surveyId) {
    const response = await fetch(
        `${API_BASE}/api/surveys/${surveyId}/questions/`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch survey questions.");
    }

    return response.json();
}


export async function createSurveyQuestion(
    surveyId,
    questionData
) {
    const response = await fetch(
        `${API_BASE}/api/surveys/${surveyId}/questions/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(questionData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to create question."
        );
    }

    return data;
}


export const updateSurveyQuestion = async (
    questionId,
    questionData
) => {
    const response = await fetch(
        `${API_BASE}/api/surveys/questions/${questionId}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(questionData),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
            errorData.error || "Failed to update question"
        );
    }

    return response.json();
};


export const deleteSurveyQuestion = async (questionId) => {
    const response = await fetch(
        `${API_BASE}/api/surveys/questions/${questionId}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
            errorData.error || "Failed to delete question"
        );
    }

    return response.json();
};

export const submitSurveyResponse = async (
    surveyId,
    responseData
) => {
    const response = await fetch(
        `${API_BASE}/api/surveys/${surveyId}/responses/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(responseData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to submit survey responses."
        );
    }

    return data;
};


export const getSurveyResponses = async (
    surveyId
) => {
    const response = await fetch(
        `${API_BASE}/api/surveys/${surveyId}/responses/`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch survey responses."
        );
    }

    return response.json();
};

export const getScreeningResponses = async (surveyId) => {
    const response = await fetch(
        `${API_BASE}/api/surveys/${surveyId}/screening-responses/`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch screening responses.");
    }

    return response.json();
};
export const getScreeningQuestions = async (surveyId) => {
    const response = await fetch(
        `${API_BASE}/api/surveys/${surveyId}/screening-questions/`
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
            errorData.error || "Failed to fetch screening questions."
        );
    }

    return response.json();
};


export const createScreeningQuestion = async (
    surveyId,
    questionData
) => {
    const response = await fetch(
        `${API_BASE}/api/surveys/${surveyId}/screening-questions/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(questionData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to create screening question."
        );
    }

    return data;
};

export const getPublicSurvey = async (publicToken) => {
    const response = await fetch(
        `${API_BASE}/api/public/surveys/${publicToken}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to load public survey."
        );
    }

    return data;
};

export const submitScreeningAnswers = async (
    publicToken,
    answers,
    respondentName = "",
    respondentId = ""
) => {
    const response = await fetch(
        `${API_BASE}/api/public/surveys/${publicToken}/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                answers,
                respondent_name: respondentName,
                respondent_id: respondentId,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to submit screening answers."
        );
    }

    return data;
};