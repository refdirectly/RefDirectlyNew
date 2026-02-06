import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useLocation } from 'react-router-dom';
import NotificationToast from '../components/NotificationToast';

interface Notification {
  id: string;
  senderId?: string;
  title: string;
  message: string;
  type: string;
  entityId?: string;
  avatarUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();
  const location = useLocation();

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', handleNewNotification);
      socket.on('notification:count', setUnreadCount);

      return () => {
        socket.off('notification:new', handleNewNotification);
        socket.off('notification:count', setUnreadCount);
      };
    }
  }, [socket, location]);

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    const shouldShowToast = !shouldSuppressToast(notification, location.pathname);
    
    if (shouldShowToast) {
      setToasts(prev => [...prev, notification]);
    }
  };

  const shouldSuppressToast = (notification: Notification, pathname: string): boolean => {
    if (notification.type === 'message' && notification.entityId) {
      return pathname.includes(`/chat`) && pathname.includes(notification.entityId);
    }
    
    if (notification.type === 'referral') {
      return pathname.includes('/dashboard');
    }
    
    return false;
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setToasts(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleToastClick = (notification: Notification) => {
    removeNotification(notification.id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
      
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 max-w-md">
        {toasts.map(toast => (
          <NotificationToast
            key={toast.id}
            {...toast}
            onClose={removeNotification}
            onClick={() => handleToastClick(toast)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
