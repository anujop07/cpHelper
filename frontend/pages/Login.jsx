import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../src/Api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    API.post("/auth/login", { email, password })
      .then(function(response) {
        setLoading(false);
        localStorage.setItem("token", response.data.token);
        navigate("/profile");
      })
      .catch(function(err) {
        setLoading(false);
        setError(err.response?.data?.message || "Login failed");
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl blur opacity-20 animate-pulse-slow"></div>
          
          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-block mb-4 text-5xl animate-bounce-slow">🔐</div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to CP Helper</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span>❌</span> {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400
                           focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30 focus:bg-white/15
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400
                           focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30 focus:bg-white/15
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 
                         rounded-xl text-white font-semibold text-lg
                         hover:from-primary-400 hover:to-primary-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transform hover:scale-[1.02] active:scale-[0.98]
                         transition-all duration-300 overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <>
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="px-4 text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <p className="text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
