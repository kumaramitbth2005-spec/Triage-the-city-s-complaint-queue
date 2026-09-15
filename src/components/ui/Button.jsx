import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', size = 'default', children, ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-slate-700",
    ghost: "hover:bg-gray-100 text-slate-700",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm"
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-lg px-8 text-base",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
