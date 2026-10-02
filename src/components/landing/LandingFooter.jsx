import React from 'react';
import { 
  Layers, ArrowRight, ShieldCheck, Heart, 
  Phone, Mail, MapPin, Sparkles, Activity, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="relative bg-white dark:bg-slate-950 border-t border-stone-200/80 dark:border-slate-800/90 text-slate-700 dark:text-slate-300">
      {/* Top CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 -translate-y-12">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-2xl shadow-indigo-500/25 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Background Ambient Glows */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-3 backdrop-blur-md">
              <Sparkles size={13} />
              <span>Smart City Transformation</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Ready to Accelerate Your City's Grievance Queue?
            </h3>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base">
              Deploy autonomous AI routing, eliminate duplicate reports, and give citizens complete resolution transparency.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-indigo-900 text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <ShieldCheck size={17} className="text-indigo-600" />
              <span>Launch Operator Desk</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/report"
              className="px-6 py-3.5 rounded-full bg-indigo-900/60 hover:bg-indigo-900/80 border border-white/20 text-white text-sm font-semibold transition-all active:scale-95"
            >
              File Citizen Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Layers size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Nexus AI</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Civic Grievance Triage & SLA Engine
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Empowering smart municipal administrations with real-time NLP classification, geospatial duplicate grouping, and automated field squad dispatch.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Civic AI Engines 100% Operational</span>
            </div>
          </div>

          {/* Citizen Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/report" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Lodge New Complaint
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Track Grievance Status
                </Link>
              </li>
              <li>
                <Link to="/dashboard/map" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Ward Hotspot Map
                </Link>
              </li>
              <li>
                <a href="#demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Live AI Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Operator Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Municipal Workspace
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Operator Overview
                </Link>
              </li>
              <li>
                <Link to="/dashboard/triage" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  AI Triage Queue
                </Link>
              </li>
              <li>
                <Link to="/dashboard/clusters" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Duplicate Clusters
                </Link>
              </li>
              <li>
                <Link to="/dashboard/analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  SLA & Velocity Analytics
                </Link>
              </li>
              <li>
                <Link to="/dashboard/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  System Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Municipal Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              City Helplines
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-indigo-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">1913 (Toll-Free City Desk)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-indigo-500" />
                <span>+91 1800-CIVIC-24 (24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-indigo-500" />
                <span>grievance@municipal.gov.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-indigo-500" />
                <span>Municipal HQ, Central Zone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-12 pt-6 border-t border-stone-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © 2026 Nexus AI Civic Platform · Municipal Public Works & Grievance Redressal
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-indigo-600 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-indigo-600 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-indigo-600 cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
