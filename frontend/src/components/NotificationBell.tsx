import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    
    if (socket) {
      socket.on('new_notification', () => {
        setUnreadCount(prev => prev + 1);
      });
      socket.on('unread_count', setUnreadCount);
      
      return () => {
        socket.off('new_notification');
        socket.off('unread_count');
      };
    }
  }, [socket]);

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

  return (
    <button
      type="button"
      onClick={() => navigate('/notifications')}
      className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      title="Notifications"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
