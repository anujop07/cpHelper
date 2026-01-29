import { useState } from "react";
import API from "../src/Api";
import { useTheme } from "../src/ThemeContext";

function DiffTester() {
  const [correctCode, setCorrectCode] = useState("");
  const [testCode, setTestCode] = useState("");
  const [testCases, setTestCases] = useState(100);
  const [vMin, setVMin] = useState(1);
  const [vMax, setVMax] = useState(1000);
  const [language, setLanguage] = useState("cpp");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    { value: "cpp", label: "C++", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
  ];

  function handleTest() {
    if (!correctCode.trim() || !testCode.trim()) {
      setError("Please fill both code fields");
      return;
    }
    if (vMin > vMax) {
      setError("Min value cannot be greater than Max value");
      return;
    }
    setError("");
    setResults(null);
    setLoading(true);

    API.post("/differential/test", { 
      oracleCode: correctCode, 
      candidateCode: testCode, 
      maxTestcases: testCases,
      vMin: vMin,
      vMax: vMax,
      language
    })
      .then(function(response) {
        setLoading(false);
        setResults(response.data);
      })
      .catch(function(err) {
        setLoading(false);
        setError(err.response?.data?.error || err.response?.data?.message || "Test failed");
      });
  }

  function handleClear() {
    setCorrectCode("");
    setTestCode("");
    setTestCases(100);
    setVMin(1);
    setVMax(1000);
    setResults(null);
    setError("");
  }

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🔥 <span className="bg-gradient-to-r from-accent-purple to-primary-500 bg-clip-text text-transparent">Differential Tester</span>
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Find bugs by comparing solutions with random test cases</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className={`inline-flex backdrop-blur-md rounded-xl p-1 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            {languages.map((lang) => (
              <button key={lang.value} onClick={() => setLanguage(lang.value)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  language === lang.value 
                    ? 'bg-gradient-to-r from-accent-purple to-primary-500 text-white shadow-lg' 
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                {lang.icon} {lang.label}
              </button>
            ))}
          </div>
          
          <div className={`flex items-center gap-3 backdrop-blur-md rounded-xl px-4 py-2 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Test Cases:</span>
            <input type="number" value={testCases} onChange={(e) => setTestCases(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="1000"
              className={`w-20 px-3 py-1 border rounded-lg text-center focus:outline-none focus:border-primary-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
          </div>

          <div className={`flex items-center gap-3 backdrop-blur-md rounded-xl px-4 py-2 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Min Value:</span>
            <input type="number" value={vMin} onChange={(e) => setVMin(parseInt(e.target.value) || 0)}
              className={`w-24 px-3 py-1 border rounded-lg text-center focus:outline-none focus:border-primary-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
          </div>

          <div className={`flex items-center gap-3 backdrop-blur-md rounded-xl px-4 py-2 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Max Value:</span>
            <input type="number" value={vMax} onChange={(e) => setVMax(parseInt(e.target.value) || 100)}
              className={`w-24 px-3 py-1 border rounded-lg text-center focus:outline-none focus:border-primary-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm flex items-center gap-2"><span>❌</span> {error}</p>
          </div>
        )}

        {/* Code Editors - Now 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[
            { title: "Correct Solution", value: correctCode, setter: setCorrectCode, color: "green", icon: "✅", delay: '200ms' },
            { title: "Test Solution", value: testCode, setter: setTestCode, color: "yellow", icon: "🧪", delay: '300ms' },
          ].map((editor) => (
            <div key={editor.title} className={`backdrop-blur-md rounded-2xl border overflow-hidden animate-fade-in-up ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} style={{ animationDelay: editor.delay }}>
              <div className={`px-4 py-3 border-b ${isDark ? `bg-${editor.color}-500/10 border-white/10` : 'bg-gray-50 border-gray-200'}`}>
                <span className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editor.icon} {editor.title}
                </span>
              </div>
              <textarea value={editor.value} onChange={(e) => editor.setter(e.target.value)} disabled={loading}
                placeholder={`// ${editor.title} code...`}
                className={`w-full h-64 p-4 bg-transparent font-mono text-sm resize-none outline-none disabled:opacity-50 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`} />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <button onClick={handleTest} disabled={loading}
            className="group relative px-8 py-3 bg-gradient-to-r from-accent-purple to-primary-500 
                     rounded-xl text-white font-semibold text-lg disabled:opacity-50
                     transform hover:scale-105 transition-all duration-300 overflow-hidden
                     shadow-[0_0_20px_rgba(167,139,250,0.3)]">
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Finding...</> : <>🧪 Find Failing Testcase</>}
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
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📊 Results
              <span className={`ml-auto px-3 py-1 rounded-full text-sm ${
                results.status === 'NO_FAILING_TESTCASE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {results.status === 'NO_FAILING_TESTCASE' ? '✅ All Passed' : `❌ Found ${results.statistics?.totalFailing || 1} Failing`}
              </span>
            </h2>

            <p className="text-gray-300 mb-4">{results.message}</p>

            {/* Statistics */}
            {results.statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Tested</p>
                  <p className="text-white font-bold text-lg">{results.statistics.totalTested}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Failed</p>
                  <p className="text-red-400 font-bold text-lg">{results.statistics.totalFailing}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Time</p>
                  <p className="text-white font-bold text-lg">{(results.statistics.totalTimeMs / 1000).toFixed(2)}s</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Speed</p>
                  <p className="text-white font-bold text-lg">{results.statistics.testcasesPerSecond}/s</p>
                </div>
              </div>
            )}

            {/* Failing Testcase Details */}
            {results.smallestFailingTestcase && (
              <div className="p-4 rounded-xl border bg-red-500/5 border-red-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">🐛 Smallest Failing Testcase (n={results.smallestFailingTestcase.n})</span>
                  <span className="text-red-400">❌ {results.smallestFailingTestcase.failureReason}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Input</p>
                    <pre className="p-2 bg-white/5 rounded-lg text-blue-400 text-xs font-mono overflow-x-auto max-h-32">{results.smallestFailingTestcase.input}</pre>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Expected (Correct)</p>
                    <pre className="p-2 bg-white/5 rounded-lg text-green-400 text-xs font-mono overflow-x-auto max-h-32">{results.smallestFailingTestcase.oracleOutput || results.smallestFailingTestcase.oracleStatus}</pre>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Got (Test)</p>
                    <pre className="p-2 bg-white/5 rounded-lg text-red-400 text-xs font-mono overflow-x-auto max-h-32">{results.smallestFailingTestcase.candidateOutput || results.smallestFailingTestcase.candidateStatus}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Note when no failing found */}
            {results.note && (
              <p className="text-yellow-400/70 text-sm mt-4 italic">⚠️ {results.note}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DiffTester;

