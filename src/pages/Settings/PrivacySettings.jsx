import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function PrivacySettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Privacy & Data</h1>
        <p className="text-gray-500 mt-1">Manage data sharing and privacy controls.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Sharing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-700">Analytics Data</div>
              <div className="text-sm text-gray-500">Share anonymous usage data to help improve the system</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-700">Error Reporting</div>
              <div className="text-sm text-gray-500">Automatically send crash reports to the development team</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Clear Local Data</p>
                <p className="text-sm text-gray-500">Remove all locally cached data and preferences</p>
              </div>
              <Button variant="outline">Clear Data</Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Download My Data</p>
                <p className="text-sm text-gray-500">Export a copy of your activity logs</p>
              </div>
              <Button variant="outline">Export CSV</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
