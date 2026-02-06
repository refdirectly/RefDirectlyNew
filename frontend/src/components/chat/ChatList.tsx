import React from 'react';
import { Search } from 'lucide-react';
import ChatItem from './ChatItem';

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

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelectChat, searchQuery, onSearchChange }) => {
  return (
    <div className="w-full md:w-96 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Messages</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No conversations yet</p>
          </div>
        ) : (
          chats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              isActive={selectedChatId === chat._id}
              onClick={() => onSelectChat(chat._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
