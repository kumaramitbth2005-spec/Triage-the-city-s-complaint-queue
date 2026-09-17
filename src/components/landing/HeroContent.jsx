import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 18 }
  }
};

export function HeroContent() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl pt-24 z-10"
    >
      {/* Badge */}
      <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100/80 shadow-sm mb-8">
        <Sparkles size={14} className="text-indigo-500" />
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI-Powered Platform 2.0</span>
      </motion.div>
      
      {/* Main Heading — very large */}
      <motion.h1 variants={itemVariants} className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8">
        <span className="text-stone-900">Intelligent</span>
        <br/>
        <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-500 bg-clip-text text-transparent">
          Triage System.
        </span>
      </motion.h1>
      
      {/* Description — wider */}
      <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-stone-400 mb-12 max-w-2xl leading-relaxed font-light">
        Streamline your complaint resolution queue with <span className="text-stone-600 font-medium">AI-powered triaging</span>, duplicate detection, and intelligent clustering — all in real-time.
      </motion.p>
      
      {/* CTA Buttons */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5">
        <Link 
          to="/dashboard"
          className="group flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-10 py-5 rounded-full font-semibold text-lg transition-all active:scale-95 shadow-2xl shadow-indigo-200 hover:shadow-indigo-300"
        >
          Visit Page <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
        <Link 
          to="#about"
          className="flex items-center justify-center bg-white/70 backdrop-blur-md hover:bg-white text-stone-700 border border-stone-200 px-10 py-5 rounded-full font-semibold text-lg transition-all active:scale-95 shadow-sm hover:shadow-md"
        >
          Learn More
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-10 mt-16 pt-10 border-t border-stone-200/60">
        <div>
          <div className="text-3xl font-black text-stone-900">98.5%</div>
          <div className="text-sm text-stone-400 mt-1 font-medium">Accuracy Rate</div>
        </div>
        <div>
          <div className="text-3xl font-black text-stone-900">3x</div>
          <div className="text-sm text-stone-400 mt-1 font-medium">Faster Resolution</div>
        </div>
        <div>
          <div className="text-3xl font-black text-stone-900">10K+</div>
          <div className="text-sm text-stone-400 mt-1 font-medium">Complaints Handled</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
