import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchNotifications();
    
    if (socket) {
      socket.on('new_notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });
      
      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      application: '📄',
      message: '💬',
      interview: '📅',
      status_update: '🔔',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 md:pt-40 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium text-lg">No notifications yet</p>
              <p className="text-gray-400 mt-2">You'll see updates here when you have new activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                  className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer border-2 ${
                    !notif.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">{notif.title}</h3>
                        {!notif.isRead && (
                          <div className="h-3 w-3 rounded-full bg-blue-600 flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-sm text-gray-400 mt-2">{formatTime(notif.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
