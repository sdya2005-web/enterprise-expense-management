import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const ReimbursementModal = ({ isOpen, onClose, expense, onProcess }) => {
  const [paymentMethod, setPaymentMethod] = useState('DIRECT_DEPOSIT');
  const [transactionReference, setTransactionReference] = useState(
    () => 'ACH-' + Math.floor(10000000 + Math.random() * 90000000)
  );
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Reimbursement processed via corporate finance payroll integration.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionReference.trim()) {
      setError('Transaction reference number is required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onProcess(expense.id, {
        paymentMethod,
        transactionReference,
        paymentDate,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process reimbursement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#6C3CE8]" />
              Process Expense Reimbursement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Expense #{expense.expenseNumber} • {formatCurrency(expense.amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Recipient Details */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Beneficiary Employee:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {expense.user?.fullName} ({expense.user?.email})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Department:</span>
              <span className="text-slate-800 dark:text-slate-200">
                {expense.department?.name || 'General'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Payable Amount:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Disbursement Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
            >
              <option value="DIRECT_DEPOSIT">Direct Deposit (ACH / NEFT)</option>
              <option value="WIRE_TRANSFER">Wire Transfer</option>
              <option value="CORPORATE_CARD">Corporate Card Credit</option>
              <option value="CHEQUE">Corporate Company Cheque</option>
            </select>
          </div>

          {/* Transaction Reference & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction Reference # *
              </label>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                placeholder="e.g., TXN-994821"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Release Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Remarks & Audit Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
              placeholder="e.g., Sent via payroll batch #42"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              Confirm & Release Reimbursement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
