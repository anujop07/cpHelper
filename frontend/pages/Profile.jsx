import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../src/Api";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [handles, setHandles] = useState({ codeforcesHandle: "", leetcodeHandle: "", codechefHandle: "" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const navigate = useNavigate();

  useEffect(function() {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    API.get("/auth/me")
      .then(function(response) {
        setUser(response.data.user);
        setHandles({
          codeforcesHandle: response.data.user.codeforcesHandle || "",
          leetcodeHandle: response.data.user.leetcodeHandle || "",
          codechefHandle: response.data.user.codechefHandle || ""
        });
        setLoading(false);
      })
      .catch(function(err) {
        setError("Failed to load profile");
        setLoading(false);
        if (err.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); }
      });
  }, [navigate]);

  function handleInputChange(e) { setHandles({ ...handles, [e.target.name]: e.target.value }); }

  function handleSaveHandles(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");

    API.put("/profile/handles", handles)
      .then(function(response) {
        setSaving(false);
        setSaveMessage("success");
        setUser({ ...user, ...response.data.handles });
        setTimeout(() => setSaveMessage(""), 3000);
      })
      .catch(function() {
        setSaving(false);
        setSaveMessage("error");
        setTimeout(() => setSaveMessage(""), 3000);
      });
  }

  function handleFetchStats() {
    setLoadingStats(true);
    setStats(null);
    API.get("/cpinfo/me")
      .then(function(response) { setStats(response.data.data); setLoadingStats(false); })
      .catch(function() { setLoadingStats(false); });
  }

  function handleLogout() { localStorage.removeItem("token"); navigate("/login"); }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center animate-scale-in">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 py-8 px-4">
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-slide-in-right ${
          saveMessage === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {saveMessage === 'success' ? '✅ Handles saved!' : '❌ Failed to save'}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(102,126,234,0.4)]">
                {user?.username?.[0]?.toUpperCase() || '👤'}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome, {user?.username}! 👋</h1>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-300">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Handles Form */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🔗</span> CP Handles
            </h2>
            
            <form onSubmit={handleSaveHandles} className="space-y-4">
              {[
                { name: 'codeforcesHandle', label: 'Codeforces', icon: '⚡' },
                { name: 'leetcodeHandle', label: 'LeetCode', icon: '💻' },
                { name: 'codechefHandle', label: 'CodeChef', icon: '🔥' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{field.icon} {field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={handles[field.name]}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500
                             focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                             disabled:opacity-50 transition-all duration-300"
                  />
                </div>
              ))}
              <button type="submit" disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white font-semibold
                         hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 transform hover:scale-[1.02] transition-all duration-300">
                {saving ? 'Saving...' : 'Save Handles'}
              </button>
            </form>
          </div>

          {/* Stats Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-2xl">📊</span> Your CP Stats</h2>
              <button onClick={handleFetchStats} disabled={loadingStats}
                className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan rounded-xl transition-all duration-300 disabled:opacity-50">
                {loadingStats ? 'Fetching...' : 'Refresh Stats'}
              </button>
            </div>

            {!stats && !loadingStats && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📈</div>
                <p>Click "Refresh Stats" to fetch your CP statistics</p>
              </div>
            )}

            {loadingStats && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white/5 rounded-xl p-4">
                    <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
                    <div className="h-8 bg-white/10 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {stats && (
              <div className="space-y-4">
                {stats.codeforces && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20 animate-scale-in">
                    <h3 className="text-lg font-semibold text-white mb-3">⚡ Codeforces</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div><p className="text-gray-400 text-sm">Rating</p><p className="text-2xl font-bold text-blue-400">{stats.codeforces.details?.rating || 'N/A'}</p></div>
                      <div><p className="text-gray-400 text-sm">Rank</p><p className="text-lg font-semibold text-white">{stats.codeforces.details?.rank || 'N/A'}</p></div>
                      <div><p className="text-gray-400 text-sm">Max</p><p className="text-lg font-semibold text-green-400">{stats.codeforces.details?.maxRating || 'N/A'}</p></div>
                    </div>
                  </div>
                )}
                {stats.leetcode && (
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20 animate-scale-in">
                    <h3 className="text-lg font-semibold text-white mb-3">💻 LeetCode</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div><p className="text-gray-400 text-sm">Easy</p><p className="text-xl font-bold text-green-400">{stats.leetcode.solved?.easy || 0}</p></div>
                      <div><p className="text-gray-400 text-sm">Medium</p><p className="text-xl font-bold text-yellow-400">{stats.leetcode.solved?.medium || 0}</p></div>
                      <div><p className="text-gray-400 text-sm">Hard</p><p className="text-xl font-bold text-red-400">{stats.leetcode.solved?.hard || 0}</p></div>
                      <div><p className="text-gray-400 text-sm">Total</p><p className="text-xl font-bold text-white">{stats.leetcode.solved?.total || 0}</p></div>
                    </div>
                  </div>
                )}
                {stats.codechef && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 rounded-xl p-4 border border-amber-500/20 animate-scale-in">
                    <h3 className="text-lg font-semibold text-white mb-3">🔥 CodeChef</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-gray-400 text-sm">Rating</p><p className="text-2xl font-bold text-amber-400">{stats.codechef.rating || 'N/A'}</p></div>
                      <div><p className="text-gray-400 text-sm">Stars</p><p className="text-2xl font-bold text-yellow-400">{stats.codechef.stars || 'N/A'}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;



