import { useEffect, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import SurveyTableRow from "../components/surveys/SurveyTableRow";
import SurveyForm from "../components/surveys/SurveyForm";
import SurveyResponses from "../components/surveys/SurveyResponse";
import { useNavigate } from "react-router-dom";

import { getSurveyAnalytics, getSurveys } from "../services/api/surveyApi";

import "./Surveys.css";

function Surveys() {
    const navigate = useNavigate();
    const [surveys, setSurveys] = useState([]);
    const [analyticsBySurvey, setAnalyticsBySurvey] = useState({});

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [showSurveyForm, setShowSurveyForm] = useState(false);
    const [responsesSurvey, setResponsesSurvey] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // --------------------------------------------------
    // Refresh Surveys
    // --------------------------------------------------

    const handleRefresh = () => {
        setRefetchTrigger((previous) => previous + 1);
    };

    // --------------------------------------------------
    // Fetch Surveys
    // --------------------------------------------------

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await getSurveys();
                const safeSurveys = Array.isArray(data) ? data : [];

                setSurveys(safeSurveys);
                const analyticsResults = await Promise.allSettled(
                    safeSurveys.map((survey) => getSurveyAnalytics(survey.id))
                );
                setAnalyticsBySurvey(
                    Object.fromEntries(
                        analyticsResults.flatMap((result, index) =>
                            result.status === "fulfilled"
                                ? [[safeSurveys[index].id, result.value]]
                                : []
                        )
                    )
                );
            } catch (error) {
                console.error(
                    "Error fetching surveys:",
                    error
                );

                setError(
                    error.message ||
                        "Unable to load surveys."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchSurveys();
    }, [refetchTrigger]);

    // --------------------------------------------------
    // Survey Created
    // --------------------------------------------------

    const handleSurveyCreated = async (newSurvey) => {
        setSurveys((previousSurveys) => [
            newSurvey,
            ...previousSurveys,
        ]);
        try {
            const analytics = await getSurveyAnalytics(newSurvey.id);
            setAnalyticsBySurvey((current) => ({ ...current, [newSurvey.id]: analytics }));
        } catch (analyticsError) {
            console.error("Unable to load new survey analytics:", analyticsError);
        }

        setShowSurveyForm(false);
    };

    // --------------------------------------------------
    // Survey Updated
    // --------------------------------------------------

    const handleSurveyUpdated = (updatedSurvey) => {
        if (!updatedSurvey?.id) return;

        setSurveys((previousSurveys) =>
            previousSurveys.map((survey) =>
                survey.id === updatedSurvey.id
                    ? {
                          ...survey,
                          ...updatedSurvey,
                      }
                    : survey
            )
        );
    };

    // --------------------------------------------------
    // Survey Deleted
    // --------------------------------------------------

    const handleSurveyDeleted = (surveyId) => {
        setSurveys((previousSurveys) =>
            previousSurveys.filter(
                (survey) =>
                    survey.id !== surveyId
            )
        );

        setAnalyticsBySurvey((current) => {
            const next = { ...current };
            delete next[surveyId];
            return next;
        });

    };

    // --------------------------------------------------
    // Survey Statistics
    // --------------------------------------------------

    const totalSurveys = surveys.length;

    const activeSurveys = surveys.filter(
        (survey) =>
            survey.status === "Active"
    ).length;

    const completedSurveys = surveys.filter(
        (survey) =>
            survey.status === "Completed"
    ).length;

    // --------------------------------------------------
    // Filter Surveys
    // --------------------------------------------------

    const filteredSurveys = surveys.filter(
        (survey) => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const title =
                survey.title
                    ?.toLowerCase() || "";

            const client =
                (survey.client_name || survey.client)
                    ?.toLowerCase() || "";

            const project = survey.project_title?.toLowerCase() || "";

            const status =
                survey.status || "";

            const matchesSearch =
                title.includes(search) ||
                client.includes(search) ||
                project.includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        }
    );

    // --------------------------------------------------
    // Clear Filters
    // --------------------------------------------------

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
    };

    return (
        <DashboardLayout>

            <div className="surveys-page">

                {/* ------------------------------------ */}
                {/* Page Header */}
                {/* ------------------------------------ */}

                <div className="surveys-page-header">

                    <div>
                        <h1>Surveys</h1>

                        <p>
                            Manage your research
                            surveys and questions.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-survey-btn"
                        onClick={() =>
                            setShowSurveyForm(true)
                        }
                    >
                        + Create Survey
                    </button>

                </div>

                {/* ------------------------------------ */}
                {/* Survey Statistics */}
                {/* ------------------------------------ */}

                {!isLoading &&
                    !error && (
                        <div className="survey-stats">

                            <div className="survey-stat-card">

                                <div className="survey-stat-icon">
                                    📋
                                </div>

                                <div className="survey-stat-content">
                                    <span>
                                        Total Surveys
                                    </span>

                                    <h2>
                                        {totalSurveys}
                                    </h2>
                                </div>

                            </div>

                            <div className="survey-stat-card">

                                <div className="survey-stat-icon">
                                    ●
                                </div>

                                <div className="survey-stat-content">
                                    <span>
                                        Active Surveys
                                    </span>

                                    <h2>
                                        {activeSurveys}
                                    </h2>
                                </div>

                            </div>

                            <div className="survey-stat-card">

                                <div className="survey-stat-icon">
                                    ✓
                                </div>

                                <div className="survey-stat-content">
                                    <span>
                                        Completed Surveys
                                    </span>

                                    <h2>
                                        {completedSurveys}
                                    </h2>
                                </div>

                            </div>

                        </div>
                    )}

                {/* ------------------------------------ */}
                {/* Error */}
                {/* ------------------------------------ */}

                {error && (
                    <div className="surveys-error">

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={handleRefresh}
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* ------------------------------------ */}
                {/* Filters */}
                {/* ------------------------------------ */}

                <div className="survey-filters">

                    <input
                        type="text"
                        placeholder="Search surveys, clients, or projects..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Active">
                            Active
                        </option>

                        <option value="Paused">
                            Paused
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Billed">
                            Billed
                        </option>

                        <option value="Draft">
                            Draft
                        </option>

                        <option value="Quota Full">
                            Quota Full
                        </option>
                    </select>

                    {(searchTerm ||
                        statusFilter !== "All") && (
                        <button
                            type="button"
                            className="clear-filter-btn"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>
                    )}

                </div>

                {/* ------------------------------------ */}
                {/* Survey Count */}
                {/* ------------------------------------ */}

                {!isLoading &&
                    !error && (
                        <div className="survey-count">

                            Showing{" "}

                            <strong>
                                {filteredSurveys.length}
                            </strong>

                            {" "}of{" "}

                            <strong>
                                {surveys.length}
                            </strong>

                            {" "}surveys

                        </div>
                    )}

                {/* ------------------------------------ */}
                {/* Loading */}
                {/* ------------------------------------ */}

                {isLoading && (
                    <div className="surveys-loading">
                        <p>
                            Loading surveys...
                        </p>
                    </div>
                )}

                {/* ------------------------------------ */}
                {/* No Surveys */}
                {/* ------------------------------------ */}

                {!isLoading &&
                    !error &&
                    surveys.length === 0 && (
                        <div className="surveys-empty">

                            <h3>
                                No surveys yet
                            </h3>

                            <p>
                                Create your first
                                survey to get started.
                            </p>

                        </div>
                    )}

                {/* ------------------------------------ */}
                {/* No Search Results */}
                {/* ------------------------------------ */}

                {!isLoading &&
                    !error &&
                    surveys.length > 0 &&
                    filteredSurveys.length === 0 && (
                        <div className="surveys-empty">

                            <h3>
                                No surveys found
                            </h3>

                            <p>
                                Try changing your
                                search or filter.
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>

                        </div>
                    )}

                {/* ------------------------------------ */}
                {/* Survey List */}
                {/* ------------------------------------ */}

                {!isLoading &&
                    !error &&
                    filteredSurveys.length > 0 && (
                        <div className="surveys-table-wrap">
                            <table className="surveys-table">
                                <thead>
                                    <tr>
                                        <th>Survey</th>
                                        <th>Client</th>
                                        <th>Project</th>
                                        <th>Project Manager</th>
                                        <th>Target LOI</th>
                                        <th>Measured LOI</th>
                                        <th>Target IR</th>
                                        <th>Measured IR</th>
                                        <th>Completes</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSurveys.map((survey) => (
                                        <SurveyTableRow
                                            key={survey.id}
                                            survey={survey}
                                            analytics={analyticsBySurvey[survey.id]}
                                            onView={() => navigate(`/surveys/${survey.id}`)}
                                            onViewResponses={() => setResponsesSurvey(survey)}
                                            onSurveyUpdated={handleSurveyUpdated}
                                            onSurveyDeleted={handleSurveyDeleted}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

            </div>

            {/* ---------------------------------------- */}
            {/* Create Survey Modal */}
            {/* ---------------------------------------- */}

            {showSurveyForm && (
                <div className="survey-modal-overlay">

                    <div className="survey-modal">

                        <SurveyForm
                            onClose={() =>
                                setShowSurveyForm(
                                    false
                                )
                            }

                            onSurveyCreated={
                                handleSurveyCreated
                            }
                        />

                    </div>

                </div>
            )}

            {responsesSurvey && (
                <SurveyResponses
                    survey={responsesSurvey}
                    onClose={() => setResponsesSurvey(null)}
                />
            )}

        </DashboardLayout>
    );
}

export default Surveys;