import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children, adminOnly = false }) {
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function checkAuthentication() {
            try {
                const response = await fetch("/api/me/", {
                    credentials: "include",
                });

                setAuthenticated(response.ok);
                if (response.ok) {
                    const data = await response.json();
                    setIsAdmin(Boolean(data.user?.is_superuser));
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                setAuthenticated(false);
            } finally {
                setChecking(false);
            }
        }

        checkAuthentication();
    }, []);

    if (checking) {
        return <div>Checking authentication...</div>;
    }

    if (!authenticated) {
        return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;