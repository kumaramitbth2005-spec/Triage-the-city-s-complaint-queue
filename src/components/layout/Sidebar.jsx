import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Inbox, 
  BrainCircuit, 
  Copy, 
  BarChart3, 
  Database,
  X,
  Settings as SettingsIcon,
  PlusCircle,
  Map,
  LineChart,
  Building2,
  Users,
  ChevronDown,
  Palette,
  Globe,
  Bell,
  User,
  Shield,
  Lock,
  Accessibility,
  History,
  Info
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

const navItems = [
  { key: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'complaints', name: 'Complaints', path: '/dashboard/complaints', icon: Inbox },
  { key: 'aiTriage', name: 'AI Triage', path: '/dashboard/triage', icon: BrainCircuit },
  { key: 'duplicateClusters', name: 'Duplicate Clusters', path: '/dashboard/clusters', icon: Copy },
  { key: 'mapView', name: 'Map View', path: '/dashboard/map', icon: Map },
  { key: 'analytics', name: 'Analytics', path: '/dashboard/analytics', icon: LineChart },
  { key: 'reports', name: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
  { key: 'dataImport', name: 'Data Import', path: '/dashboard/import', icon: Database },
];

const adminNavItems = [
  { key: 'departments', name: 'Departments', path: '/dashboard/departments', icon: Building2 },
  { key: 'users', name: 'Users', path: '/dashboard/users', icon: Users },
];

export const settingsSubItems = [
  { key: 'general', name: 'General', path: '/dashboard/settings/general', icon: SettingsIcon },
  { key: 'theme', name: 'Theme', path: '/dashboard/settings/theme', icon: Palette },
  { key: 'language', name: 'Language', path: '/dashboard/settings/language', icon: Globe },
  { key: 'notifications', name: 'Notifications', path: '/dashboard/settings/notifications', icon: Bell },
  { key: 'profile', name: 'Profile', path: '/dashboard/settings/profile', icon: User },
  { key: 'privacy', name: 'Privacy & Data', path: '/dashboard/settings/privacy', icon: Shield },
  { key: 'security', name: 'Security', path: '/dashboard/settings/security', icon: Lock },
  { key: 'accessibility', name: 'Accessibility', path: '/dashboard/settings/accessibility', icon: Accessibility },
  { key: 'activityHistory', name: 'Activity History', path: '/dashboard/settings/activity', icon: History },
  { key: 'about', name: 'About', path: '/dashboard/settings/about', icon: Info },
];

export function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isSettingsActive = location.pathname.startsWith('/dashboard/settings') || location.pathname === '/dashboard/profile';
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(isSettingsActive);

  // Synchronize expansion with active route
  useEffect(() => {
    if (isSettingsActive) {
      setIsSettingsExpanded(true);
    }
  }, [isSettingsActive]);

  const handleSettingsClick = () => {
    if (!isSettingsExpanded) {
      setIsSettingsExpanded(true);
      if (!isSettingsActive) {
        navigate('/dashboard/settings/general');
      }
    } else {
      setIsSettingsExpanded(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sticky Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out md:relative shadow-xl md:shadow-none border-r border-gray-200 dark:border-slate-800 shrink-0",
        isOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:translate-x-0 md:-ml-64"
      )}>
        {/* Header / Menu label */}
        <div className="p-5 pb-3 flex items-center justify-between shrink-0">
          <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('menu', 'Menu')}</div>
          <button 
            className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Report Complaint CTA */}
        <div className="px-4 pb-3 shrink-0">
          <button
            onClick={() => { navigate('/dashboard/new-complaint'); setIsOpen(false); }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            aria-label="Report a new complaint"
          >
            <PlusCircle size={17} /> {t('reportComplaint', 'Report Complaint')}
          </button>
        </div>

        {/* Single Smoothly Scrollable Navigation Area with generous bottom space */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-16">
          {/* Main Navigation Items */}
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ease-in-out",
                isActive 
                  ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-900/30" 
                  : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{t(item.key, item.name)}</span>
            </NavLink>
          ))}

          {/* Administration Section */}
          <div className="pt-4 pb-1">
            <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1.5">{t('admin', 'Admin')}</div>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ease-in-out",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-900/30" 
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                <span className="truncate">{t(item.key, item.name)}</span>
              </NavLink>
            ))}
          </div>

          {/* Expandable Settings Section - Parallel & Inline in Sidebar */}
          <div className="pt-4 pb-2">
            <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1.5">{t('preferences', 'Preferences')}</div>
            
            <button
              type="button"
              onClick={handleSettingsClick}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ease-in-out cursor-pointer group",
                isSettingsActive 
                  ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-900/30" 
                  : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
              )}
              aria-expanded={isSettingsExpanded}
            >
              <div className="flex items-center gap-3 truncate">
                <SettingsIcon size={18} className="shrink-0 transition-transform group-hover:rotate-45" />
                <span className="truncate">{t('settings', 'Settings')}</span>
              </div>
              <ChevronDown 
                size={16} 
                className={cn(
                  "shrink-0 transition-transform duration-200 text-gray-400 dark:text-slate-500",
                  isSettingsExpanded && "rotate-180 text-blue-600 dark:text-blue-400"
                )} 
              />
            </button>

            {/* Expandable 10 Sub-features (Inline) */}
            <div className={cn(
              "grid transition-all duration-300 ease-in-out overflow-hidden",
              isSettingsExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
            )}>
              <div className="min-h-0 pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 ml-4">
                {settingsSubItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = location.pathname === subItem.path || (subItem.key === 'general' && (location.pathname === '/dashboard/settings' || location.pathname === '/dashboard/settings/'));

                  return (
                    <NavLink
                      key={subItem.key}
                      to={subItem.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors duration-150",
                        isSubActive 
                          ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-900/40 shadow-xs" 
                          : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <SubIcon size={15} className="shrink-0" />
                      <span className="truncate">{t(subItem.key, subItem.name)}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generous bottom padding buffer */}
          <div className="h-8" aria-hidden="true" />
        </nav>
      </aside>
    </>
  );
}
