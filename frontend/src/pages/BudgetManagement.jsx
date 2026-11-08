import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { formatCurrency } from '../utils/formatters';
import {
  PieChart,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Building2,
  FolderGit2,
  RefreshCw,
  X,
  Loader2,
  Edit2
} from 'lucide-react';

export const BudgetManagement = () => {
  const { user, isAdmin } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Setting / Adjusting Budget
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, dRes, pRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/departments'),
        api.get('/projects'),
      ]);
      setBudgets(bRes.data);
      setDepartments(dRes.data);
      setProjects(pRes.data);
      if (dRes.data.length > 0) setSelectedDeptId(dRes.data[0].id);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (existingBudget = null) => {
    if (existingBudget) {
      setSelectedDeptId(existingBudget.department?.id || '');
      setSelectedProjectId(existingBudget.project?.id || '');
      setAllocatedAmount(existingBudget.allocatedAmount?.toString() || '');
      setAlertThreshold(existingBudget.alertThreshold?.toString() || '80');
    } else {
      setSelectedDeptId(departments[0]?.id || '');
      setSelectedProjectId('');
      setAllocatedAmount('');
      setAlertThreshold('80');
    }
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!selectedDeptId || !allocatedAmount) {
      setModalError('Please select a department and enter an allocated amount.');
      return;
    }

    setSubmitting(true);
    setModalError('');
    try {
      await api.post('/budgets', {
        departmentId: Number(selectedDeptId),
        projectId: selectedProjectId ? Number(selectedProjectId) : null,
        allocatedAmount: Number(allocatedAmount),
        alertThreshold: Number(alertThreshold) || 80.0,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAllocated = budgets.reduce((acc, curr) => acc + (curr.allocatedAmount || 0), 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + (curr.spentAmount || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-[#6C3CE8]" />
            Corporate Budget Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor and allocate monthly departmental and project expenditure caps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2.5 rounded-xl bg-[#6C3CE8] text-white hover:bg-[#5A2FD1] text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Set Department Budget
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Allocated Budget"
          value={formatCurrency(totalAllocated)}
          subtitle="Monthly corporate pool"
          icon={DollarSign}
          color="purple"
          trend={{ label: 'Departments', value: `${departments.length} Units`, positive: true }}
        />
        <StatCard
          title="Total Spent to Date"
          value={formatCurrency(totalSpent)}
          subtitle="Approved and disbursed claims"
          icon={TrendingUp}
          color="blue"
          trend={{ label: 'Status', value: 'Active Tracking', positive: true }}
        />
        <StatCard
          title="Available Balance"
          value={formatCurrency(totalRemaining)}
          subtitle="Remaining budget runway"
          icon={CheckCircle2}
          color={totalRemaining < 0 ? 'rose' : 'green'}
          alert={totalRemaining < 0}
          trend={{ label: 'Runway', value: totalRemaining < 0 ? 'Deficit!' : 'Surplus', positive: totalRemaining >= 0 }}
        />
        <StatCard
          title="Overall Utilization"
          value={`${overallUtilization.toFixed(1)}%`}
          subtitle="Target threshold: < 80%"
          icon={PieChart}
          color={overallUtilization >= 80 ? 'rose' : 'purple'}
          alert={overallUtilization >= 80}
          trend={{ label: overallUtilization >= 80 ? 'Attention' : 'Healthy', value: `${(100 - overallUtilization).toFixed(1)}% free`, positive: overallUtilization < 80 }}
        />
      </div>

      {/* Exceeded / High Alert Banner if any */}
      {budgets.some((b) => b.utilizationPercentage >= 80) && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <strong className="block font-bold">Budget Warning Alert:</strong>
            <span>
              One or more departments have exceeded 80% of their allocated monthly budget.
              Review high-value claims or request supplemental budget allocation.
            </span>
          </div>
        </div>
      )}

      {/* Department Budgets Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => {
          const util = b.utilizationPercentage || 0;
          const isExceeded = util >= 100;
          const isWarning = util >= 80 && util < 100;

          return (
            <div
              key={b.id}
              className={`rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border ${
                isExceeded
                  ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/20'
                  : isWarning
                  ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                  : 'border-slate-100 dark:border-slate-800'
              } flex flex-col justify-between transition-all hover:shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C3CE8] flex items-center justify-center font-bold text-xs">
                      {b.department?.code || 'DEP'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {b.department?.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Head: {b.department?.headName || 'Not Assigned'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isExceeded
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    }`}
                  >
                    {isExceeded ? 'BUDGET EXCEEDED' : isWarning ? 'ALERT > 80%' : 'HEALTHY'}
                  </span>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Allocated Budget:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(b.allocatedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Total Spent:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(b.spentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Remaining Balance:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    <span>Utilization</span>
                    <span>{util.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-[#6C3CE8]'
                      }`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleOpenModal(b)}
                    className="text-xs font-semibold text-[#6C3CE8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Adjust Budget
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Projects Budget Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#6C3CE8]" />
              Company Projects Budget Allocations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Project-specific funding and expenditure tracking
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Allocated Budget</th>
                <th className="py-3 px-4">Spent Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {p.code}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {p.department?.name}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(p.allocatedBudget)}
                  </td>
                  <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(p.spentAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Set Department Monthly Budget
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department *
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Allocated Monthly Budget ($ USD) *
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={allocatedAmount}
                  onChange={(e) => setAllocatedAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alert Warning Threshold (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Triggers visual warning badges when spending hits this percentage.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
