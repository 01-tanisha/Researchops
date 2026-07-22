import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatCard from "../components/dashboard/StatCard";
import RecentProjects from "../components/dashboard/RecentProjects";
import ActivityPanel from "../components/dashboard/ActivityPanel";

function Dashboard() {

  return (

    <div style={{ display: "flex" }}>

      <Sidebar />

      <div style={{ flex: 1, background: "#F4F6F9" }}>

        <Topbar />

        <div className="dashboard-content">

          <h1>Overview</h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "20px",
              marginTop: "25px",
            }}
          >

            <StatCard
              title="Projects"
              value="24"
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
          <div className="dashboard-panels">
            <RecentProjects />
            <ActivityPanel />
          </div>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;