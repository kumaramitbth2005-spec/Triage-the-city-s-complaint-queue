import React from 'react';
import { motion } from 'framer-motion';

export function Background3D() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none transition-colors duration-500 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Ambient Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Floating Animated Nebula Orb 1 - Top Right (Indigo/Violet) */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-purple-600/10 dark:from-indigo-600/25 dark:via-violet-600/20 dark:to-purple-900/15 blur-3xl"
      />

      {/* Floating Animated Nebula Orb 2 - Left Center (Blue/Cyan) */}
      <motion.div
        animate={{
          x: [0, -35, 30, 0],
          y: [0, 35, -25, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 -left-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-blue-500/20 via-cyan-500/15 to-indigo-500/10 dark:from-blue-600/20 dark:via-cyan-600/15 dark:to-indigo-900/15 blur-3xl"
      />

      {/* Floating Animated Nebula Orb 3 - Center Bottom (Fuchsia/Purple) */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -30, 25, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-2/3 right-1/4 w-[32rem] h-[32rem] rounded-full bg-gradient-to-t from-violet-500/15 via-fuchsia-500/10 to-transparent dark:from-violet-600/20 dark:via-fuchsia-600/15 dark:to-transparent blur-3xl"
      />

      {/* Subtle Glowing Ring Accents */}
      <div className="absolute top-1/6 right-1/5 w-80 h-80 rounded-full border border-indigo-200/20 dark:border-indigo-500/10 -rotate-12 pointer-events-none" />
      <div className="absolute top-1/2 right-1/10 w-[28rem] h-[28rem] rounded-full border border-violet-200/20 dark:border-violet-500/10 rotate-45 pointer-events-none" />
      <div className="absolute bottom-1/6 left-1/8 w-72 h-72 rounded-full border border-blue-200/20 dark:border-blue-500/10 -rotate-6 pointer-events-none" />

      {/* Dark mode subtle star particle dots */}
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
