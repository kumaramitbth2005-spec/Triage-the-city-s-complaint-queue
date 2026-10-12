import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Clock, 
  MapPin, Layers, RefreshCw, ArrowRight, ShieldCheck,
  Zap, CopyCheck, BrainCircuit, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_COMPLAINTS = [
  {
    id: 'DEMO-1',
    category: 'Water Supply',
    icon: '💧',
    title: 'Major main pipeline rupture flooding Sector 14 market lane',
    rawText: 'Huge water leakage from the main underground pipe near gate 2 of Central Market. Water is 2 feet deep and entering shops. Urgent help needed!',
    dept: 'Water Works & Sanitation',
    confidence: 99.4,
    urgency: 'CRITICAL',
    slaHours: 4,
    ward: 'Ward 14 (Central Market)',
    zone: 'Zone 1 - North',
    duplicatesCount: 3,
    duplicateNote: 'Auto-clustered with 3 earlier citizen calls from Sector 14',
    suggestedAction: 'Dispatch emergency valve repair crew & sump pumping unit',
    colorTheme: 'blue'
  },
  {
    id: 'DEMO-2',
    category: 'Roads & Infrastructure',
    icon: '🛣️',
    title: 'Severe deep pothole causing two-wheeler accidents on MG Road',
    rawText: 'Deep 3-foot wide crater on right lane of MG Road near Flyover Pillar 28. Already 2 bikes skidded today in the dark. Hazard for night traffic.',
    dept: 'Roads & Infrastructure',
    confidence: 98.7,
    urgency: 'HIGH',
    slaHours: 8,
    ward: 'Ward 08 (MG Corridor)',
    zone: 'Zone 3 - West',
    duplicatesCount: 5,
    duplicateNote: '5 duplicate complaints identified in 200m radius; merged to primary ticket',
    suggestedAction: 'Deploy asphalt quick-patch unit & temporary warning barricades',
    colorTheme: 'amber'
  },
  {
    id: 'DEMO-3',
    category: 'Electrical & Lighting',
    icon: '💡',
    title: 'Complete blackout of 12 streetlights near Girls High School',
    rawText: 'Entire stretch of streetlights from Community Center to Girls High School is dead for 3 days. Total darkness posing safety hazard for pedestrians.',
    dept: 'Electrical & Power',
    confidence: 97.9,
    urgency: 'HIGH',
    slaHours: 12,
    ward: 'Ward 22 (Civil Lines)',
    zone: 'Zone 2 - South',
    duplicatesCount: 2,
    duplicateNote: 'Feeder line circuit fault detected across 2 adjacent ward nodes',
    suggestedAction: 'Inspect transformer switchgear #T-44 and replace faulty MCB relay',
    colorTheme: 'yellow'
  },
  {
    id: 'DEMO-4',
    category: 'Solid Waste Management',
    icon: '🗑️',
    title: 'Overflowing municipal garbage bin blocking school bus stand',
    rawText: 'Garbage dump hasn\'t been cleared for 4 days near Sector 7 bus stop. Stray animals scattering trash on road, foul smell everywhere.',
    dept: 'Solid Waste Management',
    confidence: 99.1,
    urgency: 'MEDIUM',
    slaHours: 24,
    ward: 'Ward 05 (Shastri Nagar)',
    zone: 'Zone 4 - East',
    duplicatesCount: 1,
    duplicateNote: 'Correlated with daily compactor vehicle breakdown schedule',
    suggestedAction: 'Route hydraulic compactor truck #DL-14 to clear bin depot #B-19',
    colorTheme: 'emerald'
  }
];

export function LiveTriageDemo() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedKey, setProcessedKey] = useState(0);

  const activeComplaint = SAMPLE_COMPLAINTS[selectedIdx];

  const handleSelectSample = (idx) => {
    if (idx === selectedIdx && !isProcessing) return;
    setIsProcessing(true);
    setSelectedIdx(idx);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessedKey(prev => prev + 1);
    }, 450);
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white/95 dark:bg-[#0F141D] backdrop-blur-2xl border border-slate-200 dark:border-[#303B4D] shadow-2xl dark:shadow-black/60 p-5 sm:p-8 overflow-hidden relative transition-colors">
      {/* Ambient background glow inside demo card */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 dark:bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Demo Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-[#303B4D]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <BrainCircuit size={13} />
            <span>Interactive Live Simulation</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            See AI Triage in Real-Time
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-0.5">
            Click any civic scenario below to simulate automatic NLP routing, deduplication, and SLA prediction.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#1B2535] p-1.5 rounded-xl border border-slate-200 dark:border-[#303B4D]">
          <span className="flex h-2 w-2 relative ml-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-[#D1D9E6] pr-2">
            AI Engine Online (v2.4)
          </span>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 pb-6">
        {SAMPLE_COMPLAINTS.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectSample(idx)}
              className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/90 dark:bg-[#1B2535] border-indigo-500/70 dark:border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                  : 'bg-white dark:bg-[#151C28] border-slate-200 dark:border-[#303B4D] hover:bg-slate-50 dark:hover:bg-[#1B2535]/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xl">{item.icon}</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getUrgencyBadge(item.urgency)}`}>
                  {item.urgency}
                </span>
              </div>
              <div>
                <div className={`text-xs font-bold line-clamp-1 ${
                  isSelected ? 'text-indigo-900 dark:text-[#F8FAFC]' : 'text-slate-800 dark:text-[#D1D9E6]'
                }`}>
                  {item.category}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                  {item.ward}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulation Result Workspace */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Citizen Raw Complaint Stream */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#151C28] border border-slate-200/80 dark:border-[#303B4D]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={13} className="text-indigo-500 dark:text-indigo-400" />
                Incoming Citizen Report
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-[#94A3B8]">
                ID: {activeComplaint.id}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] mb-2 leading-snug">
              "{activeComplaint.title}"
            </h4>

            <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#303B4D] text-xs text-slate-700 dark:text-[#D1D9E6] leading-relaxed font-sans mb-4">
              {activeComplaint.rawText}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-[#303B4D]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-[#94A3B8] flex items-center gap-1">
                <MapPin size={12} className="text-indigo-500 dark:text-indigo-400" />
                Tagged Location:
              </span>
              <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">
                {activeComplaint.ward}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-[#94A3B8]">Jurisdiction:</span>
              <span className="font-medium text-slate-700 dark:text-[#D1D9E6]">{activeComplaint.zone}</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Live Inference Results */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-indigo-50/40 dark:bg-[#151C28] border border-indigo-100 dark:border-[#303B4D] shadow-sm relative overflow-hidden">
          {isProcessing ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center space-y-3">
              <RefreshCw size={28} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              <div className="text-xs font-bold text-slate-700 dark:text-[#D1D9E6]">
                Analyzing NLP context & clustering coordinates...
              </div>
              <div className="w-48 h-1.5 bg-slate-200 dark:bg-[#111827] rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse rounded-full" />
              </div>
            </div>
          ) : (
            <motion.div
              key={processedKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3.5"
            >
              {/* AI Classification Pill & Confidence */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#303B4D] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    AI
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-[#94A3B8]">
                      Auto-Routed Destination
                    </div>
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {activeComplaint.dept}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-semibold uppercase">
                    Confidence Score
                  </div>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <CheckCircle2 size={16} />
                    <span>{activeComplaint.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Duplicate Detection Card */}
              <div className="p-3 rounded-xl bg-violet-50/80 dark:bg-purple-950/40 border border-violet-200/70 dark:border-purple-800/60 flex items-start gap-2.5">
                <CopyCheck size={18} className="text-violet-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-violet-900 dark:text-purple-200 flex items-center gap-1.5 flex-wrap">
                    <span>Duplicate Cluster Engine:</span>
                    <span className="px-2 py-0.5 rounded-md bg-violet-200/80 dark:bg-purple-900/60 text-violet-900 dark:text-purple-200 text-[10px] font-bold border border-violet-300/50 dark:border-purple-700/50">
                      {activeComplaint.duplicatesCount} Linked Reports
                    </span>
                  </div>
                  <div className="text-[11px] text-violet-700 dark:text-[#D1D9E6] mt-1 leading-normal">
                    {activeComplaint.duplicateNote}
                  </div>
                </div>
              </div>

              {/* SLA & Action Dispatch Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#303B4D]">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#94A3B8] flex items-center gap-1 mb-1">
                    <Clock size={11} className="text-amber-500 dark:text-amber-400" />
                    Target SLA Window
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                    {activeComplaint.slaHours} Hours Resolution Guarantee
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#303B4D]">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#94A3B8] flex items-center gap-1 mb-1">
                    <Zap size={11} className="text-indigo-500 dark:text-indigo-400" />
                    Priority Level
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                    Level 1 - Automated Squad Dispatch
                  </div>
                </div>
              </div>

              {/* Dispatch Recommendation */}
              <div className="text-xs text-slate-700 dark:text-[#D1D9E6] bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200 dark:border-[#303B4D] flex items-center justify-between flex-wrap gap-2">
                <span className="truncate pr-2 font-medium">
                  💡 <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">Next Action:</span> {activeComplaint.suggestedAction}
                </span>
                <Link
                  to="/dashboard/triage"
                  className="shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors"
                >
                  View Desk <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
