import React from 'react';
import { motion } from 'framer-motion';

export function Background3D() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/50 pointer-events-none">
      {/* Ambient Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #4338ca 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Floating Animated Ambient Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-24 -right-24 w-96 h-96 sm:w-[32rem] sm:h-[32rem] rounded-full bg-gradient-to-br from-indigo-300/35 via-violet-300/25 to-purple-200/10 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -30, 40, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 -left-20 w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-full bg-gradient-to-tr from-blue-300/30 via-indigo-200/25 to-violet-200/10 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 25, -35, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-20 right-1/4 w-88 h-88 sm:w-[30rem] sm:h-[30rem] rounded-full bg-gradient-to-t from-violet-300/25 via-fuchsia-200/20 to-transparent blur-3xl"
      />

      {/* Subtle glowing ring accents */}
      <div className="absolute top-1/4 right-1/6 w-72 h-72 rounded-full border border-indigo-200/30 -rotate-12 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/8 w-96 h-96 rounded-full border border-violet-200/20 rotate-45 pointer-events-none" />
    </div>
  );
}
