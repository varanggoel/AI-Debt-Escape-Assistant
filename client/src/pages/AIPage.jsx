import { useState, useEffect } from 'react';
import { Bot, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AIChat from '../components/AIChat';

export default function AIPage() {
  const [advice, setAdvice] = useState(null);
  const [provider, setProvider] = useState('gemini');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdvice = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/ai/recommendations'),
      api.get('/ai/history'),
    ])
      .then(([recRes, histRes]) => {
        setAdvice(recRes.data.advice);
        setProvider(recRes.data.provider);
        setHistory(histRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load recommendations'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAdvice, []);

  const clearHistory = async () => {
    try {
      await api.delete('/ai/history');
      setHistory([]);
      toast.success('Chat history cleared');
    } catch { toast.error('Failed to clear history'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Analyzing your debt profile…</p>
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Could not load recommendations</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{error}</p>
      <button onClick={fetchAdvice} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Debt Advisor</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Personalized recommendations based on your debt profile</p>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <button onClick={clearHistory} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
          <button onClick={fetchAdvice} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-purple-900 dark:text-purple-300">Your Personalized Analysis</span>
          <span className="ml-auto text-xs text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full capitalize">{provider}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{advice}</p>
      </div>

      <AIChat initialMessages={history.length ? history : [{ role: 'ai', text: advice }]} provider={provider} onNewMessage={(msg) => setHistory((h) => [...h, msg])} />
    </div>
  );
}
