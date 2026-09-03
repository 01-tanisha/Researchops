import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

import DashboardLayout from "../components/layout/DashboardLayout";

import {
    getProjects,
    getUsers,
} from "../services/api/projectApi";

import {
    getSurveys,
    getSurveyAnalytics,
} from "../services/api/surveyApi";

import "./Reports.css";


function Reports() {
    const [projects, setProjects] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [users, setUsers] = useState([]);
    const [surveyAnalytics, setSurveyAnalytics] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const CHART_COLORS = [
        "#1B2944",
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
    ];


    useEffect(() => {
        async function loadReports() {
            try {
                setLoading(true);
                setError("");

                const [
                    projectsData,
                    surveysData,
                    usersData,
                ] = await Promise.all([
                    getProjects(),
                    getSurveys(),
                    getUsers(),
                ]);

                const safeProjects = Array.isArray(projectsData)
                    ? projectsData
                    : [];

                const safeSurveys = Array.isArray(surveysData)
                    ? surveysData
                    : [];

                const safeUsers = Array.isArray(usersData)
                    ? usersData
                    : [];

                setProjects(safeProjects);
                setSurveys(safeSurveys);
                setUsers(safeUsers);

                const analyticsResults = await Promise.allSettled(
                    safeSurveys.map((survey) =>
                        getSurveyAnalytics(survey.id)
                    )
                );

                setSurveyAnalytics(
                    analyticsResults
                        .filter((result) => result.status === "fulfilled")
                        .map((result) => result.value)
                );

            } catch (error) {
                console.error(
                    "Failed to load reports:",
                    error
                );

                setError(
                    "Unable to load report data. Please try again."
                );

            } finally {
                setLoading(false);
            }
        }

        loadReports();
    }, []);


    // =========================
    // PROJECT STATUS
    // =========================

    const activeProjects = projects.filter(
        (project) => project.status === "Active"
    ).length;

    const completedProjects = projects.filter(
        (project) => project.status === "Completed"
    ).length;

    const pausedProjects = projects.filter(
        (project) => project.status === "Paused"
    ).length;

    const billedProjects = projects.filter(
        (project) => project.status === "Billed"
    ).length;

    const draftProjects = projects.filter(
        (project) => project.status === "Draft"
    ).length;


    // =========================
    // SURVEY STATUS
    // =========================

    const activeSurveys = surveys.filter(
        (survey) => survey.status === "Active"
    ).length;

    const completedSurveys = surveys.filter(
        (survey) => survey.status === "Completed"
    ).length;

    const pausedSurveys = surveys.filter(
        (survey) => survey.status === "Paused"
    ).length;

    const billedSurveys = surveys.filter(
        (survey) => survey.status === "Billed"
    ).length;

    const draftSurveys = surveys.filter(
        (survey) => survey.status === "Draft"
    ).length;


    // =========================
    // TOTAL BUDGET
    // =========================

    const totalBudget = projects.reduce(
        (total, project) =>
            total + Number(project.budget || 0),
        0
    );


    // =========================
    // CHART DATA
    // =========================

    const projectStatusData = [
        {
            name: "Active",
            value: activeProjects,
        },
        {
            name: "Completed",
            value: completedProjects,
        },
        {
            name: "Paused",
            value: pausedProjects,
        },
        {
            name: "Billed",
            value: billedProjects,
        },
        {
            name: "Draft",
            value: draftProjects,
        },
    ].filter((item) => item.value > 0);


    const surveyStatusData = [
        {
            name: "Active",
            value: activeSurveys,
        },
        {
            name: "Completed",
            value: completedSurveys,
        },
        {
            name: "Paused",
            value: pausedSurveys,
        },
        {
            name: "Billed",
            value: billedSurveys,
        },
        {
            name: "Draft",
            value: draftSurveys,
        },
    ].filter((item) => item.value > 0);


    const qualificationData = surveyAnalytics.map(
        (analytics) => ({
            name: analytics.survey_title,
            Qualified: Number(
                analytics.qualified_responses || 0
            ),
            Disqualified: Number(
                analytics.disqualified_responses || 0
            ),
        })
    );


    return (
        <DashboardLayout>

            <div className="reports-page">

                <h1 className="reports-title">
                    Reports
                </h1>


                {loading && (
                    <p className="reports-loading">
                        Loading reports...
                    </p>
                )}


                {error && (
                    <p className="reports-error">
                        {error}
                    </p>
                )}


                {!loading && !error && (
                    <>


                        {/* =========================
                            SUMMARY
                        ========================= */}

                        <div className="reports-summary">

                            <div className="report-card">
                                <span>Total Projects</span>

                                <strong>
                                    {projects.length}
                                </strong>
                            </div>


                            <div className="report-card">
                                <span>Total Surveys</span>

                                <strong>
                                    {surveys.length}
                                </strong>
                            </div>


                            <div className="report-card">
                                <span>Total Vendors</span>

                                <strong>
                                    {users.length}
                                </strong>
                            </div>


                            <div className="report-card">
                                <span>Total Budget</span>

                                <strong>
                                    ₹{totalBudget.toLocaleString("en-IN")}
                                </strong>
                            </div>

                        </div>


                        {/* =========================
                            PROJECT REPORT
                        ========================= */}

                        <div className="report-section">

                            <h2>Project Report</h2>

                            <div className="report-status-grid">

                                <div className="report-status">
                                    <strong>{activeProjects}</strong>
                                    <span>Active</span>
                                </div>

                                <div className="report-status">
                                    <strong>{completedProjects}</strong>
                                    <span>Completed</span>
                                </div>

                                <div className="report-status">
                                    <strong>{pausedProjects}</strong>
                                    <span>Paused</span>
                                </div>

                                <div className="report-status">
                                    <strong>{billedProjects}</strong>
                                    <span>Billed</span>
                                </div>

                                <div className="report-status">
                                    <strong>{draftProjects}</strong>
                                    <span>Draft</span>
                                </div>

                            </div>

                        </div>


                        {/* =========================
                            PROJECT STATUS CHART
                        ========================= */}

                        <div className="report-section">

                            <h2>Project Status Distribution</h2>

                            {projectStatusData.length === 0 ? (

                                <p>
                                    No project data available.
                                </p>

                            ) : (

                                <div className="report-chart">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <PieChart>

                                            <Pie
                                                data={projectStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={65}
                                                outerRadius={115}
                                                paddingAngle={3}
                                                label
                                            >

                                                {projectStatusData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`project-cell-${index}`}
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}

                                            </Pie>

                                            <Tooltip />

                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>

                                </div>

                            )}

                        </div>


                        {/* =========================
                            SURVEY REPORT
                        ========================= */}

                        <div className="report-section">

                            <h2>Survey Report</h2>

                            <div className="report-status-grid">

                                <div className="report-status">
                                    <strong>{activeSurveys}</strong>
                                    <span>Active</span>
                                </div>

                                <div className="report-status">
                                    <strong>{completedSurveys}</strong>
                                    <span>Completed</span>
                                </div>

                                <div className="report-status">
                                    <strong>{pausedSurveys}</strong>
                                    <span>Paused</span>
                                </div>

                                <div className="report-status">
                                    <strong>{billedSurveys}</strong>
                                    <span>Billed</span>
                                </div>

                                <div className="report-status">
                                    <strong>{draftSurveys}</strong>
                                    <span>Draft</span>
                                </div>

                            </div>

                        </div>


                        {/* =========================
                            SURVEY STATUS CHART
                        ========================= */}

                        <div className="report-section">

                            <h2>Survey Status Distribution</h2>

                            {surveyStatusData.length === 0 ? (

                                <p>
                                    No survey data available.
                                </p>

                            ) : (

                                <div className="report-chart">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <PieChart>

                                            <Pie
                                                data={surveyStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={65}
                                                outerRadius={115}
                                                paddingAngle={3}
                                                label
                                            >

                                                {surveyStatusData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`survey-cell-${index}`}
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}

                                            </Pie>

                                            <Tooltip />

                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>

                                </div>

                            )}

                        </div>


                        {/* =========================
                            SURVEY ANALYTICS
                        ========================= */}

                        <div className="report-section">

                            <h2>Survey Analytics</h2>

                            {surveyAnalytics.length === 0 ? (

                                <p>
                                    No survey analytics available.
                                </p>

                            ) : (

                                <div className="survey-analytics-grid">

                                    {surveyAnalytics.map(
                                        (analytics) => (

                                            <div
                                                className="survey-analytics-card"
                                                key={analytics.survey_id}
                                            >

                                                <h3>
                                                    {analytics.survey_title}
                                                </h3>

                                                <div className="analytics-row">
                                                    <span>
                                                        Completed Submissions
                                                    </span>

                                                    <strong>
                                                        {analytics.total_responses}
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>
                                                        Screening Attempts
                                                    </span>

                                                    <strong>
                                                        {analytics.total_screening_attempts}
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>
                                                        Qualified
                                                    </span>

                                                    <strong>
                                                        {analytics.qualified_responses}
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>
                                                        Disqualified
                                                    </span>

                                                    <strong>
                                                        {analytics.disqualified_responses}
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>
                                                        Qualification Rate
                                                    </span>

                                                    <strong>
                                                        {analytics.response_rate}%
                                                    </strong>
                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* =========================
                            QUALIFICATION CHART
                        ========================= */}

                        {qualificationData.length > 0 && (

                            <div className="report-section">

                                <h2>
                                    Survey Qualification Analysis
                                </h2>

                                <div className="report-chart">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={qualificationData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 70,
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="name"
                                                angle={-20}
                                                textAnchor="end"
                                                interval={0}
                                                height={70}
                                            />

                                            <YAxis />

                                            <Tooltip />

                                            <Legend />

                                            <Bar
                                                dataKey="Qualified"
                                                name="Qualified"
                                                fill="#1B2944"
                                                radius={[4, 4, 0, 0]}
                                            />

                                            <Bar
                                                dataKey="Disqualified"
                                                name="Disqualified"
                                                fill="#EF4444"
                                                radius={[4, 4, 0, 0]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>

                        )}

                    </>
                )}

            </div>

        </DashboardLayout>
    );
}


export default Reports;