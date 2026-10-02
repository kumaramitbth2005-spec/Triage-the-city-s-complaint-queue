import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the AI classify complaints so accurately?',
    a: 'Nexus AI utilizes domain-specific Natural Language Processing models trained on hundreds of thousands of municipal civic complaints. It extracts intent, sentiment, emergency keywords, and spatial markers from English, Hindi, and regional phrasing to classify both department and urgency with over 99.4% accuracy.'
  },
  {
    q: 'Can citizens lodge and track grievances without registering?',
    a: 'Yes! The Citizen Portal is designed with zero barrier to entry. Citizens can file an issue in under 60 seconds by providing description, category, and GPS location. An instant tracking token (e.g. CMP-8829) is generated to check live status at any time.'
  },
  {
    q: 'How does duplicate cluster detection prevent wasted city resources?',
    a: 'When an incident occurs (such as a water main rupture or traffic signal failure), dozens of citizens often report the exact same issue. Our geospatial clustering algorithms automatically detect matching descriptions within a 200-meter radius, linking them into a unified incident cluster so only one municipal squad is dispatched.'
  },
  {
    q: 'What happens when a critical emergency SLA is near breach?',
    a: 'The SLA engine monitors real-time countdown clocks. If a Level-1 critical hazard (like sewage overflow or live wire) is unresolved after 75% of the allotted time window, automated escalation notifications are dispatched to the Zonal Commissioner and Chief Engineer.'
  },
  {
    q: 'Can the platform integrate with legacy municipal ERP systems?',
    a: 'Yes. Nexus AI provides flexible REST APIs and CSV batch import engines that synchronize bidirectionally with existing smart city ERPs, grievance hotlines (such as 1913), and mobile worker dispatch applications.'
  }
];

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-slate-100/40 dark:bg-slate-900/30 border-t border-stone-200/80 dark:border-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 shadow-xs">
            <HelpCircle size={13} />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Everything you need to know about Nexus AI triage, citizen tracking, and municipal deployment.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg tracking-tight">{faq.q}</span>
                  <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''
                  }`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
