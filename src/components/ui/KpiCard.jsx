import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * KpiCard displays a key metric with optional trend indicator.
 *
 * @param {object} props
 * @param {string} props.title - Title of the KPI.
 * @param {string|number} props.value - Value to display.
 * @param {string} [props.trend] - 'up' | 'down' | undefined.
 * @param {string} [props.trendLabel] - Text describing the trend (e.g., '5% vs last week').
 * @param {string} [props.className] - Additional Tailwind classes.
 */
export function KpiCard({ title, value, trend, trendLabel, className, ...props }) {
  const trendIcon = trend === 'up' ? (
    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
  ) : trend === 'down' ? (
    <ArrowDownRight className="h-4 w-4 text-rose-600" />
  ) : null;

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between',
        className
      )}
      {...props}
    >
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">{value}</p>
      {trend && (
        <div className="mt-2 flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
          {trendIcon}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
