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
      <div className="max-w-7xl mx-auto flex items-center justify-end">
        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hidden sm:block text-sm font-medium text-stone-600 hover:text-indigo-600 transition-colors duration-200">
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
