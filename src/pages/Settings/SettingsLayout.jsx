import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsSidebar } from './SettingsSidebar';
import { Menu } from 'lucide-react';

import { GeneralSettings } from './GeneralSettings';
import { ThemeSettings } from './ThemeSettings';
import { LanguageSettings } from './LanguageSettings';
import { NotificationSettings } from './NotificationSettings';
import { ProfileSettings } from './ProfileSettings';
import { PrivacySettings } from './PrivacySettings';
import { AccessibilitySettings } from './AccessibilitySettings';
import { ActivityHistory } from './ActivityHistory';
import { AboutSettings } from './AboutSettings';

export function SettingsLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden relative min-h-[calc(100vh-8rem)]">
      <SettingsSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setIsMobileOpen={setIsMobileSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header for Settings Sidebar */}
        <div className="lg:hidden p-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-700 bg-white border border-gray-200 shadow-xs hover:bg-gray-100 text-xs font-semibold"
          >
            <Menu size={16} />
            <span>Settings Menu</span>
          </button>
          <span className="text-xs text-gray-500 font-medium">Preferences</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/60">
          <div className="max-w-4xl mx-auto pb-10">
            <Routes>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<GeneralSettings />} />
              <Route path="theme" element={<ThemeSettings />} />
              <Route path="appearance" element={<Navigate to="../theme" replace />} />
              <Route path="language" element={<LanguageSettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="privacy" element={<PrivacySettings />} />
              <Route path="accessibility" element={<AccessibilitySettings />} />
              <Route path="activity" element={<ActivityHistory />} />
              <Route path="about" element={<AboutSettings />} />
              <Route path="*" element={<Navigate to="general" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
