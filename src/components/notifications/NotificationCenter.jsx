import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { notificationApi } from '../../api/notificationApi';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { notifications, setNotifications } = useAppContext();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await notificationApi.markAllRead();
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const markRead = async (id) => {
    const isMockId = typeof id !== 'string' && id > 1000000;
    setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
    if (!isMockId) {
      try {
        await notificationApi.markRead(id);
      } catch (e) {
        console.error('Failed to mark read', e);
      }
    }
  };

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {(!notifications || notifications.length === 0) ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <div 
                    key={notification.id || notification._id} 
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/40' : ''}`}
                    onClick={() => markRead(notification.id || notification._id)}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-gray-200'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{notification.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <span className="text-xs text-gray-400">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
