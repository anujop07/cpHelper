import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../src/Api";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Only change inside handleSubmit - replace the API.post line:

function handleSubmit(e) {
  e.preventDefault();

  if (!name || !email || !password) {
    setError("Please fill in all fields");
    return;
  }

  setError("");
  setLoading(true);

  console.log("Submitting signup:", { name, email, password });

  // FIXED: Send "username" instead of "name"
  API.post("/auth/register", { username: name, email, password })
    .then(function(response) {
      console.log("Signup successful:", response.data);
      setLoading(false);
      navigate("/login");
    })
    .catch(function(err) {
      console.log("Signup failed:", err);
      setLoading(false);
      setError(err.response?.data?.message || "Signup failed");
    });
}

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <div>
      <h1>Signup to CP Helper</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            disabled={loading}
          />
        </div>

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
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Signup;