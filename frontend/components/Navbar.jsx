import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");

  const navLinks = [
    { to: "/profile", label: "Home", icon: "🏠" },
    { to: "/coderunner", label: "Code Runner", icon: "💻" },
    { to: "/diff", label: "Diff Tester", icon: "🔥" },
    { to: "/contests", label: "Contests", icon: "🏆" },
    { to: "/rag-search", label: "CP Guide", icon: "🔍" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-surface-dark/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-bounce-slow">🚀</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-cyan bg-clip-text text-transparent">
              CP Helper
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive(link.to)
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <Link to="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 
                         rounded-lg text-white font-medium hover:from-primary-400 hover:to-primary-500
                         transform hover:scale-105 transition-all duration-300">
                <span>👤</span> Profile
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 
                           rounded-lg text-white font-medium hover:from-primary-400 hover:to-primary-500
                           transform hover:scale-105 transition-all duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isActive(link.to)
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/10 space-y-2">
                {token ? (
                  <Link to="/profile" onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 
                             rounded-lg text-white font-medium text-center">
                    👤 Profile
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-gray-400 hover:text-white text-center">
                      Login
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 
                               rounded-lg text-white font-medium text-center">
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
