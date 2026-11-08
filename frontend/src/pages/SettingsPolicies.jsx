import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import {
  Settings,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  RefreshCw,
  X,
  Loader2,
  DollarSign,
  FileCheck
} from 'lucide-react';

export const SettingsPolicies = () => {
  const { user, isAdmin } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [maxLimit, setMaxLimit] = useState('');
  const [receiptRequired, setReceiptRequired] = useState(true);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/policies');
      setPolicies(res.data);
    } catch (err) {
      console.error('Failed to load policies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openEditModal = (p) => {
    setEditingPolicy(p);
    setMaxLimit(p.maxLimit?.toString() || '');
    setReceiptRequired(Boolean(p.receiptRequired));
    setDescription(p.description || '');
    setIsActive(Boolean(p.isActive));
    setModalError('');
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      await api.put(`/policies/${editingPolicy.id}`, {
        maxLimit: Number(maxLimit),
        receiptRequired,
        description,
        isActive,
      });
      setEditingPolicy(null);
      fetchPolicies();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update policy.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#6C3CE8]" />
            Expense Policies & Enterprise Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Admin console: Configure validation limits, duplicate receipt detection rules, and compliance
          </p>
        </div>

        <button
          onClick={fetchPolicies}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 w-fit"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Enterprise Policy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#6C3CE8]" />
            Loading policies...
          </div>
        ) : (
          policies.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-xs text-[#6C3CE8] bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg">
                    {p.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {p.isActive ? 'Active Rule' : 'Disabled'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {p.category.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {p.description || 'Standard corporate expenditure policy.'}
                </p>

                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Max Auto-Approval Limit:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(p.maxLimit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Receipt Mandatory:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      {p.receiptRequired ? 'Yes (Enforced)' : 'Optional'}
                    </span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-xs font-semibold text-[#6C3CE8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Configure Rule
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Policy: {editingPolicy.category}
              </h3>
              <button
                onClick={() => setEditingPolicy(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Maximum Single Expense Limit ($ USD) *
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={maxLimit}
                  onChange={(e) => setMaxLimit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Claims exceeding this amount trigger policy warnings and secondary management review.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="receiptReq"
                  checked={receiptRequired}
                  onChange={(e) => setReceiptRequired(e.target.checked)}
                  className="rounded text-[#6C3CE8] focus:ring-[#6C3CE8] w-4 h-4"
                />
                <label htmlFor="receiptReq" className="font-semibold text-slate-800 dark:text-slate-200">
                  Receipt Upload Mandatory (Auto SHA-256 duplicate verification)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#6C3CE8] focus:ring-[#6C3CE8] w-4 h-4"
                />
                <label htmlFor="isActive" className="font-semibold text-slate-800 dark:text-slate-200">
                  Policy Rule Enabled
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Description / Employee Guidelines
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] font-bold shadow-sm flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
