import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import RecentProjects from "../components/dashboard/RecentProjects";
import ActivityPanel from "../components/dashboard/ActivityPanel";
import Users from "../components/dashboard/Users";
import "./Dashboard.css";
import {
  getProjectActivity,
  getProjects
} from "../services/api/projectApi";


function Dashboard() {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");


  useEffect(() => {

    async function loadDashboardData() {

      try {

        setError("");

        const projectsData = await getProjects();

        const safeProjects =
          Array.isArray(projectsData)
            ? projectsData
            : [];

        setProjects(safeProjects);
        setProjectCount(safeProjects.length);


        const activityData =
          await getProjectActivity();

        const safeActivities =
          Array.isArray(activityData)
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
        setActivities([]);

      } finally {

        setLoading(false);

      }

    }


    loadDashboardData();

  }, []);


  return (

    <DashboardLayout>

      <div className="dashboard-content">


          {loading && (

            <p className="dashboard-loading">
              Loading dashboard...
            </p>

          )}


          {error && (

            <p className="dashboard-error">
              {error}
            </p>

          )}


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
                value="15"
                color="#2196F3"
              />

              <StatCard
                title="Surveys"
                value="320"
                color="#FF9800"
              />

              <StatCard
                title="Revenue"
                value="$12,400"
                color="#9C27B0"
              />

            </div>

          </div>


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