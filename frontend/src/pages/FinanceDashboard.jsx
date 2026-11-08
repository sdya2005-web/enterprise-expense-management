import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { ReimbursementModal } from '../components/ReimbursementModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  CreditCard,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Send,
  FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FinanceDashboard = () => {
  const { user } = useAuth();
  const [forFinanceExpenses, setForFinanceExpenses] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedReimburseExpense, setSelectedReimburseExpense] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [financeRes, reimbRes] = await Promise.all([
        api.get('/expenses/for-finance'),
        api.get('/reimbursements'),
      ]);
      setForFinanceExpenses(financeRes.data);
      setReimbursements(reimbRes.data);
    } catch (err) {
      console.error('Failed to load finance dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessReimbursement = async (expenseId, payload) => {
    await api.post(`/reimbursements/process/${expenseId}`, payload);
    fetchData();
  };

  const totalReimbursedAmount = reimbursements.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );

  const pendingDisbursement = forFinanceExpenses.filter(
    (e) => e.status !== 'REIMBURSED'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/15">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
              Corporate Finance & Treasury
            </span>
            <span className="text-emerald-200 text-xs">• Fiscal Officer: {user?.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Finance & Reimbursement Desk
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Disburse approved employee expense claims, issue payment reference IDs, verify receipts, and generate corporate financial statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="px-5 py-3 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow-md shadow-black/10 flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Financial Reports & Export
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Awaiting Payout"
          value={pendingDisbursement.length}
          subtitle="Manager-approved expenses"
          icon={Clock}
          color="amber"
          alert={pendingDisbursement.length > 0}
          trend={{ label: 'Payable Amount', value: formatCurrency(pendingDisbursement.reduce((s, e) => s + (e.amount || 0), 0)), positive: false }}
        />
        <StatCard
          title="Total Reimbursed"
          value={formatCurrency(totalReimbursedAmount)}
          subtitle="Disbursed this fiscal term"
          icon={DollarSign}
          color="green"
          trend={{ label: 'Completed', value: `${reimbursements.length} Transferred`, positive: true }}
        />
        <StatCard
          title="Avg Payout Turnaround"
          value="< 24 Hours"
          subtitle="Submission to settlement"
          icon={ShieldCheck}
          color="purple"
          trend={{ label: 'SLA Status', value: '100% On-time', positive: true }}
        />
        <StatCard
          title="Payment Channels"
          value="ACH / Wire"
          subtitle="Direct deposit & Corporate"
          icon={CreditCard}
          color="blue"
          trend={{ label: 'Audit Trail', value: 'Complete IDs', positive: true }}
        />
      </div>

      {/* Approved Expenses Queue Awaiting Payment */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#6C3CE8]" />
              Approved Expenses Queue (Ready for Reimbursement)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified by managers, pending payment release
            </p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs text-slate-500 hover:text-[#6C3CE8] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          {pendingDisbursement.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All approved expenses have been reimbursed. No pending disbursements!
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Expense #</th>
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Receipt</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingDisbursement.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3 text-slate-800 dark:text-slate-200">
                      {exp.user?.fullName}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {exp.department?.name}
                    </td>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      {exp.title}
                    </td>
                    <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3">
                      {exp.receipts && exp.receipts.length > 0 ? (
                        <button
                          onClick={() => setSelectedReceipt(exp.receipts[0])}
                          className="inline-flex items-center gap-1 text-[11px] text-[#6C3CE8] hover:underline font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No receipt</span>
                      )}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedReimburseExpense(exp)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Disburse Funds
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reimbursement Transaction Records */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Completed Reimbursement Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Auditable records of all disbursed employee claims
            </p>
          </div>
          <Link
            to="/reimbursements"
            className="text-xs font-semibold text-[#6C3CE8] hover:underline"
          >
            Full Reimbursements View →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {reimbursements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No reimbursement transactions recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Transaction Ref</th>
                  <th className="pb-3">Expense #</th>
                  <th className="pb-3">Beneficiary</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Payment Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reimbursements.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {r.transactionReference}
                    </td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                      {r.expense?.expenseNumber}
                    </td>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      {r.expense?.user?.fullName}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {r.paymentMethod}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(r.paymentDate)}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Disbursed
                      </span>
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

      <ReimbursementModal
        isOpen={Boolean(selectedReimburseExpense)}
        onClose={() => setSelectedReimburseExpense(null)}
        expense={selectedReimburseExpense}
        onProcess={handleProcessReimbursement}
      />
    </div>
  );
};
