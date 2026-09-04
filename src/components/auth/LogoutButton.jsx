import { useNavigate } from "react-router-dom";

function LogoutButton() {
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await fetch(
                "/api/logout/",
                {
                    method: "POST",
                    credentials: "include",
                }
            );
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            navigate("/login", { replace: true });
        }
    }

    return (
        <button type="button" onClick={handleLogout}>
            Logout
        </button>
    );
}

export default LogoutButton;