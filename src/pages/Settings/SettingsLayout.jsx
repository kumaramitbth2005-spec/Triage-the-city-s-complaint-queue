import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { GeneralSettings } from './GeneralSettings';
import { ThemeSettings } from './ThemeSettings';
import { LanguageSettings } from './LanguageSettings';
import { NotificationSettings } from './NotificationSettings';
import { ProfileSettings } from './ProfileSettings';
import { PrivacySettings } from './PrivacySettings';
import { SecuritySettings } from './SecuritySettings';
import { AccessibilitySettings } from './AccessibilitySettings';
import { ActivityHistory } from './ActivityHistory';
import { AboutSettings } from './AboutSettings';

export function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      <Routes>
        <Route index element={<Navigate to="general" replace />} />
        <Route path="general" element={<GeneralSettings />} />
        <Route path="theme" element={<ThemeSettings />} />
        <Route path="appearance" element={<Navigate to="../theme" replace />} />
        <Route path="language" element={<LanguageSettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="privacy" element={<PrivacySettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="accessibility" element={<AccessibilitySettings />} />
        <Route path="activity" element={<ActivityHistory />} />
        <Route path="about" element={<AboutSettings />} />
        <Route path="*" element={<Navigate to="general" replace />} />
      </Routes>
    </div>
  );
}
