import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../src/Api";
import { useTheme } from "../src/ThemeContext";

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
  const { isDark } = useTheme();

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
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-neutral-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center animate-scale-in">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-slide-in-right ${
          saveMessage === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {saveMessage === 'success' ? '✅ Handles saved!' : '❌ Failed to save'}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className={`rounded-xl p-6 md:p-8 border animate-fade-in-up transition-colors ${isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-2xl font-bold text-white">
                {user?.username?.[0]?.toUpperCase() || '👤'}
              </div>
              <div>
                <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome, {user?.username}! 👋</h1>
                <p className={isDark ? 'text-neutral-400' : 'text-gray-600'}>{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-sm border ${isDark ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all duration-200">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Handles Form */}
          <div className={`rounded-xl p-6 border animate-fade-in-up transition-colors ${isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-white border-gray-200'}`} style={{ animationDelay: '100ms' }}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-2xl">🔗</span> CP Handles
            </h2>
            
            <form onSubmit={handleSaveHandles} className="space-y-4">
              {[
                { name: 'codeforcesHandle', label: 'Codeforces', icon: '⚡' },
                { name: 'leetcodeHandle', label: 'LeetCode', icon: '💻' },
                { name: 'codechefHandle', label: 'CodeChef', icon: '🔥' },
              ].map((field) => (
                <div key={field.name}>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>{field.icon} {field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={handles[field.name]}
                    onChange={handleInputChange}
                    disabled={saving}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-primary-500/30 disabled:opacity-50 transition-all duration-200 ${isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-primary-500/70' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'}`}
                  />
                </div>
              ))}
              <button type="submit" disabled={saving}
                className="w-full py-3 bg-primary-500 hover:bg-primary-400 rounded-xl text-white font-semibold
                         disabled:opacity-50 transition-colors duration-200">
                {saving ? 'Saving...' : 'Save Handles'}
              </button>
            </form>
          </div>

          {/* Stats Section */}
          <div className={`rounded-xl p-6 border animate-fade-in-up transition-colors ${isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-white border-gray-200'}`} style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><span className="text-2xl">📊</span> Your CP Stats</h2>
              <button onClick={handleFetchStats} disabled={loadingStats}
                className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan rounded-xl border border-accent-cyan/20 transition-all duration-200 disabled:opacity-50">
                {loadingStats ? 'Fetching...' : 'Refresh Stats'}
              </button>
            </div>

            {!stats && !loadingStats && (
              <div className={`text-center py-12 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                <div className="text-4xl mb-4">📈</div>
                <p>Click "Refresh Stats" to fetch your CP statistics</p>
              </div>
            )}

            {loadingStats && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-neutral-800 rounded-xl p-4">
                    <div className="h-4 bg-neutral-700 rounded w-1/3 mb-3"></div>
                    <div className="h-8 bg-neutral-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {stats && (
              <div className="space-y-4">
                {stats.codeforces && (
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 animate-scale-in">
                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>⚡ Codeforces</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Rating</p><p className="text-2xl font-bold text-blue-400">{stats.codeforces.details?.rating || 'N/A'}</p></div>
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Rank</p><p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.codeforces.details?.rank || 'N/A'}</p></div>
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Max</p><p className="text-lg font-semibold text-green-400">{stats.codeforces.details?.maxRating || 'N/A'}</p></div>
                    </div>
                  </div>
                )}
                {stats.leetcode && (
                  <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20 animate-scale-in">
                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>💻 LeetCode</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Easy</p><p className="text-xl font-bold text-green-400">{stats.leetcode.solved?.easy || 0}</p></div>
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Medium</p><p className="text-xl font-bold text-yellow-400">{stats.leetcode.solved?.medium || 0}</p></div>
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Hard</p><p className="text-xl font-bold text-red-400">{stats.leetcode.solved?.hard || 0}</p></div>
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Total</p><p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.leetcode.solved?.total || 0}</p></div>
                    </div>
                  </div>
                )}
                {stats.codechef && (
                  <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 animate-scale-in">
                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>🔥 CodeChef</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Rating</p><p className="text-2xl font-bold text-amber-400">{stats.codechef.rating || 'N/A'}</p></div>
                      <div><p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Stars</p><p className="text-2xl font-bold text-yellow-400">{stats.codechef.stars || 'N/A'}</p></div>
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



