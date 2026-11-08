import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { FinanceDashboard } from './FinanceDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';

export const Dashboard = () => {
  const { user, isAdmin, isManager, isFinance } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }
  if (isManager) {
    return <ManagerDashboard />;
  }
  if (isFinance) {
    return <FinanceDashboard />;
  }
  return <EmployeeDashboard />;
};
