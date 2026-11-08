import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Receipt,
  Eye,
  RefreshCw,
  CreditCard,
  Building2,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myExpenses, setMyExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, expRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/expenses'),
      ]);
      setStats(statsRes.data);
      setMyExpenses(expRes.data);
    } catch (err) {
      console.error('Failed to load employee dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-[#6C3CE8] to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/15">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
              Employee Expense Portal
            </span>
            <span className="text-purple-200 text-xs">• ID: {user?.employeeId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user?.fullName || 'Employee'}!
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl">
            Submit new expense reports, track real-time manager approvals, and monitor reimbursement payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/expenses/new"
            className="px-5 py-3 rounded-xl bg-white text-[#6C3CE8] hover:bg-purple-50 text-xs font-bold shadow-md shadow-black/10 flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Submit New Expense
          </Link>
        </div>
      </div>

      {/* 4 Personal Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submitted"
          value={formatCurrency(stats?.personalSpentThisMonth)}
          subtitle="My total expense claims"
          icon={DollarSign}
          color="purple"
          trend={{ label: 'Claims', value: `${myExpenses.length} Total`, positive: true }}
        />
        <StatCard
          title="Pending Approval"
          value={formatCurrency(stats?.personalPendingAmount)}
          subtitle="Under manager review"
          icon={Clock}
          color="amber"
          trend={{ label: 'Status', value: 'In Review Queue', positive: false }}
        />
        <StatCard
          title="Approved / Reimbursed"
          value={formatCurrency(stats?.personalApprovedAmount)}
          subtitle="Funds cleared and paid"
          icon={CheckCircle2}
          color="green"
          trend={{ label: 'Disbursed', value: 'Direct Deposit', positive: true }}
        />
        <StatCard
          title="Rejected Claims"
          value={stats?.personalRejectedCount || 0}
          subtitle="Review feedback note"
          icon={XCircle}
          color="rose"
          alert={(stats?.personalRejectedCount || 0) > 0}
          trend={{ label: 'Action', value: 'Edit & Resubmit', positive: false }}
        />
      </div>

      {/* Expense Workflow Guide Pill */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-[#6C3CE8] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Standard Expense Lifecycle
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Submit Expense → Manager Review → Finance Verification → Direct Reimbursement
            </p>
          </div>
        </div>

        <Link
          to="/expenses/new"
          className="text-xs font-bold text-[#6C3CE8] hover:underline flex items-center gap-1"
        >
          Have a receipt? Submit claim now →
        </Link>
      </div>

      {/* My Expense History Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#6C3CE8]" />
              My Expense Submissions & Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live status tracking for all submitted claims
            </p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs text-slate-500 hover:text-[#6C3CE8] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          {myExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                You haven't submitted any expenses yet.
              </p>
              <Link
                to="/expenses/new"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Your First Expense
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Expense #</th>
                  <th className="pb-3">Title & Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Receipt</th>
                  <th className="pb-3">Notes / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {exp.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {exp.category} • {exp.paymentMethod}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(exp.expenseDate)}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={exp.status} />
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
                    <td className="py-3 max-w-[200px]">
                      {exp.rejectionReason ? (
                        <span className="text-rose-600 dark:text-rose-400 text-[11px] font-medium block truncate" title={exp.rejectionReason}>
                          Reason: {exp.rejectionReason}
                        </span>
                      ) : exp.policyViolations ? (
                        <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium block truncate" title={exp.policyViolations}>
                          Warning: {exp.policyViolations}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptViewerModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </div>
  );
};
