import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../src/Api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // This lets us redirect to another page
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    // Call your backend API
    API.post("/auth/login", { email, password })
      .then(function(response) {
        console.log("Login successful:", response.data);
        setLoading(false);
        
        // ✅ NEW: Save the token to localStorage
        localStorage.setItem("token", response.data.token);
        
        navigate("/profile");
      })
      .catch(function(err) {
        console.log("Login failed:", err);
        setLoading(false);
        setError(err.response?.data?.message || "Login failed");
      });
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <div>
      <h1>Login to CP Helper</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/signup">Signup here</Link>
      </p>
    </div>
  );
}

export default Login;