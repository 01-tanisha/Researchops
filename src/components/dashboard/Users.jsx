import { useEffect, useState } from "react";
import { getUsers } from "../../services/api/projectApi";
import "./Users.css";

function Users() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadUsers() {

            try {

                setError("");

                const data = await getUsers();

                setUsers(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Failed to load users:",
                    error
                );

                setError(
                    "Unable to load team members."
                );

            } finally {

                setLoading(false);

            }

        }

        loadUsers();

    }, []);

    return (

        <div className="users">

            <h2>
                Team Members
            </h2>

            {loading && (

                <p className="users-message">
                    Loading team members...
                </p>

            )}

            {error && (

                <p className="users-error">
                    {error}
                </p>

            )}

            {!loading &&
             !error &&
             users.length === 0 && (

                <p className="users-message">
                    No team members available.
                </p>

            )}

            {!loading &&
             !error &&
             users.length > 0 && (

                users.map(user => (

                    <div
                        key={user.id}
                        className="user-card"
                    >

                        <div className="user-name">
                            {user.name}
                        </div>

                        <div className="user-email">
                            {user.email || "No email available"}
                        </div>

                    </div>

                ))

            )}

        </div>

    );

}

export default Users;