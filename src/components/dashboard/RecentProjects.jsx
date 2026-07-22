import "./RecentProjects.css";

function RecentProjects() {

  const projects = [

    {
      name:"Healthcare Survey",
      client:"ABC Pharma",
      status:"Active"
    },

    {
      name:"Customer Feedback",
      client:"XYZ Retail",
      status:"Completed"
    },

    {
      name:"Market Analysis",
      client:"Tech Corp",
      status:"Pending"
    }

  ];

  return (

    <div className="recent-projects">

      <h2>Recent Projects</h2>

      <table>

        <thead>

          <tr>

            <th>Project</th>

            <th>Client</th>

            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          {projects.map((project,index)=>(

            <tr key={index}>

              <td>{project.name}</td>

              <td>{project.client}</td>

              <td>{project.status}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default RecentProjects;