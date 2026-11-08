import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ApprovalModal = ({ isOpen, onClose, expense, onApprove, onReject }) => {
  const [actionType, setActionType] = useState('approve'); // 'approve' or 'reject'
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (actionType === 'reject' && !comments.trim()) {
      setError('Please provide a specific rejection reason for the employee.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (actionType === 'approve') {
        await onApprove(expense.id, comments);
      } else {
        await onReject(expense.id, comments);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit decision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Review Expense Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Expense #{expense.expenseNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense Summary Details */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Employee:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {expense.user?.fullName} ({expense.user?.employeeId})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Title:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {expense.title}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Amount & Category:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCurrency(expense.amount)} • {expense.category}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Date:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {formatDate(expense.expenseDate)}
            </span>
          </div>
          {expense.policyViolations && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs mt-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>Policy Flag: {expense.policyViolations}</span>
            </div>
          )}
        </div>

        {/* Decision Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Decision Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Decision Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActionType('approve')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  actionType === 'approve'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Approve Request
              </button>
              <button
                type="button"
                onClick={() => setActionType('reject')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  actionType === 'reject'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                Reject Request
              </button>
            </div>
          </div>

          {/* Comments / Reason Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {actionType === 'reject' ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  Rejection Reason (Required) *
                </span>
              ) : (
                'Approval Comments / Notes (Optional)'
              )}
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                actionType === 'reject'
                  ? 'State why this expense cannot be approved (e.g., missing receipt, exceeds policy limit, wrong category)...'
                  : 'Add any notes for finance or the employee...'
              }
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
              required={actionType === 'reject'}
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl text-white transition-colors shadow-sm ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
