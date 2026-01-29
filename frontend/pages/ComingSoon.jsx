import { useTheme } from "../src/ThemeContext";

function ComingSoon() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-cyan/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-primary-500/10 to-accent-purple/10 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-500 rounded-full animate-float opacity-50"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-accent-cyan rounded-full animate-float opacity-40" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-accent-purple rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary-400 rounded-full animate-float opacity-50" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto animate-scale-in">
        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan rounded-3xl blur opacity-20 animate-pulse-slow"></div>
          
          <div className="relative">
            {/* Animated Icon */}
            <div className="mb-8">
              <div className="inline-block text-7xl md:text-8xl animate-bounce-slow">🚧</div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                Coming Soon
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-300 mb-8">
              We're cooking something amazing! 🔥
            </p>

            <p className="text-gray-400 mb-8 leading-relaxed">
              This feature is currently under development. Our team is working hard to bring you 
              an incredible experience. Stay tuned for updates!
            </p>

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-gray-400 text-sm">Development Progress</span>
              </div>
              <div className="w-full max-w-xs mx-auto h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full animate-pulse-slow" style={{ width: '65%' }}></div>
              </div>
            </div>

            {/* Features coming */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '🏆', text: 'Contest Tracking' },
                { icon: '📅', text: 'Calendar View' },
                { icon: '🔔', text: 'Reminders' },
              ].map((feature, index) => (
                <div key={feature.text} className="bg-white/5 rounded-xl p-4 border border-white/10 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <p className="text-gray-300 text-sm">{feature.text}</p>
                </div>
              ))}
            </div>

            {/* Back button */}
            <a href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 
                       rounded-xl text-white font-semibold
                       hover:from-primary-400 hover:to-primary-500
                       transform hover:scale-105 transition-all duration-300
                       shadow-[0_0_20px_rgba(102,126,234,0.3)]">
              <span>←</span> Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;
