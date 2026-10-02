import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../context/LanguageContext';
import { useAppContext } from '../../context/AppContext';
import { notificationApi } from '../../api/notificationApi';
import { 
  CheckCircle2, Mail, BellRing, ShieldAlert, Sparkles, 
  Activity, Inbox, Cpu, Trash2, CheckCheck, Bell, 
  AlertTriangle, Clock, Loader2
} from 'lucide-react';

export function NotificationSettings() {
  const { state, dispatch, saveStatus } = useSettings();
  const { t } = useTranslation();
  const { notifications: contextNotifications, setNotifications: setContextNotifications } = useAppContext();
  
  const [localList, setLocalList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  // Fallback / Initial notifications fetch
  useEffect(() => {
    let isMounted = true;
    setLoadingList(true);
    notificationApi.getAll()
      .then(res => {
        if (isMounted) {
          const fetched = res.data?.data || [];
          setLocalList(fetched);
          if (setContextNotifications) setContextNotifications(fetched);
        }
      })
      .catch(() => {
        if (isMounted && contextNotifications?.length > 0) {
          setLocalList(contextNotifications);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingList(false);
      });

    return () => { isMounted = false; };
  }, [setContextNotifications, contextNotifications]);

  const notificationsPrefs = state.notifications || {
    email: true,
    push: true,
    security: true,
    productUpdates: false,
    activity: true,
    complaint: true,
    system: true,
  };

  const handleToggle = (key) => {
    dispatch({
      type: 'UPDATE_NOTIFICATIONS',
      payload: { [key]: !notificationsPrefs[key] }
    });
  };

  // Mark single as read
  const handleMarkRead = async (id) => {
    setLocalList(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    if (setContextNotifications) {
      setContextNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    }
    try {
      await notificationApi.markRead(id);
    } catch {
      // Local state is already updated
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    setLocalList(prev => prev.map(n => ({ ...n, read: true })));
    if (setContextNotifications) {
      setContextNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
    try {
      await notificationApi.markAllRead();
      setActionFeedback('All notifications marked as read.');
      setTimeout(() => setActionFeedback(''), 3000);
    } catch {
      // Local state is already updated
    }
  };

  // Delete individual notification
  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    // Immediate optimistic removal from UI
    setLocalList(prev => prev.filter(n => n._id !== id && n.id !== id));
    if (setContextNotifications) {
      setContextNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
    }
    try {
      await notificationApi.delete(id);
      setActionFeedback('Notification deleted.');
      setTimeout(() => setActionFeedback(''), 2500);
    } catch {
      // Already removed locally
    }
  };

  // Clear all notifications with confirmation
  const handleConfirmClearAll = async () => {
    setIsClearing(true);
    try {
      await notificationApi.clearAll().catch(() => {});
      setLocalList([]);
      if (setContextNotifications) setContextNotifications([]);
      setIsClearModalOpen(false);
      setActionFeedback('All notifications have been cleared.');
      setTimeout(() => setActionFeedback(''), 3000);
    } finally {
      setIsClearing(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SECURITY': return <ShieldAlert size={16} className="text-amber-600" />;
      case 'COMPLAINT': return <Inbox size={16} className="text-blue-600" />;
      case 'ACTIVITY': return <Activity size={16} className="text-emerald-600" />;
      default: return <Bell size={16} className="text-indigo-600" />;
    }
  };

  const notificationChannelItems = [
    {
      key: 'complaint',
      title: 'New Complaints Assigned',
      desc: 'Get notified when new civic complaints are routed to your ward or department',
      icon: Inbox,
      iconColor: 'text-blue-600 bg-blue-50'
    },
    {
      key: 'activity',
      title: 'Activity Notifications',
      desc: 'Receive alerts when team members resolve, escalate, or comment on complaints',
      icon: Activity,
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      key: 'security',
      title: 'Security & Access Alerts',
      desc: 'Crucial notifications regarding new logins, password changes, and permission updates',
      icon: ShieldAlert,
      iconColor: 'text-amber-600 bg-amber-50'
    },
    {
      key: 'email',
      title: 'Email Notifications & Digest',
      desc: 'Receive daily summary digests and urgent escalations in your email inbox',
      icon: Mail,
      iconColor: 'text-indigo-600 bg-indigo-50'
    },
    {
      key: 'push',
      title: 'Browser Push Notifications',
      desc: 'Display real-time desktop popups when urgent critical incidents occur',
      icon: BellRing,
      iconColor: 'text-purple-600 bg-purple-50'
    },
    {
      key: 'system',
      title: 'System & Maintenance Alerts',
      desc: 'Notices regarding scheduled AI engine updates and maintenance windows',
      icon: Cpu,
      iconColor: 'text-slate-600 bg-slate-100'
    },
    {
      key: 'productUpdates',
      title: 'Product & Feature Updates',
      desc: 'Highlights and tips when new tools, map filters, or intake options become available',
      icon: Sparkles,
      iconColor: 'text-pink-600 bg-pink-50'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('notificationsTitle', 'Notifications')}</h1>
          <p className="text-gray-500 mt-1">{t('notificationsDesc', 'Review system messages and configure alert channels.')}</p>
        </div>
        {saveStatus === 'saving' && (
          <span className="text-xs font-medium text-blue-600 animate-pulse">{t('saving', 'Saving...')}</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={14} /> {t('saved', 'Saved ✓')}
          </span>
        )}
      </div>

      {actionFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* ─── SECTION 1: NOTIFICATION INBOX / MESSAGE AREA ─── */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell size={18} className="text-blue-600" />
              <span>Notification Messages & Alerts</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {localList.filter(n => !n.read).length} unread notification{localList.filter(n => !n.read).length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {localList.length > 0 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-xs gap-1.5 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  <CheckCheck size={14} /> Mark All Read
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClearModalOpen(true)}
                  className="text-xs gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 bg-white cursor-pointer"
                >
                  <Trash2 size={14} /> Clear All
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loadingList ? (
            <div className="flex items-center justify-center py-16 text-slate-500 gap-2.5">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <span className="text-sm font-medium">Loading notifications...</span>
            </div>
          ) : localList.length === 0 ? (
            <div className="py-14 text-center space-y-2.5 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You're all caught up! Real-time municipal alerts and system messages will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {localList.map((item) => {
                const id = item._id || item.id;
                const isUnread = !item.read;

                return (
                  <div
                    key={id}
                    onClick={() => handleMarkRead(id)}
                    className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer group ${
                      isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200/60 shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={`text-sm font-semibold truncate ${isUnread ? 'text-blue-950' : 'text-slate-800'}`}>
                            {item.title}
                          </h4>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock size={11} />
                          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotification(id, e)}
                      title="Delete notification"
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── SECTION 2: NOTIFICATION CHANNELS & EVENT PREFERENCES ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Channels & Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {notificationChannelItems.map((item) => {
            const Icon = item.icon;
            const isChecked = notificationsPrefs[item.key] !== false;

            return (
              <div key={item.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3.5 pr-4">
                  <div className={`p-2 rounded-lg ${item.iconColor} shrink-0 mt-0.5`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-800 dark:text-white">{item.title}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-0.5">{item.desc}</div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isChecked} 
                    onChange={() => handleToggle(item.key)} 
                    aria-label={`Toggle ${item.title}`}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Confirmation Modal for Clear All */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Clear All Notifications?</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to permanently remove all notifications? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsClearModalOpen(false)} disabled={isClearing}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmClearAll} 
                disabled={isClearing}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
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
