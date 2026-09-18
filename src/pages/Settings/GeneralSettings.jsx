import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings, defaultPreferences } from '../../context/SettingsContext';
import { CheckCircle2, RotateCcw, Save } from 'lucide-react';

export function GeneralSettings() {
  const { state, dispatch, saveStatus } = useSettings();
  const [localGeneral, setLocalGeneral] = useState(state.general || defaultPreferences.general);

  const handleGeneralChange = (key, value) => {
    const updated = { ...localGeneral, [key]: value };
    setLocalGeneral(updated);
    dispatch({ type: 'UPDATE_GENERAL', payload: { [key]: value } });
  };

  const handleCompactToggle = () => {
    const nextCompact = !state.compactMode;
    dispatch({ type: 'SET_COMPACT_MODE', payload: nextCompact });
  };

  const handleReset = () => {
    setLocalGeneral(defaultPreferences.general);
    dispatch({ type: 'UPDATE_GENERAL', payload: defaultPreferences.general });
    dispatch({ type: 'SET_COMPACT_MODE', payload: defaultPreferences.compactMode });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-500 mt-1">Manage basic display preferences and system behaviors.</p>
        </div>
        {saveStatus === 'saving' && (
          <span className="text-xs font-medium text-blue-600 animate-pulse">Saving...</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={14} /> Saved ✓
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System & Layout Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compact View Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-800">Compact View</div>
              <div className="text-xs text-gray-500">Reduce padding and spacing to fit more complaints and data on screen</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!state.compactMode}
                onChange={handleCompactToggle}
                aria-label="Toggle compact view"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Default Landing Page */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <div className="font-medium text-gray-800">Default View</div>
              <div className="text-xs text-gray-500">Choose the landing section when entering the application</div>
            </div>
            <select 
              value={localGeneral.defaultView || 'Dashboard'}
              onChange={(e) => handleGeneralChange('defaultView', e.target.value)}
              className="form-select w-44 rounded-lg border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm font-medium text-gray-700"
            >
              <option value="Dashboard">Dashboard</option>
              <option value="Complaints">Complaints Queue</option>
              <option value="AI Triage">AI Triage</option>
              <option value="Duplicate Clusters">Duplicate Clusters</option>
              <option value="Reports">Reports</option>
            </select>
          </div>

          {/* Items Per Page */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <div className="font-medium text-gray-800">Items per page</div>
              <div className="text-xs text-gray-500">Number of complaint records to display in tables</div>
            </div>
            <select 
              value={localGeneral.itemsPerPage || 25}
              onChange={(e) => handleGeneralChange('itemsPerPage', parseInt(e.target.value))}
              className="form-select w-44 rounded-lg border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm font-medium text-gray-700"
            >
              <option value={10}>10 records</option>
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
            </select>
          </div>

          {/* Auto Refresh */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <div className="font-medium text-gray-800">Auto-refresh Live Feeds</div>
              <div className="text-xs text-gray-500">Periodically poll new incoming ward complaints</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localGeneral.autoRefresh !== false}
                onChange={(e) => handleGeneralChange('autoRefresh', e.target.checked)}
                aria-label="Toggle auto refresh"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Auto-save Triage Drafts */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <div className="font-medium text-gray-800">Auto-save Decisions</div>
              <div className="text-xs text-gray-500">Automatically save triage decision drafts as you review</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localGeneral.autoSave !== false}
                onChange={(e) => handleGeneralChange('autoSave', e.target.checked)}
                aria-label="Toggle auto save"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" className="gap-2" onClick={handleReset}>
          <RotateCcw size={15} /> Reset Defaults
        </Button>
      </div>
    </div>
  );
}
