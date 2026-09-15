import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSettings } from '../../context/SettingsContext';

export function NotificationSettings() {
  const { state, dispatch } = useSettings();

  const toggleNotification = (key) => {
    dispatch({ 
      type: 'UPDATE_NOTIFICATIONS', 
      payload: { [key]: !state.notifications[key] } 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">Manage how and when you receive alerts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-700">New Complaints</div>
              <div className="text-sm text-gray-500">Receive alerts when new complaints are assigned to you</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.notifications.complaint} 
                onChange={() => toggleNotification('complaint')} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-700">System Updates</div>
              <div className="text-sm text-gray-500">Alerts regarding system maintenance and AI processing</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.notifications.system} 
                onChange={() => toggleNotification('system')} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-700">Marketing & Tips</div>
              <div className="text-sm text-gray-500">Occasional messages about new features and best practices</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={state.notifications.marketing} 
                onChange={() => toggleNotification('marketing')} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Email delivery options are configured at the department level by your administrator.</p>
          <button className="text-sm text-blue-600 hover:underline font-medium">Request email configuration change</button>
        </CardContent>
      </Card>
    </div>
  );
}
