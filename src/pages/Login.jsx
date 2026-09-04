import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

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

            navigate("/dashboard");
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
                <h1>ResearchOps</h1>
                <p className="login-subtitle">
                    Sign in to your account
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
            </div>
        </div>
    );
}

export default Login;