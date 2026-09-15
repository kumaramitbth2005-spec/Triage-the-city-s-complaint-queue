import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Settings, 
  Palette, 
  Globe, 
  Bell, 
  User, 
  Search, 
  Shield, 
  Accessibility, 
  History, 
  Info 
} from 'lucide-react';

const settingsNavItems = [
  { name: 'General', path: '', end: true, icon: Settings },
  { name: 'Appearance', path: 'appearance', icon: Palette },
  { name: 'Language', path: 'language', icon: Globe },
  { name: 'Notifications', path: 'notifications', icon: Bell },
  { name: 'Profile', path: 'profile', icon: User },
  { name: 'Search', path: 'search', icon: Search },
  { name: 'Privacy & Data', path: 'privacy', icon: Shield },
  { name: 'Accessibility', path: 'accessibility', icon: Accessibility },
  { name: 'Activity History', path: 'activity', icon: History },
  { name: 'About', path: 'about', icon: Info },
];

export function SettingsSidebar({ isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <p className="text-xs text-gray-500 mt-1">Manage your preferences</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {settingsNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200 ease-in-out",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
