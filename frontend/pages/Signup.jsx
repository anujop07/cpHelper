import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../src/Api";
import { useTheme } from "../src/ThemeContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    if (password.length < 6) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (password.length < 10) return { level: 2, text: 'Medium', color: 'bg-yellow-500' };
    return { level: 3, text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    API.post("/auth/register", { username: name, email, password })
      .then(function() {
        setLoading(false);
        navigate("/login");
      })
      .catch(function(err) {
        setLoading(false);
        setError(err.response?.data?.message || "Signup failed");
      });
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-md">
        <div className={`rounded-xl p-8 border transition-colors duration-300 ${
          isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🚀</div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Join CP Helper
            </h1>
            <p className={isDark ? 'text-neutral-400' : 'text-gray-600'}>Create your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <span>❌</span> {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Enter your name"
                className={`w-full px-4 py-3 border rounded-lg transition-colors
                         focus:outline-none disabled:opacity-50 ${
                  isDark 
                    ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border rounded-lg transition-colors
                         focus:outline-none disabled:opacity-50 ${
                  isDark 
                    ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Create a password"
                className={`w-full px-4 py-3 border rounded-lg transition-colors
                         focus:outline-none disabled:opacity-50 ${
                  isDark 
                    ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                }`}
              />
              
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength.level >= level 
                            ? passwordStrength.color 
                            : isDark ? 'bg-neutral-700' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength.level === 1 ? 'text-red-400' :
                    passwordStrength.level === 2 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {passwordStrength.text}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-semibold rounded-lg disabled:opacity-50 transition-colors ${
                isDark 
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className={`flex-1 h-px ${isDark ? 'bg-neutral-700' : 'bg-gray-200'}`}></div>
            <span className={`px-4 text-sm ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>or</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-neutral-700' : 'bg-gray-200'}`}></div>
          </div>

          <p className={`text-center ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-medium hover:underline ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
