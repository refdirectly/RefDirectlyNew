import { useEffect, useState } from 'react';
import { X, MessageCircle, UserPlus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: string;
  avatarUrl?: string;
  onClose: (id: string) => void;
  onClick?: () => void;
}

export default function NotificationToast({ id, title, message, type, avatarUrl, onClose, onClick }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'message': return <MessageCircle className="w-5 h-5 text-white" />;
      case 'referral': return <UserPlus className="w-5 h-5 text-white" />;
      default: return <AlertCircle className="w-5 h-5 text-white" />;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={onClick}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3 cursor-pointer hover:shadow-3xl transition-shadow max-w-md"
        >
          {/* Avatar/Icon */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {getIcon()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{title}</p>
            <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{message}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
