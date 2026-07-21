import "./Features.css";
import FeatureCard from "../common/FeatureCard";

function Features() {

    const features = [

        {
            title:"Vendor Management",
            description:"Manage vendors from one dashboard."
        },

        {
            title:"Survey Tracking",
            description:"Track survey progress in real-time."
        },

        {
            title:"Reports",
            description:"Generate automatic client reports."
        },

        {
            title:"AI Dashboard",
            description:"Monitor KPIs using AI insights."
        }

    ];

    return(

        <section className="features" id="features">

            <h2>Everything you need</h2>

            <div className="feature-grid">

                {features.map((feature,index)=>(

                    <FeatureCard

                        key={index}

                        title={feature.title}

                        description={feature.description}

                    />

                ))}

            </div>

        </section>

    );
}

export default Features;