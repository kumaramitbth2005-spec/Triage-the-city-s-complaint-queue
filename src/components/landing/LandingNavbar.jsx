import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, ArrowRight, UserCircle, Sun, Moon, 
  Globe, Menu, X, Sparkles, MapPin, FileText, 
  Search, ShieldCheck 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../context/LanguageContext';

export function LandingNavbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const { state, dispatch } = useSettings();
  const { currentLang, setLanguage } = useTranslation();

  const isDarkMode = state.theme === 'dark' || 
    (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    dispatch({ type: 'SET_THEME', payload: nextTheme });
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-12 ${
          scrolled ? 'py-2.5' : 'py-4'
        }`}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-slate-800 shadow-lg shadow-stone-900/5 dark:shadow-indigo-950/40'
            : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-stone-200/60 dark:border-slate-800/80 shadow-xs'
        }`}>
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers size={19} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">Nexus AI</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  CIVIC v2.0
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">City Complaint Triage & SLA System</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <a 
              href="#features" 
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all"
            >
              Features
            </a>
            <a 
              href="#demo" 
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all flex items-center gap-1"
            >
              <Sparkles size={14} className="text-indigo-500" />
              Live AI Demo
            </a>
            <a 
              href="#workflow" 
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all"
            >
              How It Works
            </a>
            <Link 
              to="/report" 
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
            >
              <FileText size={14} />
              Citizen Portal
            </Link>
            <Link 
              to="/track" 
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
            >
              <Search size={14} />
              Track Status
            </Link>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>

            {/* Language Selector */}
            <div className="relative hidden sm:flex items-center">
              <select
                value={currentLang}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl pl-6 pr-6 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                aria-label="Language Selector"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिंदी (HI)</option>
                <option value="hinglish">Hinglish</option>
              </select>
              <Globe size={13} className="absolute left-2 text-slate-500 dark:text-slate-400 pointer-events-none" />
            </div>

            {/* Sign In Button */}
            <button
              onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
              className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs sm:text-sm px-3 py-1.5 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <UserCircle size={16} /> 
              <span>Sign In</span>
            </button>

            {/* Operator Portal Primary CTA */}
            <Link 
              to="/dashboard" 
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck size={15} />
              <span>Operator Desk</span>
              <ArrowRight size={14} className="hidden sm:inline" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 max-w-7xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-stone-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xl space-y-3"
            >
              <div className="flex flex-col space-y-1">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Features & Capabilities
                </a>
                <a 
                  href="#demo" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-indigo-500" />
                  Live AI Triage Simulation
                </a>
                <a 
                  href="#workflow" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  How It Works
                </a>
                <Link 
                  to="/report" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  Citizen Portal (File Complaint)
                </Link>
                <Link 
                  to="/track" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Search size={16} />
                  Track Grievance Status
                </Link>
                <Link 
                  to="/dashboard/map" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <MapPin size={16} />
                  Ward GIS Heatmap
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Language:</span>
                  <select
                    value={currentLang}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); setAuthMode('login'); setIsAuthOpen(true); }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                >
                  <UserCircle size={15} />
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
