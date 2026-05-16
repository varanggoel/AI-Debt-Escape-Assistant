import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { Calculator, TrendingDown, DollarSign } from 'lucide-react';
import api from '../utils/api';

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <p className="text-sm font-medium mb-1 opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

export default function SimulatorPage() {
  const [extra, setExtra] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/simulator?extraPayment=${extra}`);
      setData(res.data);
    } catch {
      toast.error('Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); }, []);

  const buildChartData = () => {
    if (!data?.avalanche?.schedule) return [];
    const av = data.avalanche.schedule;
    const sn = data.snowball.schedule;
    const maxLen = Math.max(av.length, sn.length);
    return Array.from({ length: Math.min(maxLen, 120) }, (_, i) => {
      const avMonth = av[i];
      const snMonth = sn[i];
      const avTotal = avMonth ? avMonth.balances.reduce((s, d) => s + d.balance, 0) : 0;
      const snTotal = snMonth ? snMonth.balances.reduce((s, d) => s + d.balance, 0) : 0;
      return { month: i + 1, Avalanche: Math.round(avTotal), Snowball: Math.round(snTotal) };
    });
  };

  const fmtMonths = (m) => {
    if (!m) return '—';
    const y = Math.floor(m / 12);
    const mo = m % 12;
    return y > 0 ? `${y}y ${mo}m` : `${mo}m`;
  };

  const chartData = buildChartData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payoff Simulator</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Compare Snowball vs Avalanche strategies</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Extra monthly payment ($)
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            min="0"
            value={extra}
            onChange={(e) => setExtra(Number(e.target.value))}
            className="w-48 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
          <button
            onClick={run}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Calculator className="w-4 h-4" />
            {loading ? 'Calculating…' : 'Calculate'}
          </button>
        </div>
      </div>

      {data && data.avalanche && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Avalanche — Payoff" value={fmtMonths(data.avalanche.months)} color="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border-indigo-100 dark:border-indigo-800" />
            <StatCard label="Avalanche — Interest" value={`$${Math.round(data.avalanche.totalInterest).toLocaleString()}`} color="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border-indigo-100 dark:border-indigo-800" />
            <StatCard label="Snowball — Payoff" value={fmtMonths(data.snowball.months)} color="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-100 dark:border-purple-800" />
            <StatCard label="Snowball — Interest" value={`$${Math.round(data.snowball.totalInterest).toLocaleString()}`} color="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-100 dark:border-purple-800" />
          </div>

          {data.avalanche.totalInterest < data.snowball.totalInterest && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-5 py-4 flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Avalanche saves you ${Math.round(data.snowball.totalInterest - data.avalanche.totalInterest).toLocaleString()}</strong> in interest compared to Snowball.
              </p>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Total Balance Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="Avalanche" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Snowball" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {data && !data.avalanche && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
          <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Add debts on the dashboard first to run a simulation.</p>
        </div>
      )}
    </div>
  );
}
