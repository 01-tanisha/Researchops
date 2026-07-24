import "./Topbar.css";

import {
    FaSearch,
    FaBell,
    FaChevronDown
} from "react-icons/fa";

function Topbar(){

    return(

        <header className="topbar">

            <div className="search-box">

                <FaSearch/>

                <input
                    type="text"
                    placeholder="Search projects..."
                />

            </div>

            <div className="topbar-right">

                <button className="notification-btn">

                    <FaBell/>

                </button>

                <div className="user-profile">

                    <div className="avatar">

                        T

                    </div>

                    <span>

                        Tanisha

                    </span>

                    <FaChevronDown/>

                </div>

            </div>

        </header>

    );

}

export default Topbar;