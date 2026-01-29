import { useState } from 'react';
import { useTheme } from '../src/ThemeContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://cphelper-7wab.onrender.com';

function RAGSearch() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/rag/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setAnswer({
        question: question.trim(),
        answer: data.answer,
        sources: data.sources || [],
        responseTime: data.responseTime,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🔍 <span className="bg-gradient-to-r from-primary-400 to-accent-cyan bg-clip-text text-transparent">
              CP Knowledge Base
            </span>
          </h1>
          <p className={isDark ? 'text-neutral-400' : 'text-gray-600'}>
            Ask questions about competitive programming concepts
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about binary search, DP, graphs..."
              className={`flex-1 px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-neutral-850 border-neutral-700 text-white placeholder-neutral-500 focus:border-primary-500/70 focus:ring-primary-500/30'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500/30'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-3.5 bg-primary-500 hover:bg-primary-400
                         rounded-xl text-white font-semibold
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Thinking...
                </span>
              ) : 'Ask'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Answer */}
        {answer && (
          <div className="space-y-4">
            {/* Question */}
            <div className="flex justify-end">
              <div className={`max-w-[80%] px-4 py-3 rounded-xl ${
                isDark 
                  ? 'bg-neutral-800 border border-neutral-700 text-white'
                  : 'bg-gray-100 border border-gray-200 text-gray-900'
              }`}>
                {answer.question}
              </div>
            </div>

            {/* AI Response - Knowledge Card */}
            <div className={`rounded-xl overflow-hidden border ${
              isDark ? 'bg-neutral-850 border-neutral-700/50' : 'bg-white border-gray-200'
            }`}>
              {/* Card Header */}
              <div className={`px-5 py-3 border-b flex items-center gap-2 ${
                isDark ? 'bg-neutral-800/50 border-neutral-700/50' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                <span className={`text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>AI Response</span>
              </div>
              
              {/* Card Body with Left Accent */}
              <div className="p-5 border-l-2 border-primary-500/60 ml-4">
                <div className={`leading-relaxed whitespace-pre-wrap text-[15px] max-w-prose ${
                  isDark ? 'text-neutral-200' : 'text-gray-800'
                }`}>
                  {answer.answer}
                </div>
              </div>

              {/* Sources Footer */}
              {answer.sources && answer.sources.length > 0 && (
                <div className={`px-5 py-4 border-t ${
                  isDark ? 'bg-neutral-800/30 border-neutral-700/50' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                    isDark ? 'text-neutral-400' : 'text-gray-500'
                  }`}>📚 Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {answer.sources.map((source, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                          isDark 
                            ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                            : 'bg-gray-100 border-gray-200 text-gray-700'
                        }`}
                      >
                        {source.source} • p.{source.page}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Response time */}
              {answer.responseTime && (
                <div className={`px-5 py-2 text-xs border-t ${
                  isDark ? 'text-neutral-500 border-neutral-700/30' : 'text-gray-500 border-gray-200'
                }`}>
                  ⚡ {answer.responseTime}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Questions */}
        {!answer && !loading && (
          <div className="mt-10">
            <h3 className={`text-xs font-medium uppercase tracking-wide mb-4 ${
              isDark ? 'text-neutral-500' : 'text-gray-500'
            }`}>Try asking:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'How does binary search work?',
                'Explain dynamic programming',
                'What is a segment tree?',
                'How to detect cycles in a graph?'
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className={`px-3.5 py-2 rounded-lg text-sm border transition-all duration-150 ${
                    isDark 
                      ? 'bg-neutral-850 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:border-neutral-600 hover:text-neutral-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RAGSearch;
