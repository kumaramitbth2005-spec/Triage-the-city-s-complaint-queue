import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';

export function ProfileSettings() {
  const { state, dispatch } = useSettings();
  const [name, setName] = useState(state.profile.name);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { name } });
    // show toast in a real app
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your public information and avatar.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-2 border-white shadow-sm overflow-hidden">
                {state.profile.avatar ? (
                  <img src={state.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{name.charAt(0)}</span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm text-gray-600 hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
              </button>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Recommended size: 256x256px</div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-xs">Upload new</Button>
                <Button variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">Remove</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email Address (Read-only)</label>
              <input 
                type="email" 
                value="operator@municipal.gov"
                disabled
                className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 shadow-sm sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Role (Read-only)</label>
              <input 
                type="text" 
                value={state.profile.role}
                disabled
                className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 shadow-sm sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Assigned Zone (Read-only)</label>
              <input 
                type="text" 
                value={state.profile.zone}
                disabled
                className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">You can request to have your account deactivated by contacting the system administrator.</p>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">Request Deactivation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
