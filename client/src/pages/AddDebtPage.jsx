import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import DebtForm from '../components/DebtForm';

export default function AddDebtPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/debts/${id}`)
      .then((res) => setInitialValues(res.data))
      .catch(() => { toast.error('Debt not found'); navigate('/'); })
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/debts/${id}`, form);
        toast.success('Debt updated');
      } else {
        await api.post('/debts', form);
        toast.success('Debt added');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save debt');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{isEdit ? 'Edit debt' : 'Add new debt'}</h1>
        <p className="text-gray-500 text-sm mb-6">
          {isEdit ? 'Update the details for this debt.' : 'Enter the details of a debt you want to track.'}
        </p>
        <DebtForm
          initialValues={initialValues || undefined}
          onSubmit={handleSubmit}
          loading={loading}
          mode={isEdit ? 'edit' : 'create'}
        />
      </div>
    </div>
  );
}
