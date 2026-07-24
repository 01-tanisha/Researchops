import Sidebar from "../dashboard/Sidebar";
import Topbar from "../dashboard/Topbar";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-layout-main">

                <Topbar />

                <div className="dashboard-layout-page">

                    {children}

                </div>

            </div>

        </div>

    );

}

export default DashboardLayout;