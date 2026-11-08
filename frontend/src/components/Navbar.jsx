import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationDropdown } from './NotificationDropdown';
import { 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  LogOut, 
  Sparkles, 
  Menu,
  Shield,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, quickDemoSwitch, isAdmin, isManager, isFinance, isEmployee } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleRoleSwitch = async (roleName) => {
    try {
      await quickDemoSwitch(roleName);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to switch demo role', err);
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-[#6C3CE8] border border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Administrator
        </span>
      );
    }
    if (isManager) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700 flex items-center gap-1">
          <Briefcase className="w-3 h-3" />
          Manager
        </span>
      );
    }
    if (isFinance) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700 flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          Finance Team
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 flex items-center gap-1">
        <User className="w-3 h-3" />
        Employee
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile menu button & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">Enterprise SpendFlow</span>
          <span>/</span>
          <span className="capitalize">
            {isAdmin ? 'Admin Console' : isManager ? 'Management Portal' : isFinance ? 'Finance Desk' : 'Employee Workspace'}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Role Switcher (For Demo & Presentation) */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#6C3CE8]" />
            <span className="hidden md:inline">Demo Persona:</span>
            <span className="font-bold text-[#6C3CE8] dark:text-purple-400">
              {isAdmin ? 'Divi (Admin)' : user?.fullName || 'Role'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 hidden group-hover:block z-50 animate-in fade-in duration-100">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Switch Test Perspective
            </div>
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-950/30 ${
                isAdmin ? 'font-bold text-[#6C3CE8]' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Divi (Admin)</span>
              <Shield className="w-3.5 h-3.5 text-purple-500" />
            </button>
            <button
              onClick={() => handleRoleSwitch('MANAGER')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-950/30 ${
                isManager ? 'font-bold text-amber-600' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Sarah Jenkins (Manager)</span>
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
            </button>
            <button
              onClick={() => handleRoleSwitch('FINANCE')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/30 ${
                isFinance ? 'font-bold text-emerald-600' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Mark Vance (Finance)</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            </button>
            <button
              onClick={() => handleRoleSwitch('EMPLOYEE')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-950/30 ${
                isEmployee ? 'font-bold text-blue-600' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Alex Rivera (Employee)</span>
              <User className="w-3.5 h-3.5 text-blue-500" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* User Profile Card */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C3CE8] to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {isAdmin ? 'D' : user?.fullName ? user.fullName.charAt(0) : 'U'}
          </div>

          <div className="hidden lg:block text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAdmin ? 'Divi' : user?.fullName || 'User'}
              </span>
              {getRoleBadge()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAdmin ? 'admin@enterprise.com' : user?.email}
            </p>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
