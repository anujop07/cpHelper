import { Link } from 'react-router-dom';
import { useTheme } from '../src/ThemeContext';

function Home() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className={`inline-block mb-6 px-4 py-1.5 rounded-full border ${
            isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <span className={isDark ? 'text-neutral-300 text-sm' : 'text-gray-600 text-sm'}>
              ✨ Your Ultimate CP Companion
            </span>
          </div>
          
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            🚀 Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-400 to-accent-cyan bg-clip-text text-transparent">
              CP Helper
            </span>
          </h1>
          
          <p className={`text-xl mb-4 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Your Ultimate Competitive Programming Companion
          </p>
          
          <p className={`max-w-2xl mx-auto text-base leading-relaxed ${
            isDark ? 'text-neutral-500' : 'text-gray-500'
          }`}>
            Practice problems, track contests, test your code, and level up your competitive programming skills
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {[
            { icon: '💻', title: 'Code Runner', desc: 'Run and test your code instantly with custom inputs' },
            { icon: '🎯', title: 'Contest Mania', desc: 'Track upcoming contests from all major platforms' },
            { icon: '🔥', title: 'Diff Tester', desc: 'Compare outputs and find differences in your solutions' },
            { icon: '📊', title: 'Profile Tracking', desc: 'Monitor your progress across all platforms' },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`rounded-xl p-6 border transition-colors duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-neutral-850 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <div className="text-4xl mb-4">
                {feature.icon}
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className={`rounded-xl p-8 md:p-12 border max-w-xl mx-auto ${
            isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ready to Get Started?
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                to="/signup"
                className={`px-6 py-3 font-semibold rounded-lg transition-colors duration-200 ${
                  isDark 
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Create Account
              </Link>
              
              <Link
                to="/login"
                className={`px-6 py-3 border rounded-lg font-semibold transition-colors duration-200 ${
                  isDark 
                    ? 'bg-transparent border-neutral-600 text-white hover:bg-neutral-800 hover:border-neutral-500'
                    : 'bg-transparent border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                Sign In
              </Link>
            </div>
            
            <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>
              Join thousands of competitive programmers improving their skills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
