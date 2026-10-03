import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, UserPlus, LogIn, AlertTriangle, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../context/LanguageContext';
import { authApi } from '../../api/authApi';
import { AuthModal } from '../auth/AuthModal';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useSettings();
  const { t } = useTranslation();

  const isAuthenticated = !!localStorage.getItem('auth_token');

  // Close dropdown on location change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Click outside to close & Escape key handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsLogoutConfirmOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout().catch(() => {});
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
      setIsOpen(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('settings');
      dispatch({ type: 'RESET_ALL' });
      navigate('/');
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={containerRef}>
        {/* Profile Avatar Button */}
        <button 
          onClick={() => setIsOpen(prev => !prev)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="User profile menu"
          className="flex items-center gap-2 p-1 sm:px-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {state.profile?.avatar ? (
            <img 
              src={state.profile.avatar} 
              alt={state.profile?.name || 'User Avatar'} 
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs ring-2 ring-blue-500/10" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-2 ring-blue-500/10">
              {state.profile?.name ? state.profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span className="hidden lg:inline truncate max-w-[120px] font-semibold text-xs text-slate-800 dark:text-slate-200 text-left">
            {state.profile?.name || 'Operator'}
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div 
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {/* User Identity Section */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 flex items-center gap-3">
              {state.profile?.avatar ? (
                <img 
                  src={state.profile.avatar} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                  {state.profile?.name ? state.profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{state.profile?.name || 'Municipal User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{state.profile?.email || 'user@example.com'}</p>
                {state.profile?.role && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium border border-blue-100 dark:border-blue-800/60 capitalize">
                    {state.profile.role.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions List */}
            <div className="py-1.5" role="none">
              <button 
                role="menuitem"
                onClick={() => handleNavigate('/dashboard/settings/profile')}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <User size={16} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span>{t('profile', 'Profile')}</span>
              </button>
            </div>
            
            <div className="py-1.5 border-t border-slate-100 dark:border-slate-800" role="none">
              {isAuthenticated ? (
                <button 
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    setIsLogoutConfirmOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <LogOut size={16} className="text-rose-500 dark:text-rose-400" />
                  <span>{t('logout', 'Log Out')}</span>
                </button>
              ) : (
                <div className="space-y-1">
                  <button 
                    role="menuitem"
                    onClick={() => openAuth('login')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <LogIn size={16} />
                    <span>{t('login', 'Sign In')}</span>
                  </button>
                  <button 
                    role="menuitem"
                    onClick={() => openAuth('register')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <UserPlus size={16} />
                    <span>Create Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <button 
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 id="logout-dialog-title" className="text-base font-bold text-slate-900 dark:text-white">
                Log out?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to log out of your session? You will need to sign in again to access your private municipal workspace.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for Sign In / Register */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </>
  );
}
