import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { activityApi } from '../../api/settingsApi';
import { useTranslation } from '../../context/LanguageContext';
import { Loader2, Trash2, AlertTriangle, RotateCcw, Clock } from 'lucide-react';

export function ActivityHistory() {
  const { t } = useTranslation();
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
          <h1 className="text-2xl font-bold text-gray-900">{t('activityHistory', 'Activity History')}</h1>
          <p className="text-gray-500 mt-1">Review authenticated actions, logins, and settings changes on your account.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="form-select w-full sm:w-40 rounded-lg border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-xs font-semibold text-gray-700"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">{t('all', 'All Activity')}</option>
            <option value="LOGIN">Logins</option>
            <option value="UPDATED">Updates</option>
            <option value="THEME">Theme Changes</option>
            <option value="SETTINGS">{t('settings', 'Settings')}</option>
          </select>
          {activities.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs py-2 px-3 gap-1.5 shrink-0"
            >
              <Trash2 size={14} /> {t('clearHistory', 'Clear')}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Audit Log</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchActivities} disabled={loading} className="gap-1.5 text-xs text-blue-600">
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} /> {t('refresh', 'Refresh')}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center items-center gap-2 text-slate-500 text-sm">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              <span>{t('loading', 'Loading activity log...')}</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {t('noRecords', 'No activities recorded yet.')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target / Resource</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-500 whitespace-nowrap flex items-center gap-2">
                        <Clock size={13} className="text-gray-400 shrink-0" />
                        {item.date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800 text-xs capitalize">
                        {item.action}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600 font-mono">
                        {item.target}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={item.status === 'Success' ? 'success' : 'warning'} className="text-[10px] capitalize">
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Clear Activity History?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This will permanently delete all audit logs and sign-in records. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isClearing}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button variant="danger" size="sm" onClick={handleClearHistory} disabled={isClearing} className="gap-1.5">
                {isClearing && <Loader2 size={14} className="animate-spin" />}
                {isClearing ? t('loading', 'Clearing...') : t('clearHistory', 'Clear All Logs')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
