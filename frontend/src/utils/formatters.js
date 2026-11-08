export const formatCurrency = (val) => {
  if (val === null || val === undefined) return '$0.00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const getCategoryBadge = (category) => {
  const map = {
    TRAVEL: { label: 'Travel', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    FOOD: { label: 'Food & Meals', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    ACCOMMODATION: { label: 'Accommodation', bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    TRANSPORTATION: { label: 'Transportation', bg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    OFFICE_SUPPLIES: { label: 'Office Supplies', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    CLIENT_MEETINGS: { label: 'Client Meetings', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    INTERNET_AND_COMMUNICATION: { label: 'Internet & Comms', bg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    MEDICAL: { label: 'Medical', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
    OTHER: { label: 'Other Expenses', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  };
  return map[category] || { label: category, bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
};
