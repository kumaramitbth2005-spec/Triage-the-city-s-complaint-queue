import React from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, GitMerge, MapPin, Zap, 
  ShieldCheck, BarChart3, ArrowRight, Sparkles,
  Layers, CheckCircle2, Clock, Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Semantic NLP & Auto-Routing',
    badge: 'Real-Time AI',
    description: 'Advanced Natural Language Processing understands context in English, Hindi, and regional dialects, routing complaints directly to the responsible municipal engineer in < 2 seconds.',
    gradient: 'from-indigo-500 to-blue-600',
    borderGlow: 'hover:border-indigo-500/50',
    link: '/dashboard/triage',
    metric: '99.4% Accuracy'
  },
  {
    icon: GitMerge,
    title: 'Geo-Spatial Duplicate Clustering',
    badge: 'Deduplication',
    description: 'Graph-based proximity algorithms merge redundant citizen complaints within 200m radii into a single actionable master ticket, preventing wasted municipal crew dispatches.',
    gradient: 'from-violet-500 to-purple-600',
    borderGlow: 'hover:border-violet-500/50',
    link: '/dashboard/clusters',
    metric: '68% Less Redundancy'
  },
  {
    icon: MapPin,
    title: 'Interactive Ward GIS Heatmap',
    badge: 'GIS Intelligence',
    description: 'High-density visual spatial overlays pinpoint chronic infrastructure breakdown zones, pipeline leak hot spots, and ward maintenance bottlenecks in real time.',
    gradient: 'from-emerald-500 to-teal-600',
    borderGlow: 'hover:border-emerald-500/50',
    link: '/dashboard/map',
    metric: '32+ City Wards'
  },
  {
    icon: Zap,
    title: 'Automated SLA Escalation Engine',
    badge: 'SLA Monitoring',
    description: 'Dynamic countdown clocks track critical health and safety hazards, triggering automatic SMS and WhatsApp alerts to Zonal Commissioners before SLAs breach.',
    gradient: 'from-amber-500 to-orange-600',
    borderGlow: 'hover:border-amber-500/50',
    link: '/dashboard/complaints',
    metric: '4h Emergency SLA'
  },
  {
    icon: Smartphone,
    title: 'Citizen Portal & Live Tracking',
    badge: 'Citizen 360',
    description: 'Citizens can file a complaint in under 60 seconds with GPS location and photo evidence, then track grievance resolution stages live with full audit trail proof.',
    gradient: 'from-blue-500 to-cyan-600',
    borderGlow: 'hover:border-blue-500/50',
    link: '/report',
    metric: 'Zero-Login Tracking'
  },
  {
    icon: BarChart3,
    title: 'Predictive Analytics & KPI Reports',
    badge: 'Executive Insights',
    description: 'Comprehensive executive reporting dashboards calculate department resolution velocity, workforce efficiency, and forecast seasonal civic risks like monsoon drain floods.',
    gradient: 'from-rose-500 to-pink-600',
    borderGlow: 'hover:border-rose-500/50',
    link: '/dashboard/analytics',
    metric: 'Instant PDF Export'
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4 shadow-xs">
            <Sparkles size={13} />
            <span>Enterprise Civic Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Engineered to Solve City-Scale <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 bg-clip-text text-transparent">
              Grievance Bottlenecks
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Eliminate manual sorting backlogs. Empower municipal operators with autonomous AI routing, instant deduplication, and complete citizen transparency.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`group rounded-3xl p-6 sm:p-7 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-stone-200/80 dark:border-slate-800/90 shadow-lg shadow-stone-900/5 dark:shadow-indigo-950/30 transition-all duration-300 hover:-translate-y-1.5 ${feature.borderGlow} flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Background Hover Flare */}
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div>
                  {/* Top Row: Icon & Metric Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      {feature.metric}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2.5 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="mt-6 pt-4 border-t border-stone-200/60 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {feature.badge}
                  </span>
                  <Link
                    to={feature.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                  >
                    <span>Explore</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
