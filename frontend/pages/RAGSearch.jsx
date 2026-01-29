import { useState } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function RAGSearch() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: question.trim(), topK: 5 })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to use this feature');
        }
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-surface-darker to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🔍 <span className="bg-gradient-to-r from-primary-500 to-accent-cyan bg-clip-text text-transparent">
              CP Knowledge Base
            </span>
          </h1>
          <p className="text-gray-400">
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
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                         text-white placeholder-gray-500 focus:outline-none focus:border-primary-500
                         transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 
                         rounded-xl text-white font-semibold
                         hover:from-primary-400 hover:to-primary-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300"
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
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Answer */}
        {answer && (
          <div className="space-y-4">
            {/* Question */}
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-3 bg-primary-500/20 border border-primary-500/30 rounded-xl text-white">
                {answer.question}
              </div>
            </div>

            {/* AI Response */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {answer.answer}
                </div>
              </div>

              {/* Sources */}
              {answer.sources && answer.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">📚 Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {answer.sources.map((source, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400"
                      >
                        {source.source} • Page {source.page}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Response time */}
              {answer.responseTime && (
                <div className="mt-4 text-xs text-gray-500">
                  Response time: {answer.responseTime}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Questions */}
        {!answer && !loading && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Try asking:</h3>
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
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400
                             hover:bg-white/10 hover:border-primary-500/50 hover:text-white
                             transition-all duration-200"
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
