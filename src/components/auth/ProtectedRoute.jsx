import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        async function checkAuthentication() {
            try {
                const response = await fetch(
                    "/api/me/",
                    {
                        credentials: "include",
                    }
                );

                setAuthenticated(response.ok);
            } catch (error) {
                console.error(
                    "Authentication check failed:",
                    error
                );
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
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;