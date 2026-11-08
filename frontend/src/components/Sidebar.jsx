import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderGit2,
  Receipt,
  CheckSquare,
  CreditCard,
  PieChart,
  BarChart3,
  ClipboardList,
  Settings,
  LogOut,
  PlusCircle,
  X,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isManager, isFinance, isEmployee } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin menu as explicitly requested in Section 10
  const adminLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/employees', icon: Users },
    { label: 'Departments', path: '/departments', icon: Building2 },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'All Expenses', path: '/expenses', icon: Receipt },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare },
    { label: 'Reimbursements', path: '/reimbursements', icon: CreditCard },
    { label: 'Budget Management', path: '/budgets', icon: PieChart },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: ClipboardList },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Manager menu
  const managerLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare },
    { label: 'Department Expenses', path: '/expenses', icon: Receipt },
    { label: 'Submit Expense', path: '/expenses/new', icon: PlusCircle },
    { label: 'Budget Management', path: '/budgets', icon: PieChart },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  ];

  // Finance menu
  const financeLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Reimbursements', path: '/reimbursements', icon: CreditCard },
    { label: 'All Expenses', path: '/expenses', icon: Receipt },
    { label: 'Budget Management', path: '/budgets', icon: PieChart },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: ClipboardList },
  ];

  // Employee menu
  const employeeLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Submit Expense', path: '/expenses/new', icon: PlusCircle },
    { label: 'My Expenses', path: '/expenses', icon: Receipt },
    { label: 'My Reimbursements', path: '/reimbursements', icon: CreditCard },
  ];

  const links = isAdmin
    ? adminLinks
    : isManager
    ? managerLinks
    : isFinance
    ? financeLinks
    : employeeLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C3CE8] to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white block">
                SpendFlow
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#6C3CE8] uppercase block">
                Enterprise Suite
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin profile card displaying 'Divi' */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-b from-purple-50/70 to-purple-50/20 dark:from-purple-950/30 dark:to-slate-800/20 border border-purple-100/80 dark:border-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#6C3CE8] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-500/20">
                {isAdmin ? 'D' : user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {isAdmin ? 'Divi' : user?.fullName || 'User'}
                </span>
                {isAdmin && (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6C3CE8] flex-shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {isAdmin ? 'admin@enterprise.com' : user?.email}
              </p>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#6C3CE8] text-white">
                  {isAdmin ? 'ADMINISTRATOR' : isManager ? 'MANAGER' : isFinance ? 'FINANCE' : 'EMPLOYEE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#6C3CE8] text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
