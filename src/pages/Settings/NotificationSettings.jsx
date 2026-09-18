import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSettings } from '../../context/SettingsContext';
import { CheckCircle2, Mail, BellRing, ShieldAlert, Sparkles, Activity, Inbox, Cpu } from 'lucide-react';

export function NotificationSettings() {
  const { state, dispatch, saveStatus } = useSettings();

  const notifications = state.notifications || {
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
      payload: { [key]: !notifications[key] }
    });
  };

  const notificationItems = [
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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Configure your alert channels, frequency, and urgent event triggers.</p>
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
          <CardTitle>Notification Channels & Event Triggers</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {notificationItems.map((item) => {
            const Icon = item.icon;
            const isChecked = notifications[item.key] !== false;

            return (
              <div key={item.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3.5 pr-4">
                  <div className={`p-2 rounded-lg ${item.iconColor} shrink-0 mt-0.5`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-800">{item.title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</div>
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
    </div>
  );
}
