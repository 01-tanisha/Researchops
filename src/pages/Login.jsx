import "./Login.css";

function Login() {
  return (

    <div className="login-page">

      <div className="login-card">

        <h2>Welcome Back</h2>

        <p>Login to ResearchOps AI</p>

        <input
          type="email"
          placeholder="Email Address"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button>

          Login

        </button>

      </div>

    </div>

  );
}

export default Login;