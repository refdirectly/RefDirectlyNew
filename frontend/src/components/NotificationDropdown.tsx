import { useState, useEffect, useRef } from 'react';
import { Bell, X, MessageCircle, UserPlus, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string;
  senderId?: string;
  title: string;
  message: string;
  type: string;
  entityId?: string;
  avatarUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGO56+mjUhELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKGGO56+mjUhELTKXh8bllHAU2jdXzzn0vBQ==');
    
    fetchNotifications();
    fetchUnreadCount();

    if (socket) {
      socket.on('notification:new', handleNewNotification);
      socket.on('notification:count', setUnreadCount);

      return () => {
        socket.off('notification:new', handleNewNotification);
        socket.off('notification:count', setUnreadCount);
      };
    }
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Play sound if document is visible
    if (document.visibilityState === 'visible' && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.avatarUrl || '/logo.png',
        badge: '/logo.png'
      });
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
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
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);
    setIsOpen(false);
    
    // Navigate based on type
    if (notification.type === 'message' && notification.entityId) {
      navigate(`/chat?room=${notification.entityId}`);
    } else if (notification.type === 'referral' && notification.entityId) {
      navigate(`/dashboard`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'referral': return <UserPlus className="w-5 h-5 text-purple-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const groupByTime = (notifications: Notification[]) => {
    const now = new Date();
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    notifications.forEach(n => {
      const date = new Date(n.createdAt);
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) today.push(n);
      else if (diffDays === 1) yesterday.push(n);
      else older.push(n);
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupByTime(notifications);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-16 h-16 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">No notifications yet</p>
              </div>
            ) : (
              <>
                {today.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Today</div>
                    {today.map(n => (
                      <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} getIcon={getIcon} />
                    ))}
                  </div>
                )}
                {yesterday.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Yesterday</div>
                    {yesterday.map(n => (
                      <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} getIcon={getIcon} />
                    ))}
                  </div>
                )}
                {older.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Older</div>
                    {older.map(n => (
                      <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} getIcon={getIcon} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onClick, getIcon }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${
        !notification.isRead ? 'bg-purple-50/30' : ''
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {notification.avatarUrl ? (
          <img src={notification.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-1">{notification.title}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}
