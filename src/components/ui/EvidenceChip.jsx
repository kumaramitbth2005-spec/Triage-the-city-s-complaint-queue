import React from 'react';
import { cn } from '../../lib/utils';
import { Sparkles } from 'lucide-react';

export function EvidenceChip({ evidence, className }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-100 text-blue-800 text-xs font-medium shadow-sm",
      className
    )}>
      <Sparkles size={12} className="text-blue-500" />
      <span>{evidence}</span>
    </div>
  );
}
