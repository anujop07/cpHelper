import { useState } from "react";
import API from "../src/Api";

function CodeRunner() {
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [executionTime, setExecutionTime] = useState(null);

  const languages = [
    { value: "cpp", label: "C++", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
  ];

  function handleRun() {
    if (!code.trim()) { setError("Please enter some code"); return; }
    setError("");
    setOutput("");
    setExecutionTime(null);
    setLoading(true);
    
    const startTime = Date.now();
    API.post("/run", { code, input, language })
      .then(function(response) {
        setLoading(false);
        setOutput(response.data.output || "No output");
        setExecutionTime(Date.now() - startTime);
      })
      .catch(function(err) {
        setLoading(false);
        setError(err.response?.data?.message || "Execution failed");
      });
  }

  function handleClear() { setCode(""); setInput(""); setOutput(""); setError(""); setExecutionTime(null); }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 py-8 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            💻 <span className="bg-gradient-to-r from-primary-500 to-accent-cyan bg-clip-text text-transparent">Code Runner</span>
          </h1>
          <p className="text-gray-400">Write, run, and test your code instantly</p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10">
            {languages.map((lang) => (
              <button key={lang.value} onClick={() => setLanguage(lang.value)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  language === lang.value 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                {lang.icon} {lang.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm flex items-center gap-2"><span>❌</span> {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <span className="text-white font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="ml-2">Code Editor</span>
                </span>
                <span className="text-gray-400 text-sm">{language.toUpperCase()}</span>
              </div>
              <textarea value={code} onChange={(e) => setCode(e.target.value)} disabled={loading}
                placeholder={`// Write your ${language} code here...`}
                className="w-full h-80 p-4 bg-transparent text-white font-mono text-sm resize-none outline-none
                         placeholder-gray-500 disabled:opacity-50" />
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                <span className="text-white font-medium">📥 Input</span>
              </div>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
                placeholder="Enter your input here..."
                className="w-full h-32 p-4 bg-transparent text-white font-mono text-sm resize-none outline-none
                         placeholder-gray-500 disabled:opacity-50" />
            </div>
          </div>

          {/* Output */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden h-full">
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <span className="text-white font-medium">📤 Output</span>
                {executionTime && (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    ⚡ {executionTime}ms
                  </span>
                )}
              </div>
              <div className="p-4 h-[calc(100%-3.5rem)] min-h-[400px] overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-primary-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-gray-400">Running your code...</p>
                    </div>
                  </div>
                ) : output ? (
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap break-words">{output}</pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
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
            className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                     rounded-xl text-white font-semibold text-lg
                     hover:from-green-400 hover:to-emerald-500 disabled:opacity-50
                     transform hover:scale-105 transition-all duration-300 overflow-hidden
                     shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Running...</> : <>▶ Run Code</>}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
          </button>
          
          <button onClick={handleClear} disabled={loading}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                     rounded-xl text-gray-300 hover:text-white font-semibold text-lg
                     disabled:opacity-50 transform hover:scale-105 transition-all duration-300">
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodeRunner;
