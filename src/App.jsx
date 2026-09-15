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

// New Settings route import (lazy load optional)
import { SettingsLayout } from './pages/Settings/SettingsLayout';
import { NewComplaint } from './pages/NewComplaint';

export default function App() {
  return (
    <SettingsProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="triage" element={<AITriage />} />
              <Route path="clusters" element={<DuplicateClusters />} />
              <Route path="reports" element={<Reports />} />
              <Route path="import" element={<DataImport />} />
              <Route path="settings/*" element={<SettingsLayout />} />
              <Route path="new-complaint" element={<NewComplaint />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </SettingsProvider>
  );
}
