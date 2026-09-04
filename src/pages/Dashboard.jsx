import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import RecentProjects from "../components/dashboard/RecentProjects";
import ActivityPanel from "../components/dashboard/ActivityPanel";
import Users from "../components/dashboard/Users";
import "./Dashboard.css";

import {
  getProjectActivity,
  getProjects,
  getVendors,
} from "../services/api/projectApi";

import { getSurveys } from "../services/api/surveyApi";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [projectCount, setProjectCount] = useState(0);
  const [surveyCount, setSurveyCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  // Project status counts
  const [projectStatusCounts, setProjectStatusCounts] = useState({
    Active: 0,
    Completed: 0,
    Paused: 0,
    Billed: 0,
    Draft: 0,
  });

  // Survey status counts
  const [surveyStatusCounts, setSurveyStatusCounts] = useState({
    Active: 0,
    Paused: 0,
    Completed: 0,
    Billed: 0,
    Draft: 0,
  });

  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        // =========================
        // PROJECTS
        // =========================
        const projectsData = await getProjects();

        const safeProjects = Array.isArray(projectsData)
          ? projectsData
          : [];

        setProjects(safeProjects);
        setProjectCount(safeProjects.length);

        // Project status counts
        const projectStatusData = {
          Active: safeProjects.filter(
            (project) => project.status === "Active"
          ).length,

          Completed: safeProjects.filter(
            (project) => project.status === "Completed"
          ).length,

          Paused: safeProjects.filter(
            (project) => project.status === "Paused"
          ).length,

          Billed: safeProjects.filter(
            (project) => project.status === "Billed"
          ).length,

          Draft: safeProjects.filter(
            (project) => project.status === "Draft"
          ).length,
        };

        setProjectStatusCounts(projectStatusData);

        // =========================
        // TOTAL PROJECT BUDGET
        // =========================
        const totalBudget = safeProjects.reduce(
          (total, project) =>
            total + Number(project.budget || 0),
          0
        );

        setRevenue(totalBudget);

        // =========================
        // SURVEYS
        // =========================
        const surveysData = await getSurveys();

        const safeSurveys = Array.isArray(surveysData)
          ? surveysData
          : [];

        setSurveyCount(safeSurveys.length);

        // Survey status counts
        const surveyStatusData = {
          Active: safeSurveys.filter(
            (survey) => survey.status === "Active"
          ).length,

          Paused: safeSurveys.filter(
            (survey) => survey.status === "Paused"
          ).length,

          Completed: safeSurveys.filter(
            (survey) => survey.status === "Completed"
          ).length,

          Billed: safeSurveys.filter(
            (survey) => survey.status === "Billed"
          ).length,

          Draft: safeSurveys.filter(
            (survey) => survey.status === "Draft"
          ).length,
        };

        setSurveyStatusCounts(surveyStatusData);

        // =========================
        // USERS / VENDORS
        // =========================
        const vendorsData = await getVendors();

        const safeVendors = Array.isArray(vendorsData)
          ? vendorsData
          : [];

        setUserCount(safeVendors.length);

        // =========================
        // RECENT ACTIVITY
        // =========================
        const activityData = await getProjectActivity();

        const safeActivities = Array.isArray(activityData)
          ? activityData
          : [];

        setActivities(safeActivities);

      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );

        setError(
          "Unable to load dashboard data. Please try again."
        );

        setProjects([]);
        setProjectCount(0);
        setSurveyCount(0);
        setUserCount(0);
        setRevenue(0);
        setActivities([]);

        setProjectStatusCounts({
          Active: 0,
          Completed: 0,
          Paused: 0,
          Billed: 0,
          Draft: 0,
        });

        setSurveyStatusCounts({
          Active: 0,
          Paused: 0,
          Completed: 0,
          Billed: 0,
          Draft: 0,
        });

      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="dashboard-content">

        {/* =========================
            LOADING
        ========================= */}
        {loading && (
          <p className="dashboard-loading">
            Loading dashboard...
          </p>
        )}

        {/* =========================
            ERROR
        ========================= */}
        {error && (
          <p className="dashboard-error">
            {error}
          </p>
        )}

        {/* =========================
            OVERVIEW
        ========================= */}
        <div className="dashboard-overview-shell">

          <h1 className="dashboard-title">
            Overview
          </h1>

          <div className="dashboard-stats-grid">

            <StatCard
              title="Projects"
              value={projectCount}
              color="#4CAF50"
            />

            <StatCard
              title="Vendors"
              value={userCount}
              color="#2196F3"
            />

            <StatCard
              title="Surveys"
              value={surveyCount}
              color="#FF9800"
            />

            <StatCard
              title="Total Budget"
              value={`₹${revenue.toLocaleString("en-IN")}`}
              color="#9C27B0"
            />

          </div>
        </div>

        {/* =========================
            STATUS OVERVIEW
        ========================= */}
        <div className="status-overview">

          {/* PROJECT STATUS */}
          <div className="status-section">

            <h2>Project Status</h2>

            <div className="status-items">

              <div className="status-item">
                <strong>
                  {projectStatusCounts.Active}
                </strong>

                <span>
                  Active
                </span>
              </div>

              <div className="status-item">
                <strong>
                  {projectStatusCounts.Paused}
                </strong>

                <span>
                  Paused
                </span>
              </div>

              <div className="status-item">
                <strong>
                  {projectStatusCounts.Completed}
                </strong>

                <span>
                  Completed
                </span>
              </div>

              <div className="status-item">
                <strong>
                  {projectStatusCounts.Billed}
                </strong>

                <span>
                  Billed
                </span>
              </div>

              <div className="status-item">
                <strong>
                  {projectStatusCounts.Draft}
                </strong>

                <span>
                  Draft
                </span>
              </div>

            </div>
          </div>

          {/* SURVEY STATUS */}
          <div className="status-section">

            <h2>Survey Status</h2>

            <div className="status-items">

              <div className="status-item">
                <strong>
                  {surveyStatusCounts.Active}
                </strong>

                <span>
                  Active
                </span>
              </div>

              <div className="status-item">
                <strong>
                  {surveyStatusCounts.Paused}
                </strong>

                <span>
                  Paused
                </span>
              </div>

              <div className="status-item">
                <strong>
                  {surveyStatusCounts.Completed}
                </strong>

                <span>
                  Completed
                </span>
              </div>

              <div className="status-item">
                <strong>
                  {surveyStatusCounts.Billed}
                </strong>

                <span>
                  Billed
                </span>
              </div>

              <div className="status-item">
                <strong>
                  {surveyStatusCounts.Draft}
                </strong>

                <span>
                  Draft
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* =========================
            DASHBOARD PANELS
        ========================= */}
        <div className="dashboard-panels">

          <RecentProjects
            projects={projects}
          />

          <ActivityPanel
            activities={activities}
            loading={loading}
            error={error}
          />

          <Users />

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;