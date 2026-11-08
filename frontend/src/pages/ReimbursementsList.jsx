import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { ReimbursementModal } from '../components/ReimbursementModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  DollarSign,
  Building2,
  User
} from 'lucide-react';

export const ReimbursementsList = () => {
  const { user, isAdmin, isFinance } = useAuth();
  const [reimbursements, setReimbursements] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [loading, setLoading] = useState(true);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedReimburseExpense, setSelectedReimburseExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reimbRes, pendRes] = await Promise.all([
        api.get('/reimbursements'),
        api.get('/expenses/for-finance'),
      ]);
      setReimbursements(reimbRes.data);
      setPendingExpenses(pendRes.data.filter((e) => e.status !== 'REIMBURSED'));
    } catch (err) {
      console.error('Failed to load reimbursements', err);
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

  const handleExportExcel = () => {
    const data = reimbursements.map((r) => ({
      'Transaction Ref': r.transactionReference,
      'Expense #': r.expense?.expenseNumber,
      'Employee': r.expense?.user?.fullName,
      'Department': r.expense?.department?.name,
      'Amount ($)': r.amount,
      'Method': r.paymentMethod,
      'Payment Date': formatDate(r.paymentDate),
      'Notes': r.notes,
    }));
    exportToExcel(data, 'Enterprise_Reimbursements_Ledger.xlsx');
  };

  const handleExportPDF = () => {
    const headers = ['Txn Ref', 'Expense #', 'Employee', 'Amount', 'Method', 'Date', 'Status'];
    const rows = reimbursements.map((r) => [
      r.transactionReference,
      r.expense?.expenseNumber,
      r.expense?.user?.fullName,
      formatCurrency(r.amount),
      r.paymentMethod,
      formatDate(r.paymentDate),
      'Disbursed',
    ]);
    exportToPDF('Corporate Reimbursement Disbursement Ledger', headers, rows, 'Reimbursements_Ledger.pdf');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#6C3CE8]" />
            Corporate Reimbursements & Disbursements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Process payments, record transaction references, and maintain financial records
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            PDF Ledger
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'border-[#6C3CE8] text-[#6C3CE8]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          Awaiting Disbursement ({pendingExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#6C3CE8] text-[#6C3CE8]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Settled Reimbursements ({reimbursements.length})
        </button>
      </div>

      {/* Tab 1: Pending Disbursement Queue */}
      {activeTab === 'pending' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#6C3CE8]" />
                Loading payout queue...
              </div>
            ) : pendingExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Zero Pending Disbursements
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  All manager-approved claims have been settled!
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Expense #</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Receipt</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Disbursement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {exp.expenseNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {exp.user?.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {exp.department?.name}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {exp.title}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3 px-4">
                        {exp.receipts && exp.receipts.length > 0 ? (
                          <button
                            onClick={() => setSelectedReceipt(exp.receipts[0])}
                            className="inline-flex items-center gap-1 text-[11px] text-[#6C3CE8] hover:underline font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={exp.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(isAdmin || isFinance) ? (
                          <button
                            onClick={() => setSelectedReimburseExpense(exp)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                          >
                            Release Funds
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Finance Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Settled Reimbursements History */}
      {activeTab === 'history' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            {reimbursements.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No reimbursement transactions recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Transaction Ref</th>
                    <th className="py-3.5 px-4">Expense #</th>
                    <th className="py-3.5 px-4">Beneficiary</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Payment Date</th>
                    <th className="py-3.5 px-4">Disbursed By</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reimbursements.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {r.transactionReference}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {r.expense?.expenseNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {r.expense?.user?.fullName}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {r.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {formatDate(r.paymentDate)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {r.financeUser?.fullName || 'Finance Team'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Reimbursed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

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
