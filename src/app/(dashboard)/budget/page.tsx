"use client";

import { PlusCircle, Trash2, PiggyBank, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const EXPENSE_CATEGORIES = ["Housing", "Food", "Transport", "Utilities", "Healthcare", "Entertainment", "Shopping", "Education", "Other"];

interface ExpenseRow {
  category: string;
  amount: string | number;
}

const PLACEHOLDER_BUDGET: { income: number; expenses: ExpenseRow[] } = {
  income: 50000,
  expenses: [
    { category: "Housing", amount: 14000 },
    { category: "Food", amount: 8000 },
    { category: "Transport", amount: 3500 },
    { category: "Utilities", amount: 2000 },
    { category: "Entertainment", amount: 3000 },
    { category: "Healthcare", amount: 1500 },
    { category: "Shopping", amount: 4000 },
    { category: "Education", amount: 2000 },
  ],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [income, setIncome] = useState<string | number>("");
  const [expenses, setExpenses] = useState<ExpenseRow[]>([{ category: "Housing", amount: "" }]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  useEffect(() => {
    setFetching(true);
    fetch(`/api/budget?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setIncome(data.income);
          setExpenses(data.expenses.length ? data.expenses : [{ category: "Housing", amount: "" }]);
          setIsPlaceholder(false);
        } else {
          setIncome(PLACEHOLDER_BUDGET.income);
          setExpenses(PLACEHOLDER_BUDGET.expenses);
          setIsPlaceholder(true);
        }
      })
      .catch(() => {
        setIncome(PLACEHOLDER_BUDGET.income);
        setExpenses(PLACEHOLDER_BUDGET.expenses);
        setIsPlaceholder(true);
      })
      .finally(() => setFetching(false));
  }, [month, year]);

  const addExpense = () => setExpenses([...expenses, { category: "Other", amount: "" }]);
  const removeExpense = (i: number) => setExpenses(expenses.filter((_, idx) => idx !== i));
  const updateExpense = (i: number, field: keyof ExpenseRow, value: string) => {
    const updated = [...expenses];
    updated[i] = { ...updated[i], [field]: value };
    setExpenses(updated);
  };

  const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(String(e.amount)) || 0), 0);
  const surplus = (parseFloat(String(income)) || 0) - totalExpenses;

  const handleSave = async () => {
    if (!income) return toast.error("Enter your monthly income");
    setLoading(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          income: parseFloat(String(income)),
          expenses: expenses
            .filter((e) => e.amount)
            .map((e) => ({ category: e.category, amount: parseFloat(String(e.amount)) })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setIsPlaceholder(false);
      toast.success("Budget saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Track income &amp; expenses to find your debt payment surplus</p>
      </div>

      <div className="flex gap-3">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputCls}>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls}>
          {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {fetching ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
      ) : (
        <>
          {isPlaceholder && (
            <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl px-4 py-3">
              <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                No budget saved for this month yet. We&apos;ve filled in a <strong>sample Indian household budget</strong> — edit the values to match your own and click Save.
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Income (₹)</label>
              <input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="50000" className={`${inputCls} w-full`} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expenses</label>
                <button onClick={addExpense} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  <PlusCircle className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {expenses.map((exp, i) => (
                  <div key={i} className="flex gap-2">
                    <select value={exp.category} onChange={(e) => updateExpense(i, "category", e.target.value)} className={`${inputCls} flex-1`}>
                      {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" min="0" value={exp.amount} onChange={(e) => updateExpense(i, "amount", e.target.value)} placeholder="0" className={`${inputCls} w-28`} />
                    <button onClick={() => removeExpense(i)} className="text-red-400 hover:text-red-600 p-1" aria-label="Remove expense">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                <p className="font-bold text-gray-900 dark:text-white">{inr(parseFloat(String(income)) || 0)}</p>
              </div>
              <div className="text-center">
                <TrendingDown className="w-4 h-4 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
                <p className="font-bold text-gray-900 dark:text-white">{inr(totalExpenses)}</p>
              </div>
              <div className="text-center">
                <PiggyBank className={`w-4 h-4 mx-auto mb-1 ${surplus >= 0 ? "text-indigo-500" : "text-orange-500"}`} />
                <p className="text-xs text-gray-500 dark:text-gray-400">Surplus</p>
                <p className={`font-bold ${surplus >= 0 ? "text-indigo-700 dark:text-indigo-400" : "text-orange-600"}`}>
                  {inr(surplus)}
                </p>
              </div>
            </div>

            {surplus > 0 && (
              <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                You have <strong>{inr(surplus)}</strong> available for extra debt payments this month. Use the Simulator to see how it accelerates your payoff.
              </p>
            )}

            <button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
              {loading ? "Saving…" : "Save budget"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
