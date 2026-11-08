import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  CreditCard, 
  CheckCheck,
  Send
} from 'lucide-react';

const statusConfig = {
  SUBMITTED: {
    label: 'Submitted',
    icon: Send,
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  },
  FINANCE_VERIFICATION: {
    label: 'Finance Verification',
    icon: ShieldCheck,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  },
  PAYMENT_PROCESSING: {
    label: 'Processing Payment',
    icon: CreditCard,
    className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  },
  REIMBURSED: {
    label: 'Reimbursed',
    icon: CheckCheck,
    className: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    icon: Clock,
    className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
