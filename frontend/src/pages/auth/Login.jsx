import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(username, password);

      localStorage.setItem("access_token", data.access_token);

      localStorage.setItem("user_role", data.role);

      if (data.role === "owner") {
        navigate("/owner/dashboard");
      } else if (data.role === "student") {
        navigate("/student/dashboard");
      } else {
        setError("Unknown user role");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>

          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
