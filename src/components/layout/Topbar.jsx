import React, { useState } from 'react';
import { Search, Landmark, Menu, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from '../search/GlobalSearch';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { ProfileMenu } from './ProfileMenu';
import { useTranslation } from '../../context/LanguageContext';

export function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 sticky top-0 z-30 transition-colors duration-200 w-full max-w-full">
      
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen ? (
        <div className="flex-1 flex items-center gap-2 animate-in fade-in duration-150 w-full min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-2 -ml-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer shrink-0"
            aria-label="Close search"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <GlobalSearch isMobileExpanded={true} onCloseMobile={() => setIsMobileSearchOpen(false)} />
          </div>
        </div>
      ) : (
        <>
          {/* Left Brand / Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <button 
              className="p-2 -ml-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer shrink-0"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Menu size={22} className="sm:w-6 sm:h-6" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
              <Landmark size={18} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="hidden sm:block overflow-hidden">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight truncate">
                {t('appTitle', 'City Complaint Triage')}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                {t('appSubtitle', 'Municipal Zone Office')}
              </p>
            </div>
          </div>

          {/* Center Search Bar (Desktop / Tablet) */}
          <div className="flex-1 flex justify-center px-4 max-w-lg hidden sm:flex lg:ml-8 lg:mr-8 min-w-0">
            <GlobalSearch />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 justify-end">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="sm:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" 
              aria-label="Open search bar"
            >
              <Search size={19} />
            </button>

            <button 
              onClick={() => navigate('/dashboard/settings/general')} 
              aria-label={t('settings', 'Settings')} 
              title={t('settings', 'Settings')}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <Settings size={19} />
            </button>
            
            <NotificationCenter />
            
            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1"></div>
            
            <ProfileMenu />
          </div>
        </>
      )}
    </header>
  );
}
