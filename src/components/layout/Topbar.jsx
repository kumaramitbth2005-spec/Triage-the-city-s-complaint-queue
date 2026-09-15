import React from 'react';
import { Search, Moon, Landmark, Menu } from 'lucide-react';
import { GlobalSearch } from '../search/GlobalSearch';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { ProfileMenu } from './ProfileMenu';

export function Topbar({ toggleSidebar }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-30">
      
      <div className="flex items-center gap-3 w-1/3 sm:w-auto">
        <button 
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
          <Landmark size={18} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div className="hidden sm:block overflow-hidden">
          <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">City Complaint Triage</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Municipal Zone Office</p>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-4 max-w-lg hidden sm:flex lg:ml-8 lg:mr-8">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 sm:gap-4 w-auto justify-end">
        <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Search size={20} />
        </button>
        <NotificationCenter />
        <button className="hidden sm:block p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <Moon size={20} />
        </button>
        <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></div>
        <ProfileMenu />
      </div>
    </header>
  );
}
