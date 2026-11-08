import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ExpenseSubmit } from './pages/ExpenseSubmit';
import { ExpenseList } from './pages/ExpenseList';
import { ApprovalsList } from './pages/ApprovalsList';
import { ReimbursementsList } from './pages/ReimbursementsList';
import { BudgetManagement } from './pages/BudgetManagement';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { ProjectManagement } from './pages/ProjectManagement';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { AuditLogs } from './pages/AuditLogs';
import { SettingsPolicies } from './pages/SettingsPolicies';

// Protected Layout
const MainLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-4 border-[#6C3CE8] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <MainLayout>
                    <Navigate to="/dashboard" replace />
                  </MainLayout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                }
              />
              <Route
                path="/expenses"
                element={
                  <MainLayout>
                    <ExpenseList />
                  </MainLayout>
                }
              />
              <Route
                path="/expenses/new"
                element={
                  <MainLayout>
                    <ExpenseSubmit />
                  </MainLayout>
                }
              />
              <Route
                path="/approvals"
                element={
                  <MainLayout>
                    <ApprovalsList />
                  </MainLayout>
                }
              />
              <Route
                path="/reimbursements"
                element={
                  <MainLayout>
                    <ReimbursementsList />
                  </MainLayout>
                }
              />
              <Route
                path="/budgets"
                element={
                  <MainLayout>
                    <BudgetManagement />
                  </MainLayout>
                }
              />
              <Route
                path="/employees"
                element={
                  <MainLayout>
                    <EmployeeManagement />
                  </MainLayout>
                }
              />
              <Route
                path="/departments"
                element={
                  <MainLayout>
                    <DepartmentManagement />
                  </MainLayout>
                }
              />
              <Route
                path="/projects"
                element={
                  <MainLayout>
                    <ProjectManagement />
                  </MainLayout>
                }
              />
              <Route
                path="/reports"
                element={
                  <MainLayout>
                    <ReportsAnalytics />
                  </MainLayout>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <MainLayout>
                    <AuditLogs />
                  </MainLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <MainLayout>
                    <SettingsPolicies />
                  </MainLayout>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
