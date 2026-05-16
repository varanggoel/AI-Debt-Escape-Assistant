import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Calendar, TrendingUp } from 'lucide-react';

const DEBT_TYPE_LABELS = {
  credit_card: 'Credit Card',
  student_loan: 'Student Loan',
  personal_loan: 'Personal Loan',
  mortgage: 'Mortgage',
  auto_loan: 'Auto Loan',
  medical: 'Medical',
  other: 'Other',
};

function AprBadge({ rate }) {
  if (rate > 20) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">High Interest</span>;
  if (rate >= 10) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Moderate</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Low Interest</span>;
}

export default function DebtCard({ debt, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{debt.name}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
            {DEBT_TYPE_LABELS[debt.type] || debt.type}
          </span>
        </div>
        <AprBadge rate={debt.interestRate} />
      </div>

      <div className="text-3xl font-bold text-gray-900 mb-4">
        ${debt.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
          <span>{debt.interestRate}% APR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-xs">Min:</span>
          <span>${debt.minPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo</span>
        </div>
        {debt.dueDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Due {debt.dueDate}th</span>
          </div>
        )}
      </div>

      {debt.notes && (
        <p className="text-xs text-gray-500 italic mb-3 border-t border-gray-100 pt-3">{debt.notes}</p>
      )}

      <div className="flex gap-2 border-t border-gray-100 pt-3">
        <button
          onClick={() => navigate(`/debts/${debt._id}/edit`)}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={() => {
            if (window.confirm(`Delete "${debt.name}"?`)) onDelete(debt._id);
          }}
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
