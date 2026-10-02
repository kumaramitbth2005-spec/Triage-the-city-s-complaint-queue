import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold",
    primary: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 font-semibold",
    success: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 font-semibold",
    warning: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 font-semibold",
    danger: "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 font-semibold",
    outline: "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent font-medium"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Specific badges for Urgency
export function UrgencyBadge({ level, className }) {
  const urgencyMap = {
    'LOW': { variant: 'default', label: 'Low', extra: 'text-slate-700 dark:text-slate-300' },
    'MEDIUM': { variant: 'warning', label: 'Medium', extra: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    'HIGH': { variant: 'danger', label: 'High', extra: 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
    'CRITICAL': { variant: 'danger', label: 'Critical', extra: 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700 font-bold shadow-xs' }
  };

  const config = urgencyMap[level?.toUpperCase()] || urgencyMap['LOW'];

  return (
    <Badge variant={config.variant} className={cn(config.extra, className)}>
      {config.label}
    </Badge>
  );
}

