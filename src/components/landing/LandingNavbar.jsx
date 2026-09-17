import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingNavbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 lg:px-16 py-5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/50 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-[0_8px_32px_0_rgba(99,102,241,0.06)] border border-white/70">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <Layers className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-stone-900">
            Nexus AI
          </span>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-400">
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">Home</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">About</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">Features</a>
          <a href="#" className="hover:text-indigo-600 transition-colors duration-200">Contact</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hidden sm:block text-sm font-medium text-stone-400 hover:text-indigo-600 transition-colors duration-200">
            Sign In
          </Link>
          <Link 
            to="/dashboard" 
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
