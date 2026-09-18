import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Complaints', path: '/dashboard/complaints', icon: Inbox },
  { name: 'AI Triage', path: '/dashboard/triage', icon: BrainCircuit },
  { name: 'Duplicate Clusters', path: '/dashboard/clusters', icon: Copy },
  { name: 'Map View', path: '/dashboard/map', icon: Map },
  { name: 'Analytics', path: '/dashboard/analytics', icon: LineChart },
  { name: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
  { name: 'Data Import', path: '/dashboard/import', icon: Database },
];

const adminNavItems = [
  { name: 'Departments', path: '/dashboard/departments', icon: Building2 },
  { name: 'Users', path: '/dashboard/users', icon: Users },
];

const bottomNavItems = [
  { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
];

export function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
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

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-700 flex flex-col min-h-screen transition-all duration-300 ease-in-out md:relative shadow-xl md:shadow-none border-r border-gray-200",
        isOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:translate-x-0 md:-ml-64"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</div>
          <button 
            className="md:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Report Complaint CTA */}
        <div className="px-4 pb-3">
          <button
            onClick={() => { navigate('/dashboard/new-complaint'); setIsOpen(false); }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
            aria-label="Report a new complaint"
          >
            <PlusCircle size={17} /> Report Complaint
          </button>
        </div>
        <nav className="space-y-1 px-6 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200 ease-in-out",
                isActive 
                  ? "text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-6 pb-3 border-t border-gray-100 pt-3">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">Admin</div>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 ease-in-out",
                isActive 
                  ? "text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200 ease-in-out",
                isActive 
                  ? "text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}
