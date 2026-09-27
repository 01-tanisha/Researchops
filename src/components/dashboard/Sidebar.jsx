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
    FaUserShield,
    FaChevronDown,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import LogoutButton from "../auth/LogoutButton";
import "./Sidebar.css";

function Sidebar() {
    const [user, setUser] = useState(null);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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

            {user?.is_superuser && (
                <>
                    <div className="menu-title">ADMIN</div>
                    <nav>
                    <NavLink
                        to="/admin/project-managers"
                        className={({ isActive }) =>
                            isActive ? "active-link" : ""
                        }
                    >
                        <FaUserShield />
                        Project Managers
                    </NavLink>
                    </nav>
                </>
            )}

            <div className="sidebar-account">
                {accountMenuOpen && (
                    <div className="sidebar-account-menu">
                        <Link to="/settings" onClick={() => setAccountMenuOpen(false)}>
                            <FaCog />
                            Settings
                        </Link>
                        <LogoutButton />
                    </div>
                )}
                <button
                    type="button"
                    className="sidebar-account-trigger"
                    aria-expanded={accountMenuOpen}
                    aria-label="Open account menu"
                    onClick={() => setAccountMenuOpen((open) => !open)}
                >
                    <span className="sidebar-account-avatar">
                        {(user?.first_name || user?.username || "U").charAt(0).toUpperCase()}
                    </span>
                    <span className="sidebar-account-name">
                        {user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Account"}
                    </span>
                    <FaChevronDown className={accountMenuOpen ? "account-chevron open" : "account-chevron"} />
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;