import React from 'react';
import { 
  FileText, BrainCircuit, CheckCircle2, ArrowRight, 
  Sparkles, Smartphone, MapPin, Shield, Clock, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Citizen Files Complaint',
    subtitle: 'Multi-Channel Intake in <60 Seconds',
    description: 'Citizens lodge issues through the simple Web Portal, WhatsApp, or Helpline. System captures photos, description, and auto-detects ward GPS coordinates.',
    icon: Smartphone,
    color: 'from-blue-600 to-cyan-500',
    tags: ['GPS Geotagging', 'Photo Proof', 'No Account Needed'],
  },
  {
    step: '02',
    title: 'Autonomous AI Triage',
    subtitle: 'Real-Time Neural Processing',
    description: 'AI model reads the complaint in any language, classifies urgency, detects similar duplicate complaints in the vicinity, and routes directly to the department.',
    icon: BrainCircuit,
    color: 'from-indigo-600 to-violet-600',
    tags: ['NLP Sentiment', 'Cluster Merging', 'Dynamic SLA Tag'],
  },
  {
    step: '03',
    title: 'Field Fix & Verified Closure',
    subtitle: 'Real-Time Citizen Proof',
    description: 'Field engineers receive prioritized dispatch orders. Once fixed, completion photos are uploaded and the citizen receives SMS/Web closure confirmation.',
    icon: CheckCircle2,
    color: 'from-emerald-600 to-teal-500',
    tags: ['SLA Compliance', 'Photo Verification', 'Citizen Rating'],
  },
];

export function HowItWorks() {
  return (
    <section id="workflow" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-slate-100/50 dark:bg-slate-900/40 border-y border-stone-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/80 border border-violet-200/80 dark:border-violet-800/60 text-violet-600 dark:text-violet-400 text-xs font-bold mb-4 shadow-xs">
            <Sparkles size={13} />
            <span>Seamless Civic Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            How Nexus AI Transforms <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent">
              Complaint Resolution
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            From citizen report to field squad dispatch and verified resolution — automated end-to-end in 3 transparent steps.
          </p>
        </div>

        {/* Workflow 3-Step Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="relative rounded-3xl p-7 sm:p-8 bg-white dark:bg-slate-900/90 border border-stone-200/80 dark:border-slate-800 shadow-xl shadow-stone-900/5 dark:shadow-indigo-950/30 flex flex-col justify-between group hover:border-indigo-500/50 transition-all duration-300"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl sm:text-5xl font-black text-slate-200 dark:text-slate-800 font-mono group-hover:text-indigo-500/30 transition-colors">
                      {item.step}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                    {item.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Tags Pill Row */}
                <div className="pt-4 border-t border-stone-200/60 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {item.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Link below steps */}
        <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <span>Try Filing a Complaint (Demo)</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/track"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span>Track Existing Ticket</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
