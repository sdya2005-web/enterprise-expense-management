import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { ApprovalModal } from '../components/ApprovalModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  PieChart,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [departmentExpenses, setDepartmentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedApprovalExpense, setSelectedApprovalExpense] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        api.get('/expenses/pending-approvals'),
        api.get('/expenses'),
      ]);
      setPendingExpenses(pendingRes.data);
      setDepartmentExpenses(allRes.data);
    } catch (err) {
      console.error('Failed to load manager dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (expenseId, comments) => {
    await api.post(`/expenses/${expenseId}/approve`, { comments });
    fetchData();
  };

  const handleReject = async (expenseId, comments) => {
    await api.post(`/expenses/${expenseId}/reject`, { comments });
    fetchData();
  };

  const totalDeptSpent = departmentExpenses.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );
  const approvedCount = departmentExpenses.filter(
    (e) => e.status === 'APPROVED' || e.status === 'FINANCE_VERIFICATION' || e.status === 'REIMBURSED'
  ).length;
  const rejectedCount = departmentExpenses.filter((e) => e.status === 'REJECTED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-950/15">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
              Department Management Portal
            </span>
            <span className="text-amber-200 text-xs">• {user?.departmentName || 'Engineering'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Manager Console: {user?.fullName || 'Manager'}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl">
            Review team reimbursement claims, verify attached receipts, approve budgets, and maintain department spending compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/approvals"
            className="px-5 py-3 rounded-xl bg-white text-amber-800 hover:bg-amber-50 text-xs font-bold shadow-md shadow-black/10 flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <Clock className="w-4 h-4" />
            Review Queue ({pendingExpenses.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Approvals"
          value={pendingExpenses.length}
          subtitle="Requests awaiting your review"
          icon={Clock}
          color="amber"
          alert={pendingExpenses.length > 0}
          trend={{ label: 'Status', value: pendingExpenses.length > 0 ? 'Action Required' : 'Up to date', positive: pendingExpenses.length === 0 }}
        />
        <StatCard
          title="Department Expenses"
          value={formatCurrency(totalDeptSpent)}
          subtitle="Total claims in department"
          icon={DollarSign}
          color="purple"
          trend={{ label: 'Total Claims', value: `${departmentExpenses.length} Claims`, positive: true }}
        />
        <StatCard
          title="Approved Claims"
          value={approvedCount}
          subtitle="Forwarded to Finance"
          icon={CheckCircle2}
          color="green"
          trend={{ label: 'Reimbursement', value: 'Processing', positive: true }}
        />
        <StatCard
          title="Rejected Claims"
          value={rejectedCount}
          subtitle="Non-compliant requests"
          icon={XCircle}
          color="rose"
          trend={{ label: 'Audited', value: 'With reasons', positive: false }}
        />
      </div>

      {/* Pending Approvals Queue */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Pending Employee Requests ({pendingExpenses.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verify receipt documents and decide on reimbursement claims
            </p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs text-slate-500 hover:text-amber-600 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          {pendingExpenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              No pending approval requests. Your queue is clean!
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Expense #</th>
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Title & Purpose</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Receipt</th>
                  <th className="pb-3 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {exp.user?.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {exp.user?.employeeId}
                      </div>
                    </td>
                    <td className="py-3 max-w-[220px]">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {exp.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {exp.businessPurpose}
                      </div>
                      {exp.policyViolations && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-semibold mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          {exp.policyViolations}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {exp.category}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3">
                      {exp.receipts && exp.receipts.length > 0 ? (
                        <button
                          onClick={() => setSelectedReceipt(exp.receipts[0])}
                          className="inline-flex items-center gap-1 text-[11px] text-[#6C3CE8] hover:underline font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No receipt</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedApprovalExpense(exp)}
                        className="px-3 py-1.5 rounded-xl bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        Review & Decide
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
