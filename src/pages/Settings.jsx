import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import "./Settings.css";

function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await fetch(
                    "/api/me/",
                    {
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Unable to load profile."
                    );
                }

                setUser(data.user);
            } catch (error) {
                console.error("Failed to load profile:", error);
                setError("Unable to load profile.");
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    return (
        <DashboardLayout>
            <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your ResearchOps account.</p>
            </div>

            <div className="settings-card">
                <h2>Profile</h2>

                {loading && (
                    <p className="settings-message">
                        Loading profile...
                    </p>
                )}

                {error && (
                    <p className="settings-error">
                        {error}
                    </p>
                )}

                {!loading && !error && user && (
                    <div className="profile-details">
                        <div className="profile-row">
                            <span>Username</span>
                            <strong>{user.username}</strong>
                        </div>

                        <div className="profile-row">
                            <span>Email</span>
                            <strong>
                                {user.email || "No email available"}
                            </strong>
                        </div>

                        <div className="profile-row">
                            <span>Account Status</span>
                            <strong className="account-active">
                                Active
                            </strong>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </DashboardLayout>
    );
}

export default Settings;