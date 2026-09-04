import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FaHome,
    FaFolder,
    FaTruck,
    FaPoll,
    FaUsers,
    FaChartBar,
    FaCog,
    FaUser,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await fetch("/api/me/", {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to load user:", error);
            }
        }

        loadUser();
    }, []);

    return (
        <aside className="sidebar">
            <h2 className="logo">ResearchOps</h2>

            <div className="menu-title">MAIN</div>

            <nav>
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                >
                    <FaHome />
                    Dashboard
                </NavLink>

                <NavLink
                    to="/projects"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                >
                    <FaFolder />
                    Projects
                </NavLink>
            </nav>

            <div className="menu-title">MANAGEMENT</div>

            <nav>
                <NavLink
                    to="/clients"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                >
                    <FaUsers />
                    Clients
                </NavLink>

                <NavLink
                    to="/vendors"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                >
                    <FaTruck />
                    Vendors
                </NavLink>

                <NavLink
                    to="/surveys"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                >
                    <FaPoll />
                    Surveys
                </NavLink>
            </nav>

            <div className="menu-title">ANALYTICS</div>

            <nav>
                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                >
                    <FaChartBar />
                    Reports
                </NavLink>
            </nav>

            <div className="menu-title">ACCOUNT</div>

            {user && (
                <div className="sidebar-user">
                    <FaUser />
                    <span>{user.username}</span>
                </div>
            )}

            <nav>
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive ? "active-link" : ""
                    }
                >
                    <FaCog />
                    Settings
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;