import "./Features.css";

function Features() {

    const features = [
        { index: "01", title: "Project intake", description: "Keep the client, project brief, status, and delivery context together." },
        { index: "02", title: "Survey operations", description: "Connect surveys to projects and keep requirements visible to the team." },
        { index: "03", title: "Vendor fieldwork", description: "Set vendor allocations and follow assigned and delivered completes." },
        { index: "04", title: "Clear reporting", description: "Review survey performance, completes, and billing from one workspace." },
    ];

    return(

        <section className="features" id="features">
            <div className="features-heading">
                <p>ONE CONNECTED WORKSPACE</p>
                <h2>Less chasing. <em>More clarity.</em></h2>
            </div>

            <div className="feature-grid">
                {features.map((feature) => (
                    <article className="feature-card" key={feature.index}>
                        <span>{feature.index}</span>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </article>
                ))}
            </div>
        </section>

    );
}

export default Features;