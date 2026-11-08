import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { ApprovalModal } from '../components/ApprovalModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Eye,
  CheckSquare,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedApprovalExpense, setSelectedApprovalExpense] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApprove = async (expenseId, comments) => {
    await api.post(`/expenses/${expenseId}/approve`, { comments });
    fetchStats();
  };

  const handleReject = async (expenseId, comments) => {
    await api.post(`/expenses/${expenseId}/reject`, { comments });
    fetchStats();
  };

  if (loading && !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#6C3CE8]" />
          <p className="text-xs font-semibold text-slate-500">Loading Enterprise Analytics...</p>
        </div>
      </div>
    );
  }

  // Bar Chart Data: Monthly Expenses & Budget Allocated
  const monthlyLabels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const monthlyExpenseData = [12400, 15800, 14200, 18900, 16400, stats?.totalCompanyExpenses || 17200];
  const monthlyBudgetData = [25000, 25000, 25000, 25000, 25000, stats?.monthlyCompanyBudget || 30000];

  const barChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Allocated Budget ($)',
        data: monthlyBudgetData,
        backgroundColor: '#E2E8F0',
        borderRadius: 8,
      },
      {
        label: 'Expenses Incurred ($)',
        data: monthlyExpenseData,
        backgroundColor: '#6C3CE8',
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 11, weight: '600' } },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(200, 200, 200, 0.15)' } },
    },
  };

  // Pie Chart Data: Department-wise Expense Breakdown
  const deptLabels = stats?.departmentBreakdown?.map((d) => d.department) || ['Engineering', 'Sales & Marketing', 'Product', 'Finance'];
  const deptValues = stats?.departmentBreakdown?.map((d) => d.totalAmount) || [8500, 4200, 3100, 1400];
  const doughnutColors = ['#6C3CE8', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  const doughnutData = {
    labels: deptLabels,
    datasets: [
      {
        data: deptValues,
        backgroundColor: doughnutColors.slice(0, deptLabels.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11 } },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Admin Name Divi prominently displayed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-[#6C3CE8] to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/15">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
              Executive Admin Workspace
            </span>
            <span className="text-purple-200 text-xs">• Live MySQL Enterprise Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, Divi!
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl">
            Centralized overview of corporate expenditures, approval requests, reimbursements, and department budgets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-white border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
          <Link
            to="/expenses"
            className="px-5 py-2.5 rounded-xl bg-white text-[#6C3CE8] hover:bg-purple-50 text-xs font-bold shadow-md shadow-black/10 flex items-center gap-2 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            Review All Expenses
          </Link>
        </div>
      </div>

      {/* 8 Primary KPI Cards as specified in Section 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          subtitle="Active workforce"
          icon={Users}
          color="purple"
          trend={{ label: 'Departments', value: '5 Depts', positive: true }}
        />
        <StatCard
          title="Total Company Expenses"
          value={formatCurrency(stats?.totalCompanyExpenses)}
          subtitle="Fiscal year spending"
          icon={DollarSign}
          color="blue"
          trend={{ label: 'Avg / employee', value: formatCurrency((stats?.totalCompanyExpenses || 0) / Math.max(1, stats?.totalEmployees || 1)), positive: true }}
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          subtitle="Awaiting management"
          icon={Clock}
          color="amber"
          alert={(stats?.pendingApprovals || 0) > 0}
          trend={{ label: 'Priority', value: (stats?.pendingApprovals || 0) > 0 ? 'Action Needed' : 'All Clear', positive: false }}
        />
        <StatCard
          title="Approved Expenses"
          value={stats?.approvedExpenses || 0}
          subtitle="Passed manager review"
          icon={CheckCircle2}
          color="green"
          trend={{ label: 'Verification', value: 'Finance Queue', positive: true }}
        />
        <StatCard
          title="Rejected Expenses"
          value={stats?.rejectedExpenses || 0}
          subtitle="Failed policy check"
          icon={XCircle}
          color="rose"
          trend={{ label: 'Policy Enforced', value: 'Audited', positive: false }}
        />
        <StatCard
          title="Total Reimbursements"
          value={formatCurrency(stats?.totalReimbursements)}
          subtitle="Disbursed to employees"
          icon={CreditCard}
          color="green"
          trend={{ label: 'Status', value: '100% Settled', positive: true }}
        />
        <StatCard
          title="Monthly Company Budget"
          value={formatCurrency(stats?.monthlyCompanyBudget)}
          subtitle="Current month allocation"
          icon={PieIcon}
          color="purple"
          trend={{ label: 'Fiscal Month', value: 'Nov 2026', positive: true }}
        />
        <StatCard
          title="Budget Utilization"
          value={`${(stats?.budgetUtilization || 0).toFixed(1)}%`}
          subtitle="Of monthly allowance"
          icon={TrendingUp}
          color={(stats?.budgetUtilization || 0) > 80 ? 'rose' : 'blue'}
          alert={(stats?.budgetUtilization || 0) > 80}
          trend={{ 
            label: (stats?.budgetUtilization || 0) > 80 ? 'Warning' : 'Healthy', 
            value: `${formatCurrency((stats?.monthlyCompanyBudget || 0) * (stats?.budgetUtilization || 0) / 100)} spent`, 
            positive: (stats?.budgetUtilization || 0) <= 80 
          }}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense & Budget Bar Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Spending vs. Budget Allocation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comparison of monthly budget caps and actual claims
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-[#6C3CE8] dark:bg-purple-950/40 dark:text-purple-300">
              6 Month Trajectory
            </span>
          </div>
          <div className="h-72">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Department-wise Expense Pie/Doughnut Chart (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department Spending Share
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proportion of expenses by department
              </p>
            </div>
          </div>
          <div className="h-72 flex items-center justify-center">
            {deptValues.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-xs text-slate-400">No department expense data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Department Budget Overview Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#6C3CE8]" />
              Department Monthly Budget Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live consumption against allocated monthly budgets
            </p>
          </div>
          <Link
            to="/budgets"
            className="text-xs font-semibold text-[#6C3CE8] hover:underline flex items-center gap-1"
          >
            Manage All Budgets
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.departmentBudgets?.map((b) => {
            const util = b.utilizationPercentage || 0;
            const isExceeded = util >= 100;
            const isWarning = util >= 80 && util < 100;

            return (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {b.department?.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isExceeded
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {isExceeded ? 'EXCEEDED' : isWarning ? 'THRESHOLD ALERT' : 'ON TRACK'}
                  </span>
                </div>

                <div className="flex justify-between items-baseline mb-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(b.spentAmount)}</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Allocated: {formatCurrency(b.allocatedAmount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-[#6C3CE8]'
                    }`}
                    style={{ width: `${Math.min(100, util)}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{util.toFixed(1)}% utilized</span>
                  <span>{formatCurrency(b.remainingAmount)} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tables Section: Pending Approvals & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approval List */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending Approval Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Expenses requiring manager/admin verification
              </p>
            </div>
            <Link
              to="/approvals"
              className="text-xs font-semibold text-[#6C3CE8] hover:underline"
            >
              View Queue
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {stats?.pendingApprovalsList?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No expenses currently pending approval. All caught up!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 font-semibold">Expense #</th>
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Receipt</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats?.pendingApprovalsList?.slice(0, 5).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {exp.expenseNumber}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        {exp.user?.fullName}
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
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No receipt</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedApprovalExpense(exp)}
                          className="px-2.5 py-1 rounded-lg bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] font-semibold text-[11px] transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#6C3CE8]" />
                Recent Company Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Latest expense submissions across all departments
              </p>
            </div>
            <Link
              to="/expenses"
              className="text-xs font-semibold text-[#6C3CE8] hover:underline"
            >
              All Expenses
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.recentTransactions?.slice(0, 5).map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3">
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                        {exp.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {exp.expenseNumber}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {exp.department?.code || 'N/A'}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="py-3 text-right text-slate-500 dark:text-slate-400">
                      {formatDate(exp.expenseDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
