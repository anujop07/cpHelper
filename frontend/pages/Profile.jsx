import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../src/Api";

function Profile() {
  // State for user data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for CP handles form
  const [handles, setHandles] = useState({
    codeforcesHandle: "",
    leetcodeHandle: "",
    codechefHandle: ""
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // State for CP stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const navigate = useNavigate();

  // Fetch user data when page loads
  useEffect(function() {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    API.get("/auth/me")
      .then(function(response) {
        console.log("User data:", response.data);
        setUser(response.data.user);
        
        // Pre-fill the form with existing handles
        setHandles({
          codeforcesHandle: response.data.user.codeforcesHandle || "",
          leetcodeHandle: response.data.user.leetcodeHandle || "",
          codechefHandle: response.data.user.codechefHandle || ""
        });
        
        setLoading(false);
      })
      .catch(function(err) {
        console.log("Failed to fetch user:", err);
        setError("Failed to load profile");
        setLoading(false);
        
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, []);

  // Handle input changes
  function handleInputChange(e) {
    setHandles({
      ...handles,
      [e.target.name]: e.target.value
    });
  }

  // Save handles to backend
  // ✅ FIXED: Using /profile/handles (matches your route)
  function handleSaveHandles(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");

    API.put("/profile/handles", handles)
      .then(function(response) {
        console.log("Handles saved:", response.data);
        setSaving(false);
        setSaveMessage("Handles saved successfully!");
        
        // Update local user state with new handles
        setUser({
          ...user,
          codeforcesHandle: response.data.handles.codeforcesHandle,
          leetcodeHandle: response.data.handles.leetcodeHandle,
          codechefHandle: response.data.handles.codechefHandle
        });
      })
      .catch(function(err) {
        console.log("Failed to save handles:", err);
        setSaving(false);
        setSaveMessage("Failed to save handles");
      });
  }

  // Fetch CP stats from all platforms
  // ✅ FIXED: Using /cpinfo/me and correct response format
  function handleFetchStats() {
    setLoadingStats(true);
    setStats(null);

    API.get("/cpinfo/me")
      .then(function(response) {
        console.log("CP Stats:", response.data);
        // Your backend returns { success: true, data: {...} }
        setStats(response.data.data);
        setLoadingStats(false);
      })
      .catch(function(err) {
        console.log("Failed to fetch stats:", err);
        setLoadingStats(false);
      });
  }

  // Handle logout
  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error state
  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  // Show profile
  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      
      {/* User Info Section */}
      <div>
        <h2>Your Info</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
      </div>

      {/* CP Handles Form */}
      <div>
        <h2>Update CP Handles</h2>
        <form onSubmit={handleSaveHandles}>
          <div>
            <label>Codeforces: </label>
            <input
              type="text"
              name="codeforcesHandle"
              value={handles.codeforcesHandle}
              onChange={handleInputChange}
              placeholder="Enter Codeforces username"
              disabled={saving}
            />
          </div>

          <div>
            <label>LeetCode: </label>
            <input
              type="text"
              name="leetcodeHandle"
              value={handles.leetcodeHandle}
              onChange={handleInputChange}
              placeholder="Enter LeetCode username"
              disabled={saving}
            />
          </div>

          <div>
            <label>CodeChef: </label>
            <input
              type="text"
              name="codechefHandle"
              value={handles.codechefHandle}
              onChange={handleInputChange}
              placeholder="Enter CodeChef username"
              disabled={saving}
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Handles"}
          </button>

          {saveMessage && <p>{saveMessage}</p>}
        </form>
      </div>

      {/* CP Stats Section */}
      <div>
        <h2>CP Stats</h2>
        <button onClick={handleFetchStats} disabled={loadingStats}>
          {loadingStats ? "Fetching..." : "Fetch My Stats"}
        </button>

        {stats && (
          <div>
            {/* Codeforces Stats */}
            {stats.codeforces ? (
              <div>
                <h3>Codeforces</h3>
                <p><strong>Rating:</strong> {stats.codeforces.details?.rating || "Unrated"}</p>
                <p><strong>Rank:</strong> {stats.codeforces.details?.rank || "N/A"}</p>
                <p><strong>Max Rating:</strong> {stats.codeforces.details?.maxRating || "N/A"}</p>
              </div>
            ) : (
              <p>Codeforces: No handle set</p>
            )}

            {/* LeetCode Stats */}
            {stats.leetcode ? (
              <div>
                <h3>LeetCode</h3>
                <p><strong>Ranking:</strong> {stats.leetcode.ranking || "N/A"}</p>
                <p><strong>Easy:</strong> {stats.leetcode.solved?.easy || 0}</p>
                <p><strong>Medium:</strong> {stats.leetcode.solved?.medium || 0}</p>
                <p><strong>Hard:</strong> {stats.leetcode.solved?.hard || 0}</p>
                <p><strong>Total:</strong> {stats.leetcode.solved?.total || 0}</p>
              </div>
            ) : (
              <p>LeetCode: No handle set</p>
            )}

            {/* CodeChef Stats */}
            {stats.codechef ? (
              <div>
                <h3>CodeChef</h3>
                <p><strong>Rating:</strong> {stats.codechef.rating || "N/A"}</p>
                <p><strong>Stars:</strong> {stats.codechef.stars || "N/A"}</p>
              </div>
            ) : (
              <p>CodeChef: No handle set</p>
            )}
          </div>
        )}
      </div>

      <hr />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;