import { useState } from "react";
import API from "../src/Api";

function DiffTester() {
  const [correctCode, setCorrectCode] = useState("");
  const [testCode, setTestCode] = useState("");
  const [generatorCode, setGeneratorCode] = useState("");
  const [testCases, setTestCases] = useState(10);
  const [language, setLanguage] = useState("cpp");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    { value: "cpp", label: "C++", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
  ];

  function handleTest() {
    if (!correctCode.trim() || !testCode.trim() || !generatorCode.trim()) {
      setError("Please fill all code fields");
      return;
    }
    setError("");
    setResults(null);
    setLoading(true);

    API.post("/diff/test", { correctCode, testCode, generatorCode, testCases, language })
      .then(function(response) {
        setLoading(false);
        setResults(response.data);
      })
      .catch(function(err) {
        setLoading(false);
        setError(err.response?.data?.message || "Test failed");
      });
  }

  function handleClear() {
    setCorrectCode("");
    setTestCode("");
    setGeneratorCode("");
    setResults(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 py-8 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🔥 <span className="bg-gradient-to-r from-accent-purple to-primary-500 bg-clip-text text-transparent">Differential Tester</span>
          </h1>
          <p className="text-gray-400">Find bugs by comparing solutions with random test cases</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10">
            {languages.map((lang) => (
              <button key={lang.value} onClick={() => setLanguage(lang.value)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  language === lang.value 
                    ? 'bg-gradient-to-r from-accent-purple to-primary-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                {lang.icon} {lang.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
            <span className="text-gray-300 text-sm">Test Cases:</span>
            <input type="number" value={testCases} onChange={(e) => setTestCases(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="100"
              className="w-20 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-center
                       focus:outline-none focus:border-primary-500 transition-all" />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm flex items-center gap-2"><span>❌</span> {error}</p>
          </div>
        )}

        {/* Code Editors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {[
            { title: "Correct Solution", value: correctCode, setter: setCorrectCode, color: "green", icon: "✅", delay: '200ms' },
            { title: "Test Solution", value: testCode, setter: setTestCode, color: "yellow", icon: "🧪", delay: '300ms' },
            { title: "Input Generator", value: generatorCode, setter: setGeneratorCode, color: "blue", icon: "🎲", delay: '400ms' },
          ].map((editor) => (
            <div key={editor.title} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden animate-fade-in-up" style={{ animationDelay: editor.delay }}>
              <div className={`px-4 py-3 bg-${editor.color}-500/10 border-b border-white/10`}>
                <span className="text-white font-medium flex items-center gap-2">
                  {editor.icon} {editor.title}
                </span>
              </div>
              <textarea value={editor.value} onChange={(e) => editor.setter(e.target.value)} disabled={loading}
                placeholder={`// ${editor.title} code...`}
                className="w-full h-64 p-4 bg-transparent text-white font-mono text-sm resize-none outline-none
                         placeholder-gray-500 disabled:opacity-50" />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <button onClick={handleTest} disabled={loading}
            className="group relative px-8 py-3 bg-gradient-to-r from-accent-purple to-primary-500 
                     rounded-xl text-white font-semibold text-lg disabled:opacity-50
                     transform hover:scale-105 transition-all duration-300 overflow-hidden
                     shadow-[0_0_20px_rgba(167,139,250,0.3)]">
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Testing...</> : <>🚀 Run Tests</>}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
          </button>
          
          <button onClick={handleClear} disabled={loading}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                     rounded-xl text-gray-300 hover:text-white font-semibold text-lg
                     disabled:opacity-50 transform hover:scale-105 transition-all duration-300">
            🗑️ Clear All
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              📊 Results
              <span className={`ml-auto px-3 py-1 rounded-full text-sm ${
                results.allPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {results.allPassed ? '✅ All Passed' : `❌ ${results.failedCount || 0} Failed`}
              </span>
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.results?.map((result, index) => (
                <div key={index} className={`p-4 rounded-xl border ${result.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'} animate-fade-in`} style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Test Case #{index + 1}</span>
                    <span className={result.passed ? 'text-green-400' : 'text-red-400'}>{result.passed ? '✅ Passed' : '❌ Failed'}</span>
                  </div>
                  
                  {!result.passed && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Input</p>
                        <pre className="p-2 bg-white/5 rounded-lg text-blue-400 text-xs font-mono overflow-x-auto">{result.input}</pre>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Expected</p>
                        <pre className="p-2 bg-white/5 rounded-lg text-green-400 text-xs font-mono overflow-x-auto">{result.expected}</pre>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Got</p>
                        <pre className="p-2 bg-white/5 rounded-lg text-red-400 text-xs font-mono overflow-x-auto">{result.actual}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiffTester;
