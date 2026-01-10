import { useState, useEffect } from "react";

function ContestMania() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const platforms = [
    { value: "all", label: "All", icon: "🌐" },
    { value: "codeforces.com", label: "Codeforces", icon: "⚡" },
    { value: "leetcode.com", label: "LeetCode", icon: "💻" },
    { value: "codechef.com", label: "CodeChef", icon: "🔥" },
    { value: "atcoder.jp", label: "AtCoder", icon: "🎌" },
    { value: "hackerrank.com", label: "HackerRank", icon: "💚" },
  ];

  useEffect(() => {
    fetchContests();
  }, []);

  async function fetchContests() {
    setLoading(true);
    setError("");
    
    try {
      // Fetch directly from clist.by API
      const response = await fetch(
        "https://clist.by/api/v4/contest/?upcoming=true&orderby=start&limit=100",
        {
          headers: {
            Authorization: "ApiKey ANUJN_007:3ab784c6487da2945975cc58c1273a4139be98f9"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setContests(data.objects || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch contests:", err);
      setError(err.message || "Failed to fetch contests");
      setLoading(false);
    }
  }

  const filteredContests = filter === "all" 
    ? contests 
    : contests.filter(c => c.resource?.name?.includes(filter) || c.host?.includes(filter));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeUntil = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    
    if (diff < 0) return "Started";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPlatformIcon = (resourceName) => {
    const host = resourceName?.toLowerCase() || "";
    if (host.includes("codeforces")) return "⚡";
    if (host.includes("leetcode")) return "💻";
    if (host.includes("codechef")) return "🔥";
    if (host.includes("atcoder")) return "🎌";
    if (host.includes("hackerrank")) return "💚";
    if (host.includes("hackerearth")) return "🟦";
    if (host.includes("topcoder")) return "🔵";
    if (host.includes("google")) return "🟢";
    return "🏆";
  };

  const getPlatformColor = (resourceName) => {
    const host = resourceName?.toLowerCase() || "";
    if (host.includes("codeforces")) return "from-blue-500/20 to-blue-600/20 border-blue-500/30";
    if (host.includes("leetcode")) return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
    if (host.includes("codechef")) return "from-amber-500/20 to-red-500/20 border-amber-500/30";
    if (host.includes("atcoder")) return "from-gray-500/20 to-gray-600/20 border-gray-500/30";
    if (host.includes("hackerrank")) return "from-green-500/20 to-green-600/20 border-green-500/30";
    if (host.includes("google")) return "from-green-400/20 to-blue-500/20 border-green-400/30";
    return "from-primary-500/20 to-primary-600/20 border-primary-500/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 py-8 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-block mb-4 text-5xl animate-bounce-slow">🏆</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Contest Mania
            </span>
          </h1>
          <p className="text-gray-400">Track all upcoming competitive programming contests</p>
        </div>

        {/* Platform Filter */}
        <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex flex-wrap justify-center bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10 gap-1">
            {platforms.map((platform) => (
              <button
                key={platform.value}
                onClick={() => setFilter(platform.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  filter === platform.value
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {platform.icon} {platform.label}
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={fetchContests}
            disabled={loading}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                     rounded-xl text-gray-300 hover:text-white font-medium
                     disabled:opacity-50 transform hover:scale-105 transition-all duration-300
                     flex items-center gap-2"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            {loading ? 'Fetching...' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in max-w-2xl mx-auto">
            <p className="text-red-400 text-sm flex items-center justify-center gap-2">
              <span>❌</span> {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Contests Grid */}
        {!loading && filteredContests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest, index) => (
              <a
                key={contest.id || index}
                href={contest.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-gradient-to-br ${getPlatformColor(contest.resource)} 
                          backdrop-blur-md rounded-2xl p-6 border
                          hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]
                          transform transition-all duration-300 cursor-pointer
                          animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Platform Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{getPlatformIcon(contest.resource)}</span>
                  <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">
                    {contest.resource || 'Contest'}
                  </span>
                </div>

                {/* Contest Name */}
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2">
                  {contest.event}
                </h3>

                {/* Time Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>📅</span>
                    <span>{formatDate(contest.start)}</span>
                  </div>
                  
                  {contest.duration && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>⏱️</span>
                      <span>Duration: {formatDuration(contest.duration)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span>⏳</span>
                    <span className="text-yellow-400 font-semibold">
                      Starts in {getTimeUntil(contest.start)}
                    </span>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="mt-4 flex items-center gap-2 text-gray-500 group-hover:text-yellow-400 transition-colors">
                  <span className="text-sm">View Contest</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredContests.length === 0 && !error && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No Contests Found</h3>
            <p className="text-gray-400">Try changing the filter or check back later</p>
          </div>
        )}

        {/* Stats Footer */}
        {!loading && filteredContests.length > 0 && (
          <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <p className="text-gray-500">
              Showing <span className="text-white font-semibold">{filteredContests.length}</span> upcoming contests
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContestMania;
