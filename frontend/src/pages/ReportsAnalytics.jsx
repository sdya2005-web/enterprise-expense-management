import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Building2,
  Users,
  PieChart as PieIcon,
  TrendingUp,
  RefreshCw,
  Search
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const ReportsAnalytics = () => {
  const [financialData, setFinancialData] = useState(null);
  const [deptAnalytics, setDeptAnalytics] = useState([]);
  const [employeeTracking, setEmployeeTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' or 'employees'
  const [empSearch, setEmpSearch] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [fRes, dRes, eRes] = await Promise.all([
        api.get('/reports/financial'),
        api.get('/reports/department-analytics'),
        api.get('/reports/employee-tracking'),
      ]);
      setFinancialData(fRes.data);
      setDeptAnalytics(dRes.data);
      setEmployeeTracking(eRes.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Department Analytics Export
  const handleExportDeptExcel = () => {
    const data = deptAnalytics.map((d) => ({
      'Department Name': d.name,
      'Code': d.code,
      'Monthly Budget ($)': d.monthlyBudget,
      'Total Spent ($)': d.totalSpent,
      'Variance ($)': (d.monthlyBudget || 0) - (d.totalSpent || 0),
    }));
    exportToExcel(data, 'Department_Expense_Analytics.xlsx');
  };

  const handleExportDeptPDF = () => {
    const headers = ['Department', 'Code', 'Monthly Budget', 'Total Spent', 'Variance'];
    const rows = deptAnalytics.map((d) => [
      d.name,
      d.code,
      formatCurrency(d.monthlyBudget),
      formatCurrency(d.totalSpent),
      formatCurrency((d.monthlyBudget || 0) - (d.totalSpent || 0)),
    ]);
    exportToPDF('Department Expense Analytics Report', headers, rows, 'Department_Analytics.pdf');
  };

  // Employee Tracking Export
  const handleExportEmpExcel = () => {
    const data = employeeTracking.map((e) => ({
      'Employee Name': e.name,
      'Employee ID': e.employeeId,
      'Email': e.email,
      'Department': e.department,
      'Claims Count': e.expenseCount,
      'Total Claimed ($)': e.totalSpent,
    }));
    exportToExcel(data, 'Employee_Expense_Tracking.xlsx');
  };

  const handleExportEmpPDF = () => {
    const headers = ['Employee', 'ID', 'Department', 'Claims Count', 'Total Claimed'];
    const rows = employeeTracking.map((e) => [
      e.name,
      e.employeeId || 'N/A',
      e.department || 'N/A',
      e.expenseCount,
      formatCurrency(e.totalSpent),
    ]);
    exportToPDF('Employee Expense Tracking Report', headers, rows, 'Employee_Expense_Tracking.pdf');
  };

  // Bar chart for department budget vs spent
  const deptBarData = {
    labels: deptAnalytics.map((d) => d.name),
    datasets: [
      {
        label: 'Monthly Budget ($)',
        data: deptAnalytics.map((d) => d.monthlyBudget || 0),
        backgroundColor: '#E2E8F0',
        borderRadius: 8,
      },
      {
        label: 'Total Spent ($)',
        data: deptAnalytics.map((d) => d.totalSpent || 0),
        backgroundColor: '#6C3CE8',
        borderRadius: 8,
      },
    ],
  };

  const filteredEmployees = employeeTracking.filter(
    (e) =>
      empSearch === '' ||
      e.name?.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.email?.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.department?.toLowerCase().includes(empSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#6C3CE8]" />
            Reports & Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-ready company financial breakdowns, department analytics, and employee tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={activeTab === 'departments' ? handleExportDeptExcel : handleExportEmpExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Excel
          </button>
          <button
            onClick={activeTab === 'departments' ? handleExportDeptPDF : handleExportEmpPDF}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Department Budget Allocation vs. Realized Spending
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live variance analytics across all operating units
            </p>
          </div>
        </div>
        <div className="h-64 sm:h-72">
          {deptAnalytics.length > 0 ? (
            <Bar
              data={deptBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { font: { size: 11 } } },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(200, 200, 200, 0.15)' } },
                },
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No department data available
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'departments'
              ? 'border-[#6C3CE8] text-[#6C3CE8]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Department-wise Expense Analytics
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'employees'
              ? 'border-[#6C3CE8] text-[#6C3CE8]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Employee-wise Expense Tracking
        </button>
      </div>

      {/* Tab 1: Department-wise Expense Analytics */}
      {activeTab === 'departments' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Monthly Budget</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Variance ($)</th>
                  <th className="py-3.5 px-4">Burn Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {deptAnalytics.map((d) => {
                  const variance = (d.monthlyBudget || 0) - (d.totalSpent || 0);
                  const rate = d.monthlyBudget > 0 ? ((d.totalSpent || 0) / d.monthlyBudget) * 100 : 0;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {d.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {d.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(d.monthlyBudget)}
                      </td>
                      <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(d.totalSpent)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            variance < 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {formatCurrency(variance)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${rate > 100 ? 'bg-rose-500' : 'bg-[#6C3CE8]'}`}
                              style={{ width: `${Math.min(100, rate)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            {rate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Employee-wise Expense Tracking */}
      {activeTab === 'employees' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                placeholder="Search employee or department..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Total Claims Submitted</th>
                  <th className="py-3.5 px-4 text-right">Total Expenditure Claimed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {e.name}
                      <span className="text-[11px] font-normal text-slate-400 block">{e.email}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {e.employeeId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {e.department}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {e.role?.replace('ROLE_', '')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {e.expenseCount} Claims
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#6C3CE8] dark:text-purple-400 text-sm">
                      {formatCurrency(e.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
