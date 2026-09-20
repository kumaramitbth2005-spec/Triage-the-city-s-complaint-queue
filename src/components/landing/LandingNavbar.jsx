import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, ShieldCheck, Search, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingNavbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-16 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 border border-stone-200/60 shadow-xs">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Layers size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-stone-900 block leading-tight">Nexus AI</span>
            <span className="text-[10px] text-stone-500 font-medium hidden sm:block">City Complaint Triage</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <Link to="/report" className="hover:text-indigo-600 transition-colors">
            Citizen Portal
          </Link>
          <Link to="/track" className="hover:text-indigo-600 transition-colors">
            Track Grievance
          </Link>
          <Link to="/dashboard/triage" className="hover:text-indigo-600 transition-colors">
            AI Triage
          </Link>
          <Link to="/dashboard/map" className="hover:text-indigo-600 transition-colors">
            Ward Map
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link 
            to="/report" 
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
          >
            Report Issue
          </Link>
          <Link 
            to="/dashboard" 
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Operator Portal</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
