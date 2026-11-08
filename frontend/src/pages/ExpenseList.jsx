import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { ApprovalModal } from '../components/ApprovalModal';
import { ReimbursementModal } from '../components/ReimbursementModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import {
  Receipt,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  Eye,
  CheckSquare,
  CreditCard,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExpenseList = () => {
  const { user, isAdmin, isManager, isFinance } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedApprovalExpense, setSelectedApprovalExpense] = useState(null);
  const [selectedReimburseExpense, setSelectedReimburseExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const [expRes, deptRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/departments'),
      ]);
      setExpenses(expRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleApprove = async (id, comments) => {
    await api.post(`/expenses/${id}/approve`, { comments });
    fetchExpenses();
  };

  const handleReject = async (id, comments) => {
    await api.post(`/expenses/${id}/reject`, { comments });
    fetchExpenses();
  };

  const handleReimburse = async (id, payload) => {
    await api.post(`/reimbursements/process/${id}`, payload);
    fetchExpenses();
  };

  // Filtered expenses
  const filtered = expenses.filter((e) => {
    const matchesSearch =
      searchTerm === '' ||
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.businessPurpose?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || e.status === statusFilter;
    const matchesCategory = categoryFilter === '' || e.category === categoryFilter;
    const matchesDept =
      departmentFilter === '' ||
      (e.department && e.department.id.toString() === departmentFilter);

    return matchesSearch && matchesStatus && matchesCategory && matchesDept;
  });

  const handleExportExcel = () => {
    const data = filtered.map((e) => ({
      'Expense #': e.expenseNumber,
      'Title': e.title,
      'Employee': e.user?.fullName || 'N/A',
      'Employee ID': e.user?.employeeId || 'N/A',
      'Department': e.department?.name || 'N/A',
      'Category': e.category,
      'Amount ($)': e.amount,
      'Date': formatDate(e.expenseDate),
      'Payment Method': e.paymentMethod,
      'Status': e.status,
      'Purpose': e.businessPurpose,
    }));
    exportToExcel(data, 'Enterprise_Expenses.xlsx');
  };

  const handleExportPDF = () => {
    const headers = ['Expense #', 'Employee', 'Department', 'Category', 'Amount', 'Date', 'Status'];
    const rows = filtered.map((e) => [
      e.expenseNumber,
      e.user?.fullName || 'N/A',
      e.department?.code || 'N/A',
      e.category,
      formatCurrency(e.amount),
      formatDate(e.expenseDate),
      e.status,
    ]);
    exportToPDF('Enterprise Expenses Summary Report', headers, rows, 'Enterprise_Expenses.pdf');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#6C3CE8]" />
            {isAdmin ? 'All Company Expenses' : isManager ? 'Department Expenses' : isFinance ? 'Expenses for Payment' : 'My Expense Claims'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} total records • Filter, view receipts, and export reports
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            PDF Report
          </button>
          <Link
            to="/expenses/new"
            className="px-4 py-2 rounded-xl bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Expense
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, expense number, employee or purpose..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="FINANCE_VERIFICATION">Finance Verification</option>
            <option value="PAYMENT_PROCESSING">Processing Payment</option>
            <option value="REIMBURSED">Reimbursed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
          >
            <option value="">All Categories</option>
            <option value="TRAVEL">Travel</option>
            <option value="FOOD">Food</option>
            <option value="ACCOMMODATION">Accommodation</option>
            <option value="TRANSPORTATION">Transportation</option>
            <option value="OFFICE_SUPPLIES">Office Supplies</option>
            <option value="CLIENT_MEETINGS">Client Meetings</option>
            <option value="INTERNET_AND_COMMUNICATION">Internet & Comms</option>
            <option value="MEDICAL">Medical</option>
            <option value="OTHER">Other Expenses</option>
          </select>

          {/* Department Filter (Admin/Finance only) */}
          {(isAdmin || isFinance) && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCategoryFilter('');
              setDepartmentFilter('');
            }}
            className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Expenses Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#6C3CE8]" />
              Loading expenses data...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No matching expense records found.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Expense #</th>
                  <th className="py-3.5 px-4">Title & Context</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Dept</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Receipt</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {exp.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {exp.category} • {exp.businessPurpose}
                      </div>
                      {exp.policyViolations && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {exp.policyViolations}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <div>{exp.user?.fullName}</div>
                      <div className="text-[10px] text-slate-400">{exp.user?.employeeId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {exp.department?.code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(exp.expenseDate)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={exp.status} />
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
                    <td className="py-3 px-4 text-right">
                      {/* Action buttons depending on role and status */}
                      {(isAdmin || isManager) && exp.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => setSelectedApprovalExpense(exp)}
                          className="px-2.5 py-1 rounded-lg bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] text-xs font-semibold cursor-pointer shadow-sm"
                        >
                          Review
                        </button>
                      )}

                      {(isAdmin || isFinance) && (exp.status === 'APPROVED' || exp.status === 'FINANCE_VERIFICATION') && (
                        <button
                          onClick={() => setSelectedReimburseExpense(exp)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold cursor-pointer shadow-sm"
                        >
                          Disburse
                        </button>
                      )}

                      {exp.status === 'REIMBURSED' && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          ✓ Paid
                        </span>
                      )}

                      {exp.status === 'REJECTED' && (
                        <span className="text-rose-600 dark:text-rose-400 text-[11px]" title={exp.rejectionReason}>
                          Rejected
                        </span>
                      )}
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

      <ReimbursementModal
        isOpen={Boolean(selectedReimburseExpense)}
        onClose={() => setSelectedReimburseExpense(null)}
        expense={selectedReimburseExpense}
        onProcess={handleReimburse}
      />
    </div>
  );
};
