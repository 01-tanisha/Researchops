import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatCard from "../components/dashboard/StatCard";
import RecentProjects from "../components/dashboard/RecentProjects";
import ActivityPanel from "../components/dashboard/ActivityPanel";
import Users from "../components/dashboard/Users";
import "./Dashboard.css";




function Dashboard() {

  return (

    <div className="dashboard-page">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <div className="dashboard-content">

          <div className="dashboard-overview-shell">
            <h1 className="dashboard-title">Overview</h1>

            <div className="dashboard-stats-grid">
              <StatCard title="Projects" value="24" color="#4CAF50" />
              <StatCard title="Vendors" value="15" color="#2196F3" />
              <StatCard title="Surveys" value="320" color="#FF9800" />
              <StatCard title="Revenue" value="$12,400" color="#9C27B0" />
            </div>
          </div>

          <div className="dashboard-panels">
            <RecentProjects />
            <ActivityPanel />
            <Users />
          </div>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;