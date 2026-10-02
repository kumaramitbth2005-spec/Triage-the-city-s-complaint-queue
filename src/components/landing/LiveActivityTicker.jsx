import React from 'react';
import { CheckCircle2, Zap, AlertCircle, Clock, MapPin, Sparkles } from 'lucide-react';

const RESOLVED_UPDATES = [
  { icon: '🚰', text: 'Main pipe burst sealed in Ward 14 (Central Market)', time: '4 mins ago', dept: 'Water' },
  { icon: '🛣️', text: 'Pothole asphalt patch completed on MG Ring Road', time: '12 mins ago', dept: 'Roads' },
  { icon: '⚡', text: 'High-voltage feeder circuit restored in Sector 18', time: '21 mins ago', dept: 'Electrical' },
  { icon: '🗑️', text: '3 Tons commercial debris cleared from Ward 5 Depot', time: '35 mins ago', dept: 'Sanitation' },
  { icon: '🌳', text: 'Storm damaged banyan branches removed from North Ave', time: '48 mins ago', dept: 'Parks' },
  { icon: '💡', text: '16 LED streetlights synchronized in Civil Lines Ward 22', time: '1 hr ago', dept: 'Electrical' },
  { icon: '🌊', text: 'Stormwater drain silt clearance completed in Ward 9', time: '1.5 hrs ago', dept: 'Drainage' },
];

export function LiveActivityTicker() {
  return (
    <div className="w-full border-y border-stone-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md py-3 overflow-hidden relative">
      {/* Left and Right Fade Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4">
        {/* Live Pill Indicator */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Live Municipal Pulse</span>
          <span className="sm:hidden text-[10px] uppercase">Live</span>
        </div>

        {/* Scrolling items stream */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
            {[...RESOLVED_UPDATES, ...RESOLVED_UPDATES].map((item, idx) => (
              <div 
                key={idx} 
                className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-full border border-stone-200/60 dark:border-slate-700/60"
              >
                <span className="text-sm">{item.icon}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{item.text}</span>
                <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">({item.time})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
