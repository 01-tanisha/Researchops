import "./Stats.css";

function Stats() {

    const stats = [

        {
            number:"5000+",
            label:"Surveys Completed"
        },

        {
            number:"250+",
            label:"Vendors"
        },

        {
            number:"100+",
            label:"Clients"
        },

        {
            number:"98%",
            label:"Success Rate"
        }

    ];

    return(

        <section className="stats">

            <div className="stats-container">

                {stats.map((item,index)=>(

                    <div className="stat-card" key={index}>

                        <h2>{item.number}</h2>

                        <p>{item.label}</p>

                    </div>

                ))}

            </div>

        </section>

    );

}

export default Stats;