import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Settings, History, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useSettings();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.addEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {state.profile.avatar ? (
          <img src={state.profile.avatar} alt="Avatar" className="w-6 h-6 rounded-full border border-gray-200" />
        ) : (
          <UserCircle size={24} className="text-slate-400" />
        )}
        <span className="hidden lg:inline truncate max-w-[100px]">{state.profile.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="font-semibold text-gray-800 truncate">{state.profile.name}</p>
            <p className="text-xs text-gray-500 truncate">{state.profile.role}</p>
          </div>
          
          <div className="py-2">
            <button 
              onClick={() => handleNavigate('/settings/profile')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
            >
              <UserCircle size={16} className="text-gray-400" />
              My Profile
            </button>
            <button 
              onClick={() => handleNavigate('/settings')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
            >
              <Settings size={16} className="text-gray-400" />
              Settings
            </button>
            <button 
              onClick={() => handleNavigate('/settings/activity')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
            >
              <History size={16} className="text-gray-400" />
              Activity History
            </button>
          </div>
          
          <div className="py-2 border-t border-gray-100">
            <button 
              onClick={() => { setIsOpen(false); alert('Logged out successfully (Mock)'); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
