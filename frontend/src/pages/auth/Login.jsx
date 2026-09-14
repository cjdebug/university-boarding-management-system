import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Headphones,
} from "lucide-react";
import { loginUser } from "../../services/api";
import "../../styles/login.css";
import loginHouse from "../../assets/login-house.jpg";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-icon">
            <Building2 size={34} />
          </div>

          <div>
            <h2>Boarding System</h2>
            <p>Management Portal</p>
          </div>
        </div>

        <div className="login-welcome">
          <h1>Welcome back</h1>
          <p>
            Boarding owners and students can sign in to access the boarding
            management system.
          </p>
        </div>

        <div className="boarding-illustration">
          <img
            src={loginHouse}
            alt="Boarding house illustration"
            className="boarding-image"
          />
        </div>

        <div className="secure-note">
          <ShieldCheck size={20} />
          <span>
            Secure. Reliable. Designed for a better boarding experience.
          </span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to continue.</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label>Username</label>

              <div className="login-input-wrapper">
                <User size={20} />

                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label>Password</label>

              <div className="login-input-wrapper">
                <LockKeyhole size={20} />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              <LockKeyhole size={18} />

              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="login-divider">
            <span />
            <p>Need help?</p>
            <span />
          </div>

          <div className="support-box">
            <div className="support-icon">
              <Headphones size={23} />
            </div>

            <div>
              <strong>Contact Support</strong>
              <p>We're here to help you</p>
            </div>
          </div>
        </div>

        <div className="login-footer">
          © 2026 Boarding System Management Portal
        </div>
      </div>
    </div>
  );
}

export default Login;
