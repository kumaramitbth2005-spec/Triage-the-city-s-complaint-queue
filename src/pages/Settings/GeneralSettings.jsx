import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function GeneralSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        <p className="text-gray-500 mt-1">Manage basic application preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-700">Default View</div>
              <div className="text-sm text-gray-500">Choose the default page on login</div>
            </div>
            <select className="form-select w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option>Dashboard</option>
              <option>Complaints</option>
              <option>AI Triage</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <div className="font-medium text-gray-700">Items per page</div>
              <div className="text-sm text-gray-500">Number of complaints to show in tables</div>
            </div>
            <select className="form-select w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option>10 items</option>
              <option>25 items</option>
              <option>50 items</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <div className="font-medium text-gray-700">Auto-refresh</div>
              <div className="text-sm text-gray-500">Automatically refresh complaint lists</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
