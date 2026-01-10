import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
          <div className="inline-block mb-4 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <span className="text-accent-cyan text-sm font-medium">✨ Your Ultimate CP Companion</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            🚀 Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
              CP Helper
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
            Your Ultimate Competitive Programming Companion
          </p>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Practice problems, track contests, test your code, and level up your competitive programming skills
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 md:mb-24">
          {[
            { icon: '💻', title: 'Code Runner', desc: 'Run and test your code instantly with custom inputs', delay: '0ms' },
            { icon: '🎯', title: 'Contest Mania', desc: 'Track upcoming contests from all major platforms', delay: '100ms' },
            { icon: '🔥', title: 'Diff Tester', desc: 'Compare outputs and find differences in your solutions', delay: '200ms' },
            { icon: '📊', title: 'Profile Tracking', desc: 'Monitor your progress across all platforms', delay: '300ms' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 
                         hover:bg-white/10 hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(102,126,234,0.3)]
                         transform hover:-translate-y-2 hover:scale-105
                         transition-all duration-300 ease-out cursor-pointer
                         animate-fade-in-up"
              style={{ animationDelay: feature.delay }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/10 group-hover:to-primary-600/10 transition-all duration-300"></div>
              
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 group-hover:animate-float transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur-xl opacity-30 animate-pulse-slow"></div>
            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link
                  to="/signup"
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 
                           rounded-xl text-white font-semibold text-lg
                           hover:from-primary-400 hover:to-primary-500
                           transform hover:scale-105 hover:shadow-[0_0_30px_rgba(102,126,234,0.5)]
                           transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Create Account</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                </Link>
                
                <Link
                  to="/login"
                  className="px-8 py-4 bg-transparent border-2 border-primary-500 
                           rounded-xl text-primary-400 font-semibold text-lg
                           hover:bg-primary-500/10 hover:border-primary-400 hover:text-primary-300
                           transform hover:scale-105
                           transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
              
              <p className="text-gray-400 text-sm">
                Join thousands of competitive programmers improving their skills
              </p>
            </div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="fixed bottom-10 left-1/4 w-2 h-2 bg-primary-500 rounded-full animate-float opacity-50"></div>
        <div className="fixed top-1/3 right-1/4 w-3 h-3 bg-accent-cyan rounded-full animate-float opacity-40" style={{ animationDelay: '0.5s' }}></div>
        <div className="fixed bottom-1/3 right-1/3 w-2 h-2 bg-accent-purple rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}

export default Home;
