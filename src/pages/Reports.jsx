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
    getVendors,
} from "../services/api/projectApi";

import {
    getSurveys,
    getSurveyAnalytics,
    getSurveyBilling,
} from "../services/api/surveyApi";

import "./Reports.css";

function Reports() {
    const [projects, setProjects] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [surveyAnalytics, setSurveyAnalytics] = useState([]);
    const [surveyBilling, setSurveyBilling] = useState([]);

    const [selectedSurvey, setSelectedSurvey] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const CHART_COLORS = [
        "#1B2944",
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
    ];

    // =========================
    // LOAD REPORT DATA
    // =========================

    useEffect(() => {
        async function loadReports() {
            try {
                setLoading(true);
                setError("");

                const [
                    projectsData,
                    surveysData,
                    vendorsData,
                ] = await Promise.all([
                    getProjects(),
                    getSurveys(),
                    getVendors(),
                ]);

                const safeProjects = Array.isArray(projectsData)
                    ? projectsData
                    : [];

                const safeSurveys = Array.isArray(surveysData)
                    ? surveysData
                    : [];

                const safeVendors = Array.isArray(vendorsData)
                    ? vendorsData
                    : [];

                setProjects(safeProjects);
                setSurveys(safeSurveys);
                setVendors(safeVendors);

                const analyticsResults = await Promise.allSettled(
                    safeSurveys.map((survey) =>
                        getSurveyAnalytics(survey.id)
                    )
                );

                setSurveyAnalytics(
                    analyticsResults
                        .filter(
                            (result) =>
                                result.status === "fulfilled"
                        )
                        .map((result) => result.value)
                );

                const billingResults = await Promise.allSettled(
                    safeSurveys.map((survey) =>
                        getSurveyBilling(survey.id)
                    )
                );

                setSurveyBilling(
                    billingResults
                        .filter(
                            (result) =>
                                result.status === "fulfilled"
                        )
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
    // PROJECT BUDGET
    // =========================

    const totalBudget = projects.reduce(
        (total, project) =>
            total + Number(project.budget || 0),
        0
    );

    // =========================
    // FILTERED SURVEYS
    // =========================

    const filteredSurveys = surveys.filter((survey) => {
        const surveyMatch =
            selectedSurvey === "All" ||
            String(survey.id) === String(selectedSurvey);

        const statusMatch =
            selectedStatus === "All" ||
            survey.status === selectedStatus;

        return surveyMatch && statusMatch;
    });

    const filteredSurveyIds = new Set(
        filteredSurveys.map((survey) => survey.id)
    );

    const filteredSurveyBilling =
        surveyBilling.filter((billing) =>
            filteredSurveyIds.has(billing.survey_id)
        );

    const filteredSurveyAnalytics =
        surveyAnalytics.filter((analytics) =>
            filteredSurveyIds.has(analytics.survey_id)
        );

    // =========================
    // FILTERED FINANCIAL TOTALS
    // =========================

    const totalClientRevenue =
        filteredSurveyBilling.reduce(
            (total, billing) =>
                total +
                Number(billing.client_revenue || 0),
            0
        );

    const totalVendorCost =
        filteredSurveyBilling.reduce(
            (total, billing) =>
                total +
                Number(billing.vendor_cost || 0),
            0
        );

    const totalProfit =
        filteredSurveyBilling.reduce(
            (total, billing) =>
                total +
                Number(billing.profit || 0),
            0
        );

    const totalValidCompletes =
        filteredSurveyBilling.reduce(
            (total, billing) =>
                total +
                Number(billing.valid_completes || 0),
            0
        );

    // =========================
    // VENDOR FINANCIAL ANALYSIS
    // =========================

    const vendorFinancialData = {};

    filteredSurveyBilling.forEach((billing) => {
        (billing.vendor_breakdown || []).forEach(
            (vendor) => {
                const vendorName =
                    vendor.vendor_name ||
                    "Unknown Vendor";

                if (!vendorFinancialData[vendorName]) {
                    vendorFinancialData[vendorName] = {
                        vendor: vendorName,
                        validCompletes: 0,
                        vendorCost: 0,
                    };
                }

                vendorFinancialData[
                    vendorName
                ].validCompletes += Number(
                    vendor.valid_completes || 0
                );

                vendorFinancialData[
                    vendorName
                ].vendorCost += Number(
                    vendor.vendor_cost || 0
                );
            }
        );
    });

    const vendorFinancialChartData =
        Object.values(vendorFinancialData);

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

    const qualificationData =
        filteredSurveyAnalytics.map(
            (analytics) => {
                const qualified = Number(
                    analytics.qualified_respondents || 0
                );
                const participants = Number(
                    analytics.total_respondents || 0
                );

                return {
                    name: analytics.survey_title,
                    Qualified: qualified,
                    OtherParticipants: Math.max(participants - qualified, 0),
                };
            }
        );

    // =========================
    // CSV EXPORT
    // =========================

    const exportReportCSV = () => {
        const rows = [];

        rows.push([
            "Survey",
            "Required Completes",
            "Valid Completes",
            "Completion %",
            "Client Revenue",
            "Vendor Cost",
            "Profit",
        ]);

        filteredSurveyBilling.forEach((billing) => {
            rows.push([
                billing.survey_title || "",
                billing.required_completes || 0,
                billing.valid_completes || 0,
                `${billing.completion_percentage || 0}%`,
                billing.client_revenue || 0,
                billing.vendor_cost || 0,
                billing.profit || 0,
            ]);
        });

        rows.push([]);

        rows.push([
            "Vendor",
            "Valid Completes",
            "Vendor Cost",
        ]);

        vendorFinancialChartData.forEach((vendor) => {
            rows.push([
                vendor.vendor || "",
                vendor.validCompletes || 0,
                vendor.vendorCost || 0,
            ]);
        });

        const csvContent = rows
            .map((row) =>
                row
                    .map(
                        (value) =>
                            `"${String(value).replace(
                                /"/g,
                                '""'
                            )}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "ResearchOps_Report.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    // =========================
    // RETURN
    // =========================

    return (
        <DashboardLayout>
            <div className="reports-page">

                <h1 className="reports-title">
                    Reports
                </h1>

                {/* REPORT FILTERS */}

                <div className="reports-filters">

                    <div className="report-filter">
                        <label htmlFor="survey-filter">
                            Survey
                        </label>

                        <select
                            id="survey-filter"
                            value={selectedSurvey}
                            onChange={(e) =>
                                setSelectedSurvey(
                                    e.target.value
                                )
                            }
                        >
                            <option value="All">
                                All Surveys
                            </option>

                            {surveys.map(
                                (survey) => (
                                    <option
                                        key={survey.id}
                                        value={survey.id}
                                    >
                                        {survey.title}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="report-filter">
                        <label htmlFor="status-filter">
                            Status
                        </label>

                        <select
                            id="status-filter"
                            value={selectedStatus}
                            onChange={(e) =>
                                setSelectedStatus(
                                    e.target.value
                                )
                            }
                        >
                            <option value="All">
                                All Statuses
                            </option>

                            <option value="Active">
                                Active
                            </option>

                            <option value="Completed">
                                Completed
                            </option>

                            <option value="Paused">
                                Paused
                            </option>

                            <option value="Billed">
                                Billed
                            </option>

                            <option value="Draft">
                                Draft
                            </option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="clear-report-filters"
                        onClick={() => {
                            setSelectedSurvey("All");
                            setSelectedStatus("All");
                        }}
                    >
                        Clear Filters
                    </button>

                </div>

                {/* EXPORT */}

                <div className="reports-actions">
                    <button
                        type="button"
                        onClick={exportReportCSV}
                        disabled={
                            filteredSurveyBilling.length === 0
                        }
                    >
                        Export Report
                    </button>
                </div>

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
                        {/* SUMMARY */}

                        <div className="reports-summary">

                            <div className="report-card">
                                <span>
                                    Total Projects
                                </span>

                                <strong>
                                    {projects.length}
                                </strong>
                            </div>

                            <div className="report-card">
                                <span>
                                    Total Surveys
                                </span>

                                <strong>
                                    {surveys.length}
                                </strong>
                            </div>

                            <div className="report-card">
                                <span>
                                    Total Vendors
                                </span>

                                <strong>
                                    {vendors.length}
                                </strong>
                            </div>

                            <div className="report-card">
                                <span>
                                    Total Budget
                                </span>

                                <strong>
                                    ₹
                                    {totalBudget.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                        {/* FINANCIAL SUMMARY */}

                        <div className="reports-summary">

                            <div className="report-card">
                                <span>
                                    Client Revenue
                                </span>

                                <strong>
                                    ₹
                                    {totalClientRevenue.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                            <div className="report-card">
                                <span>
                                    Vendor Cost
                                </span>

                                <strong>
                                    ₹
                                    {totalVendorCost.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                            <div className="report-card">
                                <span>
                                    Total Profit
                                </span>

                                <strong>
                                    ₹
                                    {totalProfit.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                            <div className="report-card">
                                <span>
                                    Valid Completes
                                </span>

                                <strong>
                                    {totalValidCompletes.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                        {/* PROJECT REPORT */}

                        <div className="report-section">

                            <h2>
                                Project Report
                            </h2>

                            <div className="report-status-grid">

                                <div className="report-status">
                                    <strong>
                                        {activeProjects}
                                    </strong>

                                    <span>
                                        Active
                                    </span>
                                </div>

                                <div className="report-status">
                                    <strong>
                                        {completedProjects}
                                    </strong>

                                    <span>
                                        Completed
                                    </span>
                                </div>

                                <div className="report-status">
                                    <strong>
                                        {pausedProjects}
                                    </strong>

                                    <span>
                                        Paused
                                    </span>
                                </div>

                                <div className="report-status">
                                    <strong>
                                        {billedProjects}
                                    </strong>

                                    <span>
                                        Billed
                                    </span>
                                </div>

                                <div className="report-status">
                                    <strong>
                                        {draftProjects}
                                    </strong>

                                    <span>
                                        Draft
                                    </span>
                                </div>

                            </div>

                        </div>

                        {/* PROJECT STATUS CHART */}

                        <div className="report-section">

                            <h2>
                                Project Status Distribution
                            </h2>

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
                                                data={
                                                    projectStatusData
                                                }
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
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
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

                        {/* SURVEY REPORT */}

                        <div className="report-section">

                            <h2>
                                Survey Report
                            </h2>

                            <div className="report-status-grid">

                                <div className="report-status">
                                    <strong>
                                        {activeSurveys}
                                    </strong>

                                    <span>
                                        Active
                                    </span>
                                </div>

                                <div className="report-status">
                                    <strong>
                                        {completedSurveys}
                                    </strong>

                                    <span>
                                        Completed
                                    </span>
                                </div>

                                <div className="report-status">
                                    <strong>
                                        {pausedSurveys}
                                    </strong>

                                    <span>
                                        Paused
                                    </span>
                                </div>

                                <div className="report-status">
                                    <strong>
                                        {billedSurveys}
                                    </strong>

                                    <span>
                                        Billed
                                    </span>
                                </div>

                                <div className="report-status">
                                    <strong>
                                        {draftSurveys}
                                    </strong>

                                    <span>
                                        Draft
                                    </span>
                                </div>

                            </div>

                        </div>

                        {/* SURVEY STATUS CHART */}

                        <div className="report-section">

                            <h2>
                                Survey Status Distribution
                            </h2>

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
                                                data={
                                                    surveyStatusData
                                                }
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
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
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

                        {/* SURVEY ANALYTICS */}

                        <div className="report-section">

                            <h2>
                                Survey Analytics
                            </h2>

                            {filteredSurveyAnalytics.length === 0 ? (
                                <p>
                                    No survey analytics available.
                                </p>
                            ) : (
                                <div className="survey-analytics-grid">

                                    {filteredSurveyAnalytics.map(
                                        (analytics) => (
                                            <div
                                                className="survey-analytics-card"
                                                key={
                                                    analytics.survey_id
                                                }
                                            >

                                                <h3>
                                                    {
                                                        analytics.survey_title
                                                    }
                                                </h3>

                                                <div className="analytics-row">
                                                    <span>
                                                        Completed
                                                        Submissions
                                                    </span>

                                                    <strong>
                                                        {
                                                            analytics.total_responses
                                                        }
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>
                                                        Participants
                                                    </span>

                                                    <strong>
                                                        {
                                                            analytics.total_respondents
                                                        }
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>
                                                        Qualified Completes
                                                    </span>

                                                    <strong>
                                                        {
                                                            analytics.qualified_respondents
                                                        }
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>
                                                        Disqualified
                                                    </span>

                                                    <strong>
                                                        {
                                                            analytics.disqualified_responses
                                                        }
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>
                                                        Incidence Rate
                                                    </span>

                                                    <strong>
                                                        {
                                                            analytics.incidence_rate
                                                        }%
                                                    </strong>
                                                </div>

                                                <div className="analytics-row">
                                                    <span>Measured LOI</span>
                                                    <strong>
                                                        {analytics.loi != null
                                                            ? `${analytics.loi} min`
                                                            : "—"}
                                                    </strong>
                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                        </div>

                        {/* QUALIFICATION CHART */}

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
                                            data={
                                                qualificationData
                                            }
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
                                                radius={[
                                                    4,
                                                    4,
                                                    0,
                                                    0,
                                                ]}
                                            />

                                            <Bar
                                                dataKey="OtherParticipants"
                                                name="Other participants"
                                                fill="#F9B233"
                                                radius={[
                                                    4,
                                                    4,
                                                    0,
                                                    0,
                                                ]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>
                        )}

                        {/* SURVEY FINANCIAL REPORT */}

                        <div className="report-section">

                            <h2>
                                Survey Financial Report
                            </h2>

                            {filteredSurveyBilling.length === 0 ? (
                                <p>
                                    No financial data available.
                                </p>
                            ) : (
                                <div className="financial-report-table-wrapper">

                                    <table className="financial-report-table">

                                        <thead>
                                            <tr>
                                                <th>
                                                    Survey
                                                </th>

                                                <th>
                                                    Required
                                                </th>

                                                <th>
                                                    Valid
                                                </th>

                                                <th>
                                                    Completion
                                                </th>

                                                <th>
                                                    Client Revenue
                                                </th>

                                                <th>
                                                    Vendor Cost
                                                </th>

                                                <th>
                                                    Profit
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {filteredSurveyBilling.map(
                                                (billing) => (
                                                    <tr
                                                        key={
                                                            billing.survey_id
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                billing.survey_title
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                billing.required_completes
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                billing.valid_completes
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                billing.completion_percentage
                                                            }%
                                                        </td>

                                                        <td>
                                                            ₹
                                                            {Number(
                                                                billing.client_revenue ||
                                                                    0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>

                                                        <td>
                                                            ₹
                                                            {Number(
                                                                billing.vendor_cost ||
                                                                    0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>

                                                        <td>
                                                            ₹
                                                            {Number(
                                                                billing.profit ||
                                                                    0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </div>

                        {/* VENDOR FINANCIAL ANALYSIS */}

                        <div className="report-section">

                            <h2>
                                Vendor Financial Analysis
                            </h2>

                            {vendorFinancialChartData.length === 0 ? (
                                <p>
                                    No vendor financial data available.
                                </p>
                            ) : (
                                <div className="report-chart">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={
                                                vendorFinancialChartData
                                            }
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 60,
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="vendor"
                                                angle={-20}
                                                textAnchor="end"
                                                interval={0}
                                                height={70}
                                            />

                                            <YAxis />

                                            <Tooltip />

                                            <Legend />

                                            <Bar
                                                dataKey="validCompletes"
                                                name="Valid Completes"
                                                fill="#1B2944"
                                                radius={[
                                                    4,
                                                    4,
                                                    0,
                                                    0,
                                                ]}
                                            />

                                            <Bar
                                                dataKey="vendorCost"
                                                name="Vendor Cost"
                                                fill="#F59E0B"
                                                radius={[
                                                    4,
                                                    4,
                                                    0,
                                                    0,
                                                ]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>
                            )}

                        </div>

                        {/* VENDOR FINANCIAL DETAILS */}

                        <div className="report-section">

                            <h2>
                                Vendor Financial Details
                            </h2>

                            {vendorFinancialChartData.length === 0 ? (
                                <p>
                                    No vendor financial data available.
                                </p>
                            ) : (
                                <div className="financial-report-table-wrapper">

                                    <table className="financial-report-table">

                                        <thead>
                                            <tr>
                                                <th>
                                                    Vendor
                                                </th>

                                                <th>
                                                    Valid Completes
                                                </th>

                                                <th>
                                                    Vendor Cost
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {vendorFinancialChartData.map(
                                                (vendor) => (
                                                    <tr
                                                        key={
                                                            vendor.vendor
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                vendor.vendor
                                                            }
                                                        </td>

                                                        <td>
                                                            {vendor.validCompletes.toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>

                                                        <td>
                                                            ₹
                                                            {vendor.vendorCost.toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Reports;