import React from 'react';

interface Chat {
  _id: string;
  participant: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage?: {
    text: string;
    createdAt: Date;
    read?: boolean;
  };
  unreadCount?: number;
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isActive, onClick }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 ${
        isActive ? 'bg-gray-100' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={chat.participant.avatarUrl || `https://ui-avatars.com/api/?name=${chat.participant.name}&background=6366f1&color=fff&bold=true`}
          alt={chat.participant.name}
          className="h-14 w-14 rounded-full object-cover"
        />
        {/* Online indicator - can be dynamic */}
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-semibold text-sm truncate ${chat.unreadCount ? 'text-gray-900' : 'text-gray-800'}`}>
            {chat.participant.name}
          </h3>
          {chat.lastMessage && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${chat.unreadCount ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
            {chat.lastMessage?.text || 'Start a conversation'}
          </p>
          {chat.unreadCount && chat.unreadCount > 0 && (
            <span className="flex-shrink-0 ml-2 bg-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
