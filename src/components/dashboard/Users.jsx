import { useEffect, useState } from "react";
import { getUsers } from "../../services/api";
import "./Users.css";

function Users() {

    const [users, setUsers] = useState([]);

    useEffect(() => {

        async function loadUsers(){

            const data = await getUsers();

            setUsers(data);

        }

        loadUsers();

    }, []);

    return(

        <div className="users">

            <h2>Team Members</h2>

            {users.map(user => (

                <div
                    key={user.id}
                    className="user-card"
                >

                    <div className="user-name">
                        {user.name}
                    </div>

                    <div className="user-email">
                        {user.email}
                    </div>

                </div>

            ))}

        </div>

    );

}

export default Users;