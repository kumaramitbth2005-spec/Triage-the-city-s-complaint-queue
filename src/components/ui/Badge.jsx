import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    outline: "border border-gray-200 text-gray-800 bg-transparent"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
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
    'LOW': { variant: 'default', label: 'Low' },
    'MEDIUM': { variant: 'warning', label: 'Medium' },
    'HIGH': { variant: 'danger', label: 'High' },
    'CRITICAL': { variant: 'danger', label: 'Critical' } // Could style darker red for critical
  };

  const config = urgencyMap[level?.toUpperCase()] || urgencyMap['LOW'];

  return (
    <Badge variant={config.variant} className={cn(level === 'CRITICAL' ? 'bg-red-200 text-red-900 border border-red-300' : '', className)}>
      {config.label}
    </Badge>
  );
}
