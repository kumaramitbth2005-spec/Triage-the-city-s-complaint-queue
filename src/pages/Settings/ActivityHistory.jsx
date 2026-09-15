import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function ActivityHistory() {
  const [filter, setFilter] = useState('All');
  
  // Mock history data
  const history = [
    { id: 1, date: '2026-09-15 10:23 AM', action: 'Login', target: 'System', status: 'Success' },
    { id: 2, date: '2026-09-15 11:05 AM', action: 'Update Status', target: 'CMP-2023-1042', status: 'Success' },
    { id: 3, date: '2026-09-15 11:30 AM', action: 'Export Data', target: 'Complaints List', status: 'Failed' },
    { id: 4, date: '2026-09-15 01:15 PM', action: 'Change Theme', target: 'Settings', status: 'Success' },
    { id: 5, date: '2026-09-15 02:45 PM', action: 'Assign User', target: 'CMP-2023-1099', status: 'Success' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
          <p className="text-gray-500 mt-1">Review your recent actions and login history.</p>
        </div>
        <select 
          className="form-select w-full sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All Activity</option>
          <option>Logins</option>
          <option>Updates</option>
          <option>Exports</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Date & Time</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Target</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.action}</td>
                  <td className="px-6 py-4 text-gray-600">{item.target}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status === 'Success' ? 'success' : 'danger'}>
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Load More Activity</button>
        </div>
      </Card>
    </div>
  );
}
