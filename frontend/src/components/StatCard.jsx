import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'purple',
  trend,
  alert = false,
}) => {
  const colorStyles = {
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-[#6C3CE8] dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/40',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/40',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/40',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/40',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/40',
    },
  };

  const currentTheme = colorStyles[color] || colorStyles.purple;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border ${
        alert ? 'border-rose-400 dark:border-rose-500' : 'border-slate-100 dark:border-slate-800'
      } transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl ${currentTheme.bg} ${currentTheme.text}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
          <span
            className={`font-semibold ${
              trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};
