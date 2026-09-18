import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Complaints } from './pages/Complaints';
import { AITriage } from './pages/AITriage';
import { DuplicateClusters } from './pages/DuplicateClusters';
import { Reports } from './pages/Reports';
import { DataImport } from './pages/DataImport';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import { SettingsLayout } from './pages/Settings/SettingsLayout';
import { NewComplaint } from './pages/NewComplaint';
import { LandingPage } from './pages/LandingPage';
import { ComplaintDetail } from './pages/ComplaintDetail';
import { MapView } from './pages/MapView';
import { Analytics } from './pages/Analytics';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { UserManagement } from './pages/UserManagement';
import { CitizenPortal } from './pages/CitizenPortal';
import { TrackComplaint } from './pages/TrackComplaint';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <AppProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/report" element={<CitizenPortal />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="complaints/:id" element={<ComplaintDetail />} />
              <Route path="triage" element={<AITriage />} />
              <Route path="clusters" element={<DuplicateClusters />} />
              <Route path="map" element={<MapView />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="import" element={<DataImport />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings/*" element={<SettingsLayout />} />
              <Route path="new-complaint" element={<NewComplaint />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route path="/complaints" element={<Navigate to="/dashboard/complaints" replace />} />
            <Route path="/triage" element={<Navigate to="/dashboard/triage" replace />} />
            <Route path="/clusters" element={<Navigate to="/dashboard/clusters" replace />} />
            <Route path="/map" element={<Navigate to="/dashboard/map" replace />} />
            <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
            <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
            <Route path="/import" element={<Navigate to="/dashboard/import" replace />} />
            <Route path="/departments" element={<Navigate to="/dashboard/departments" replace />} />
            <Route path="/users" element={<Navigate to="/dashboard/users" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
            <Route path="/settings/*" element={<Navigate to="/dashboard/settings" replace />} />
            <Route path="/new-complaint" element={<Navigate to="/dashboard/new-complaint" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </LanguageProvider>
  </SettingsProvider>
  );
}
