import { useState } from "react";
import API from "../src/Api";
import { useTheme } from "../src/ThemeContext";

function CodeRunner() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const { isDark } = useTheme();

  const languages = [
    { value: "cpp", label: "C++", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "javascript", label: "JavaScript", icon: "🟨" },
  ];

  function handleRun() {
    setLoading(true);
    setOutput("");
    setError("");
    setExecutionTime(null);
    const startTime = Date.now();
    
    API.post("/code/run", { code, language, input })
      .then(function(response) {
        setExecutionTime(Date.now() - startTime);
        setOutput(response.data.output || "");
        if (response.data.error) setError(response.data.error);
        setLoading(false);
      })
      .catch(function(err) {
        setExecutionTime(Date.now() - startTime);
        setError(err.response?.data?.error || "Failed to run code");
        setLoading(false);
      });
  }

  function handleClear() { setCode(""); setInput(""); setOutput(""); setError(""); setExecutionTime(null); }

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            💻 <span className="bg-gradient-to-r from-primary-400 to-accent-cyan bg-clip-text text-transparent">Code Runner</span>
          </h1>
          <p className={isDark ? 'text-neutral-400' : 'text-gray-600'}>Write, run, and test your code instantly</p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className={`inline-flex rounded-lg p-1 border ${isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-white border-gray-200'}`}>
            {languages.map((lang) => (
              <button key={lang.value} onClick={() => setLanguage(lang.value)}
                className={`px-5 py-2 rounded-md font-medium transition-all duration-200 ${
                  language === lang.value 
                    ? isDark ? 'bg-neutral-700 text-white' : 'bg-gray-100 text-gray-900'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-gray-500 hover:text-gray-900'
                }`}>
                {lang.icon} {lang.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm flex items-center gap-2"><span>❌</span> {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-gray-50 border-gray-200'}`}>
                <span className={`font-medium flex items-center gap-2 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="ml-2 text-sm">Editor</span>
                </span>
                <span className={`text-xs font-mono ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>{language.toUpperCase()}</span>
              </div>
              <textarea value={code} onChange={(e) => setCode(e.target.value)} disabled={loading}
                placeholder={`// Write your ${language} code here...`}
                className={`w-full h-80 p-4 bg-transparent font-mono text-sm resize-none outline-none disabled:opacity-50 ${
                  isDark ? 'text-white placeholder-neutral-600' : 'text-gray-900 placeholder-gray-400'
                }`} />
            </div>

            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
              <div className={`px-4 py-2.5 border-b ${isDark ? 'bg-neutral-750 border-neutral-700' : 'bg-gray-50 border-gray-200'}`}>
                <span className={`font-medium text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>📥 Input</span>
              </div>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
                placeholder="Enter your input here..."
                className={`w-full h-32 p-4 bg-transparent font-mono text-sm resize-none outline-none disabled:opacity-50 ${
                  isDark ? 'text-white placeholder-neutral-600' : 'text-gray-900 placeholder-gray-400'
                }`} />
            </div>
          </div>

          {/* Output */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className={`rounded-xl border overflow-hidden h-full ${isDark ? 'bg-neutral-850 border-neutral-700' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-gray-50 border-gray-200'}`}>
                <span className={`font-medium text-sm ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>📤 Output</span>
                {executionTime && (
                  <span className="text-green-400 text-xs flex items-center gap-1 font-mono">
                    ⚡ {executionTime}ms
                  </span>
                )}
              </div>
              <div className="p-4 h-[calc(100%-2.75rem)] min-h-[400px] overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-primary-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Running your code...</p>
                    </div>
                  </div>
                ) : output ? (
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap break-words">{output}</pre>
                ) : (
                  <div className={`flex items-center justify-center h-full ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🚀</div>
                      <p>Run your code to see output</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <button onClick={handleRun} disabled={loading}
            className="px-8 py-3 bg-green-600 hover:bg-green-500
                     rounded-xl text-white font-semibold text-lg
                     disabled:opacity-50 transition-colors duration-200">
            <span className="flex items-center gap-2">
              {loading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Running...</> : <>▶ Run Code</>}
            </span>
          </button>
          
          <button onClick={handleClear} disabled={loading}
            className={`px-8 py-3 border rounded-xl font-semibold text-lg disabled:opacity-50 transition-colors duration-200 ${
              isDark 
                ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300 hover:text-white'
                : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-600 hover:text-gray-900'
            }`}>
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodeRunner;
