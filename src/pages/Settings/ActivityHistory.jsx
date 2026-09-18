import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { activityApi } from '../../api/settingsApi';
import { Loader2, Trash2, AlertTriangle, RotateCcw, Clock, ShieldCheck } from 'lucide-react';

export function ActivityHistory() {
  const [filter, setFilter] = useState('All');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await activityApi.getAll({ limit: 50 });
      if (res.data?.data && res.data.data.length > 0) {
        const mapped = res.data.data.map(item => ({
          id: item._id || item.id,
          date: new Date(item.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          action: item.action ? item.action.replace(/_/g, ' ') : 'System Action',
          target: item.targetId || (item.details?.method ? `Auth (${item.details.method})` : (item.details?.theme ? `Theme: ${item.details.theme}` : 'System')),
          status: item.status || 'Success'
        }));
        setActivities(mapped);
      } else {
        setActivities([]);
      }
    } catch (err) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await activityApi.clear();
      setIsModalOpen(false);
      setActivities([]);
    } catch (err) {
      console.error('Failed to clear activity history', err);
    } finally {
      setIsClearing(false);
    }
  };

  const filteredHistory = filter === 'All' 
    ? activities 
    : activities.filter(item => item.action.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
          <p className="text-gray-500 mt-1">Review authenticated actions, logins, and settings changes on your account.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="form-select w-full sm:w-40 rounded-lg border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-xs font-semibold text-gray-700"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Activity</option>
            <option value="LOGIN">Logins</option>
            <option value="UPDATED">Updates</option>
            <option value="THEME">Theme Changes</option>
            <option value="SETTINGS">Settings</option>
          </select>
          {activities.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs py-2 px-3 gap-1.5 shrink-0"
            >
              <Trash2 size={14} /> Clear
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500 gap-2.5">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <span className="text-sm font-medium">Loading activity audit log...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Clock size={24} />
              </div>
              <p className="text-sm font-medium text-gray-700">No activity records found</p>
              <p className="text-xs text-gray-400">Actions you perform will be logged here in real-time.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-500 uppercase tracking-wider bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date & Time</th>
                  <th className="px-6 py-3 font-semibold">Action</th>
                  <th className="px-6 py-3 font-semibold">Target / Details</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-500">{item.date}</td>
                    <td className="px-6 py-3.5 font-semibold text-xs text-gray-900 capitalize flex items-center gap-2">
                      <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                      {item.action}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-600">{item.target}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={item.status === 'Success' ? 'success' : 'danger'} className="text-[10px]">
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Clear Activity Logs?</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete all historical activity logs for your account? This action cannot be reversed.
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
                Yes, Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
