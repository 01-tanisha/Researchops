import { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatCard from "../components/dashboard/StatCard";
import RecentProjects from "../components/dashboard/RecentProjects";
import ActivityPanel from "../components/dashboard/ActivityPanel";
import Users from "../components/dashboard/Users";
import "./Dashboard.css";
import { getProjectActivity, getProjects } from "../services/api/projectApi";



function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        const safeProjects = Array.isArray(projectsData) ? projectsData : [];
        setProjects(safeProjects);
        setProjectCount(safeProjects.length);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
        setProjectCount(0);
      }
    };

    const fetchActivity = async () => {
      try {
        const activityData = await getProjectActivity();
        setActivities(Array.isArray(activityData) ? activityData : []);
      } catch (error) {
        console.error("Error fetching project activity:", error);
        setActivities([]);
      }
    };

    fetchProjects();
    fetchActivity();
  }, []);

  return (

    <div className="dashboard-page">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <div className="dashboard-content">

          <div className="dashboard-overview-shell">
            <h1 className="dashboard-title">Overview</h1>

            <div className="dashboard-stats-grid">
              <StatCard title="Projects" value={projectCount} color="#4CAF50" />
              <StatCard title="Vendors" value="15" color="#2196F3" />
              <StatCard title="Surveys" value="320" color="#FF9800" />
              <StatCard title="Revenue" value="$12,400" color="#9C27B0" />
            </div>
          </div>

          <div className="dashboard-panels">
            <RecentProjects projects={projects.slice(0, 3)} />
            <ActivityPanel activities={activities} />
            <Users />
          </div>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;