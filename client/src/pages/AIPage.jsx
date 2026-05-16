import { useState, useEffect } from 'react';
import { Bot, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import AIChat from '../components/AIChat';

export default function AIPage() {
  const [advice, setAdvice] = useState(null);
  const [provider, setProvider] = useState('gemini');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdvice = () => {
    setLoading(true);
    setError('');
    api
      .get('/ai/recommendations')
      .then((res) => {
        setAdvice(res.data.advice);
        setProvider(res.data.provider);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load recommendations'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAdvice, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
        <p className="text-gray-500 text-sm">Analyzing your debt profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Could not load recommendations</h2>
        <p className="text-gray-500 text-sm mb-5">{error}</p>
        <button
          onClick={fetchAdvice}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Debt Advisor</h1>
          <p className="text-gray-500 text-sm mt-0.5">Personalized recommendations based on your debt profile</p>
        </div>
        <button
          onClick={fetchAdvice}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-900">Your Personalized Analysis</span>
          <span className="ml-auto text-xs text-purple-400 bg-purple-100 px-2 py-0.5 rounded-full capitalize">{provider}</span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{advice}</p>
      </div>

      <AIChat initialMessage={advice} provider={provider} />
    </div>
  );
}
