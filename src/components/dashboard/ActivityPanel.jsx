import "./ActivityPanel.css";

function ActivityPanel(){

    const activities=[

        "Vendor ABC uploaded survey responses",

        "Healthcare project approved",

        "Client meeting scheduled",

        "New vendor added"
    ];

    return(

        <div className="activity-panel">

            <h2>

                Recent Activity

            </h2>

            <ul>

                {activities.map((activity,index)=>(

                    <li key={index}>

                        {activity}

                    </li>

                ))}

            </ul>

        </div>

    );

}

export default ActivityPanel;