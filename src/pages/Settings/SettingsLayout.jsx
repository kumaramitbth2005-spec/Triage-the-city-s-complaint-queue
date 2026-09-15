import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsSidebar } from './SettingsSidebar';
import { Menu } from 'lucide-react';

// Lazy loading category components or importing them directly
// For now, importing them directly since they are small
import { GeneralSettings } from './GeneralSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { LanguageSettings } from './LanguageSettings';
import { NotificationSettings } from './NotificationSettings';
import { ProfileSettings } from './ProfileSettings';
import { SearchSettings } from './SearchSettings';
import { PrivacySettings } from './PrivacySettings';
import { AccessibilitySettings } from './AccessibilitySettings';
import { ActivityHistory } from './ActivityHistory';
import { AboutSettings } from './AboutSettings';

export function SettingsLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      <SettingsSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setIsMobileOpen={setIsMobileSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header for Settings Sidebar */}
        <div className="lg:hidden p-4 border-b border-gray-200 flex items-center bg-gray-50">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="mr-3 p-1.5 rounded-md text-gray-500 hover:bg-gray-200"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-gray-700">Settings Menu</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <Routes>
              <Route path="" element={<GeneralSettings />} />
              <Route path="appearance" element={<AppearanceSettings />} />
              <Route path="language" element={<LanguageSettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="search" element={<SearchSettings />} />
              <Route path="privacy" element={<PrivacySettings />} />
              <Route path="accessibility" element={<AccessibilitySettings />} />
              <Route path="activity" element={<ActivityHistory />} />
              <Route path="about" element={<AboutSettings />} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
