import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../src/ThemeContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { to: "/profile", label: "Home", icon: "🏠" },
    { to: "/coderunner", label: "Code Runner", icon: "💻" },
    { to: "/diff", label: "Diff Tester", icon: "🔥" },
    { to: "/contests", label: "Contests", icon: "🏆" },
    { to: "/rag-search", label: "CP Guide", icon: "🔍" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
      isDark ? 'bg-black border-neutral-800' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-bounce-slow">🚀</span>
            <span className={`text-xl font-bold ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}>
              CP Helper
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.to)
                    ? isDark 
                      ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                    : isDark
                      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'bg-neutral-800 text-yellow-400 hover:bg-neutral-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {token ? (
              <Link to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isDark 
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                <span>👤</span> Profile
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className={`px-4 py-2 font-medium transition-colors ${
                    isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-gray-600 hover:text-gray-900'
                  }`}>
                  Login
                </Link>
                <Link to="/signup"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isDark 
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-yellow-400' : 'text-gray-600'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-colors ${
                isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-gray-600 hover:text-gray-900'
              }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`md:hidden py-4 border-t animate-fade-in ${
            isDark ? 'border-neutral-800' : 'border-gray-200'
          }`}>
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? isDark 
                        ? 'bg-neutral-800 text-neutral-100' 
                        : 'bg-gray-100 text-gray-900'
                      : isDark 
                        ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              
              <div className={`pt-4 border-t space-y-2 ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
                {token ? (
                  <Link to="/profile" onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium text-center ${
                      isDark ? 'bg-white text-black' : 'bg-gray-900 text-white'
                    }`}>
                    👤 Profile
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-center ${
                        isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-gray-600 hover:text-gray-900'
                      }`}>
                      Login
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-medium text-center ${
                        isDark ? 'bg-white text-black' : 'bg-gray-900 text-white'
                      }`}>
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
