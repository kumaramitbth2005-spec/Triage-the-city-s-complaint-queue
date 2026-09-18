import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { activityApi } from '../../api/settingsApi';
import { Download, Trash2, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function PrivacySettings() {
  const { state, dispatch, saveStatus } = useSettings();
  const { complaints } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const privacy = state.privacy || {
    profileVisibility: 'Internal Only',
    activityHistory: true,
    dataCollection: true,
    personalization: true,
  };

  const handleToggle = (key) => {
    dispatch({
      type: 'UPDATE_PRIVACY',
      payload: { [key]: !privacy[key] }
    });
  };

  const handleVisibilityChange = (value) => {
    dispatch({
      type: 'UPDATE_PRIVACY',
      payload: { profileVisibility: value }
    });
  };

  // Download My Data
  const handleDownloadData = () => {
    const userDataDump = {
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      settings: state,
      complaintsSummary: {
        totalComplaintsCount: complaints?.length || 0,
        sampleRecords: (complaints || []).slice(0, 10).map(c => ({
          id: c.id || c.complaintId,
          department: c.department,
          urgency: c.urgency,
          status: c.status,
          createdAt: c.createdAt
        }))
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userDataDump, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexus_user_data_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setFeedback('Data export generated and downloaded successfully.');
    setTimeout(() => setFeedback(''), 3500);
  };

  // Clear Activity History Modal confirmation
  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await activityApi.clear();
      setIsModalOpen(false);
      setFeedback('Activity history cleared successfully.');
      setTimeout(() => setFeedback(''), 3500);
    } catch (err) {
      setFeedback('Failed to clear activity history. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy & Data</h1>
          <p className="text-gray-500 mt-1">Manage data sharing controls, telemetry preferences, and activity logs.</p>
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

      {feedback && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data & Activity Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Visibility */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-800">Profile Visibility</div>
              <div className="text-xs text-gray-500">Control who can view your operator contact information</div>
            </div>
            <select 
              value={privacy.profileVisibility || 'Internal Only'}
              onChange={(e) => handleVisibilityChange(e.target.value)}
              className="form-select w-44 rounded-lg border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-sm font-medium text-gray-700"
            >
              <option value="Public">Public (All Users)</option>
              <option value="Internal Only">Internal Only (Staff)</option>
              <option value="Private">Private (Admins Only)</option>
            </select>
          </div>

          {/* Activity History Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-800">Activity History Tracking</div>
              <div className="text-xs text-gray-500">When enabled, audits and records logins, triage updates, and settings changes</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={privacy.activityHistory !== false}
                onChange={() => handleToggle('activityHistory')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Data Collection */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-800">Anonymous Usage Telemetry</div>
              <div className="text-xs text-gray-500">Share anonymous performance telemetry to help optimize triage speeds</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={privacy.dataCollection !== false}
                onChange={() => handleToggle('dataCollection')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Personalization */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-800">Smart Personalization</div>
              <div className="text-xs text-gray-500">Remember your frequent search scopes and locality filters</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={privacy.personalization !== false}
                onChange={() => handleToggle('personalization')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management & Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
            <div>
              <div className="font-medium text-gray-800">Download My Data</div>
              <div className="text-xs text-gray-500">Export a complete JSON archive of your profile, preferences, and activity summaries</div>
            </div>
            <Button variant="outline" onClick={handleDownloadData} className="gap-2 shrink-0">
              <Download size={15} /> Export JSON
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <div>
              <div className="font-medium text-red-600">Clear Activity History</div>
              <div className="text-xs text-gray-500">Permanently delete all activity and audit logs associated with your account</div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(true)}
              className="gap-2 shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 size={15} /> Clear History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Clear Activity History?</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to permanently clear your activity history? This will delete all your audit and event records. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isClearing}>
                Cancel
              </Button>
              <Button 
                onClick={handleClearHistory} 
                disabled={isClearing}
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                {isClearing && <Loader2 size={15} className="animate-spin" />}
                Yes, Clear History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
