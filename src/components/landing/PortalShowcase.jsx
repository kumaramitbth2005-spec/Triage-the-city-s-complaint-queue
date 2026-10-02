import React, { useState } from 'react';
import { 
  Users, ShieldCheck, CheckCircle2, ArrowRight, 
  MapPin, Clock, Camera, FileText, Bell, BarChart2,
  Smartphone, Filter, Layers, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function PortalShowcase() {
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' | 'operator'

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 shadow-xs">
              <Layers size={13} />
              <span>Unified Dual-Portal Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Tailored for Citizens & City Operators
            </h2>
          </div>

          {/* Switcher Tabs */}
          <div className="bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'citizen'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users size={16} />
              <span>Citizen Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('operator')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'operator'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Municipal Operator Desk</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'citizen' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 dark:from-slate-900/90 dark:via-slate-900 dark:to-indigo-950/40 rounded-3xl p-6 sm:p-10 border border-indigo-100 dark:border-slate-800 shadow-xl">
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Smartphone size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Empowering Citizens with Zero-Friction Reporting
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                No complex registration or passwords required. Citizens can file a pothole, pipeline burst, or sanitation grievance in under 60 seconds with live photo upload and GPS geotagging.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Instant Tracking ID (e.g. CMP-8829) with real-time stage progress',
                  'Automated SMS & WhatsApp status updates when crew is dispatched',
                  'Photo proof of completed resolution uploaded by municipal crew',
                  'Citizen feedback rating and 1-click re-open if issue persists',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/report"
                  className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>File a Complaint</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/track"
                  className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Track Grievance
                </Link>
              </div>
            </div>

            {/* Right Visual Preview */}
            <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-slate-950 p-6 border border-stone-200/80 dark:border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Live Tracking: CMP-W14-882
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                  In Progress (SLA: 2h remaining)
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Issue:</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">Water Pipeline Rupture near Gate 2</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin size={12} className="text-indigo-500" />
                    Ward 14 (Central Market)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                  <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                    Resolution Timeline
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 size={14} /> 10:15 AM - AI Triaged & Assigned to Water Works
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 size={14} /> 10:42 AM - Crew #4 Dispatched with Excavator
                  </div>
                  <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-300 font-semibold">
                    <Clock size={14} className="animate-spin" /> 11:20 AM - On-site Welding in Progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/60 dark:from-slate-900/90 dark:via-slate-900 dark:to-violet-950/40 rounded-3xl p-6 sm:p-10 border border-violet-100 dark:border-slate-800 shadow-xl">
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/20">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                High-Velocity AI Workspace for Municipal Teams
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Supercharge desk officers and ward engineers with automated NLP queue triage, batch duplicate merging, live ward heatmaps, and automatic SLA breach alerts.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Autonomous AI Triage queue with 99.4% classification accuracy',
                  'Duplicate Cluster view for 1-click batch merging and bulk dispatch',
                  'Interactive Ward GIS Heatmaps showing high-incident density zones',
                  'Executive analytics, department velocity KPIs, and PDF report export',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>Launch Operator Desk</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/dashboard/map"
                  className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Ward GIS Map
                </Link>
              </div>
            </div>

            {/* Right Visual Preview */}
            <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-slate-950 p-6 border border-stone-200/80 dark:border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-indigo-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Municipal Triage Queue (Live)
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  98.5% Auto-Routed
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Active Queue Load</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">142 pending · 34 in-field · 86 resolved today</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">Avg SLA: 3.2h</span>
                </div>

                <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-violet-900 dark:text-violet-200">Duplicate Clusters Grouped</div>
                    <div className="text-[11px] text-violet-700 dark:text-violet-300">28 redundant calls merged across 6 wards</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Saved 42hrs</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
