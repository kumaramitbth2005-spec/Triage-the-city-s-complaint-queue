import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, ShieldCheck, Zap, 
  MapPin, CheckCircle2, FileText, Search, Activity
} from 'lucide-react';
import { LiveTriageDemo } from './LiveTriageDemo';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 90, damping: 18 }
  }
};

export function HeroContent() {
  return (
    <div className="w-full">
      {/* Main Hero Header Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto text-center pt-28 sm:pt-36 pb-14"
      >
        {/* Glowing Pill Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-50/90 via-violet-50/90 to-purple-50/90 dark:from-indigo-950/80 dark:via-violet-950/80 dark:to-purple-950/80 border border-indigo-200/80 dark:border-indigo-800/60 shadow-md shadow-indigo-500/5 mb-6">
          <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            Next-Gen AI Civic Intelligence 2.0
          </span>
          <span className="hidden sm:inline text-stone-300 dark:text-slate-700">|</span>
          <span className="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-400">
            Automated Ward SLA & Triaging
          </span>
        </motion.div>
        
        {/* Main Massive Heading */}
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-slate-900 dark:text-white">
          <span>Intelligent City Complaint Queue & </span>
          <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
            Autonomous AI Triage
          </span>
        </motion.h1>
        
        {/* Subtitle / Description */}
        <motion.p variants={itemVariants} className="text-base sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
          Accelerate municipal grievance resolution by <span className="font-semibold text-slate-900 dark:text-white">3.8x</span>. Multi-lingual NLP auto-routes complaints, groups duplicate issues in real time, and provides transparent live tracking for citizens.
        </motion.p>
        
        {/* Action CTAs */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link 
            to="/dashboard"
            className="group flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all active:scale-95 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/35"
          >
            <ShieldCheck size={18} />
            <span>Launch Operator Desk</span> 
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
          
          <Link 
            to="/report"
            className="flex items-center justify-center gap-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-stone-200/80 dark:border-slate-700/80 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold text-sm sm:text-base transition-all active:scale-95 shadow-xs hover:shadow-md"
          >
            <FileText size={17} className="text-indigo-600 dark:text-indigo-400" />
            <span>File Citizen Complaint</span>
          </Link>

          <Link 
            to="/track"
            className="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold text-xs sm:text-sm px-4 py-3 transition-colors"
          >
            <Search size={15} />
            <span>Track Existing Ticket →</span>
          </Link>
        </motion.div>

        {/* Live Trust & Performance Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-14 pt-10 border-t border-stone-200/70 dark:border-slate-800/80">
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-stone-200/50 dark:border-slate-800/50 backdrop-blur-xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">99.4%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">AI Routing Accuracy</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-stone-200/50 dark:border-slate-800/50 backdrop-blur-xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">3.8x</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Faster Resolution</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-stone-200/50 dark:border-slate-800/50 backdrop-blur-xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">&lt; 2 Sec</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Instant Triage Time</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-stone-200/50 dark:border-slate-800/50 backdrop-blur-xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">45,000+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Grievances Solved</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Interactive Live AI Triage Demo Section */}
      <section id="demo" className="relative z-20 pb-16">
        <LiveTriageDemo />
      </section>
    </div>
  );
}
