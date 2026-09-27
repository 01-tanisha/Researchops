import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ adminMode = false }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "/api/login/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Invalid username or password."
                );
            }

            if (adminMode && !data.user?.is_superuser) {
                await fetch("/api/logout/", {
                    method: "POST",
                    credentials: "include",
                });
                throw new Error("This portal is for administrators. Sign in through the project manager portal.");
            }

            navigate(data.user?.is_superuser ? "/admin" : "/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>{adminMode ? "ResearchOps Admin" : "ResearchOps"}</h1>
                {location.state?.message && (
                    <p className="login-success" role="status">
                        {location.state.message}
                    </p>
                )}
                <p className="login-subtitle">
                    {adminMode ? "Administrator portal sign in" : "Sign in to your project workspace"}
                </p>

                <form onSubmit={handleLogin}>
                    <div className="login-field">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="login-error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>
                {adminMode ? (
                    <p className="login-register-link">Project manager? <Link to="/login">Use the PM sign-in</Link></p>
                ) : (
                    <>
                        <p className="login-register-link">
                            New project manager? <Link to="/register">Request account verification</Link>
                        </p>
                        <p className="login-register-link">Administrator? <Link to="/admin/login">Admin portal sign in</Link></p>
                    </>
                )}
                <Link className="login-home-link" to="/">Back to home</Link>
            </div>
        </div>
    );
}

export default Login;