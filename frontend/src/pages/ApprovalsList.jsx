import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { ApprovalModal } from '../components/ApprovalModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  CheckSquare,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  FileText,
  User,
  Building2,
  Calendar
} from 'lucide-react';

export const ApprovalsList = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedApprovalExpense, setSelectedApprovalExpense] = useState(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses/pending-approvals');
      setPendingExpenses(res.data);
    } catch (err) {
      console.error('Failed to load approvals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id, comments) => {
    await api.post(`/expenses/${id}/approve`, { comments });
    fetchApprovals();
  };

  const handleReject = async (id, comments) => {
    await api.post(`/expenses/${id}/reject`, { comments });
    fetchApprovals();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#6C3CE8]" />
            Expense Approval Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {pendingExpenses.length} claims awaiting management decision
          </p>
        </div>
        <button
          onClick={fetchApprovals}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
      </div>

      {/* Main List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#6C3CE8]" />
            Loading approval queue...
          </div>
        ) : pendingExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Pending Approval Requests
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              All employee expense claims in your scope have been reviewed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      #{exp.expenseNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-[#6C3CE8] dark:bg-purple-900/40 dark:text-purple-300">
                      {exp.category}
                    </span>
                    <StatusBadge status={exp.status} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {exp.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {exp.businessPurpose}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {exp.user?.fullName} ({exp.user?.employeeId})
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {exp.department?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(exp.expenseDate)}
                    </span>
                  </div>

                  {exp.policyViolations && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 mt-2 w-fit">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>{exp.policyViolations}</span>
                    </div>
                  )}
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right">
                    <div className="text-xs text-slate-400">Claim Amount</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {exp.receipts && exp.receipts.length > 0 && (
                      <button
                        onClick={() => setSelectedReceipt(exp.receipts[0])}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedApprovalExpense(exp)}
                      className="px-4 py-1.5 rounded-xl bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      Review Claim
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ReceiptViewerModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />

      <ApprovalModal
        isOpen={Boolean(selectedApprovalExpense)}
        onClose={() => setSelectedApprovalExpense(null)}
        expense={selectedApprovalExpense}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
