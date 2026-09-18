import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Settings, 
  Palette, 
  Globe, 
  Bell, 
  User, 
  Shield, 
  Accessibility, 
  History, 
  Info,
  X
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export const settingsNavItems = [
  { name: 'General', path: 'general', alias: '', icon: Settings },
  { name: 'Theme', path: 'theme', icon: Palette },
  { name: 'Language', path: 'language', icon: Globe },
  { name: 'Notifications', path: 'notifications', icon: Bell },
  { name: 'Profile', path: 'profile', icon: User },
  { name: 'Privacy & Data', path: 'privacy', icon: Shield },
  { name: 'Accessibility', path: 'accessibility', icon: Accessibility },
  { name: 'Activity History', path: 'activity', icon: History },
  { name: 'About', path: 'about', icon: Info },
];

export function SettingsSidebar({ isMobileOpen, setIsMobileOpen }) {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity" 
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-lg lg:shadow-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{t('settings', 'Settings')}</h2>
            <p className="text-xs text-gray-500">Manage your application preferences</p>
          </div>
          {isMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen(false)} 
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              aria-label="Close settings menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {settingsNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out group",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-xs" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              )}
            >
              <item.icon size={18} className="shrink-0 transition-transform group-hover:scale-105" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
