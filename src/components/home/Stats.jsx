import "./Stats.css";

function Stats() {
    return(
        <section className="stats" id="workflow">
            <div className="workflow-heading">
                <p>A PRACTICAL FLOW</p>
                <h2>From brief to fieldwork, without the gaps.</h2>
            </div>
            <div className="stats-container">
                <article className="stat-card">
                    <span>STEP 01</span>
                    <h3>Set the brief</h3>
                    <p>Start with a project, its client, and the survey requirements.</p>
                </article>
                <article className="stat-card">
                    <span>STEP 02</span>
                    <h3>Run the field</h3>
                    <p>Allocate vendors and keep completes and survey metrics in view.</p>
                </article>
                <article className="stat-card">
                    <span>STEP 03</span>
                    <h3>Close the loop</h3>
                    <p>Review delivery and reporting before the work is marked complete.</p>
                </article>
            </div>
        </section>
    );
}

export default Stats;