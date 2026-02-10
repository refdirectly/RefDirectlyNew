import { useState, useEffect, useRef } from 'react';
import { Bell, MessageCircle, UserPlus, AlertCircle } from 'lucide-react';
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
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-3 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/80 z-50 overflow-hidden">
            {/* Arrow pointer */}
            <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200/80 transform rotate-45" />
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px] overscroll-contain">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium text-center">No notifications yet</p>
                  <p className="text-gray-400 text-sm text-center mt-1">We'll notify you when something arrives</p>
                </div>
              ) : (
                <>
                  {today.length > 0 && (
                    <div>
                      <div className="px-5 py-2.5 text-xs font-semibold text-gray-600 bg-gray-50/80 sticky top-0">Today</div>
                      {today.map(n => (
                        <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} getIcon={getIcon} />
                      ))}
                    </div>
                  )}
                  {yesterday.length > 0 && (
                    <div>
                      <div className="px-5 py-2.5 text-xs font-semibold text-gray-600 bg-gray-50/80 sticky top-0">Yesterday</div>
                      {yesterday.map(n => (
                        <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} getIcon={getIcon} />
                      ))}
                    </div>
                  )}
                  {older.length > 0 && (
                    <div>
                      <div className="px-5 py-2.5 text-xs font-semibold text-gray-600 bg-gray-50/80 sticky top-0">Older</div>
                      {older.map(n => (
                        <NotificationItem key={n._id} notification={n} onClick={() => handleNotificationClick(n)} getIcon={getIcon} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer - View All */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                  className="w-full py-3 text-center text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-gray-100/50 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({ notification, onClick, getIcon }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-150 border-b border-gray-100/50 last:border-0 ${
        !notification.isRead ? 'bg-blue-50/30' : ''
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {notification.avatarUrl ? (
          <img src={notification.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
            <div className="text-white">
              {getIcon(notification.type)}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{notification.title}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></div>
        </div>
      )}
    </div>
  );
}
