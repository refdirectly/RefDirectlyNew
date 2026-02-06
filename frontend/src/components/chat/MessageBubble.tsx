import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

interface Message {
  _id?: string;
  text: string;
  senderRole: string;
  createdAt: Date;
  read?: boolean;
  attachment?: {
    type: string;
    url: string;
    name: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderAvatar?: string;
  senderName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, senderAvatar, senderName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`max-w-[70%] ${isOwn ? '' : 'flex items-end gap-2'}`}>
        {!isOwn && (
          <img
            src={senderAvatar || `https://ui-avatars.com/api/?name=${senderName}&background=6366f1&color=fff&bold=true`}
            alt={senderName}
            className="h-7 w-7 rounded-full flex-shrink-0 mb-1"
          />
        )}
        <div>
          {message.attachment && message.attachment.type === 'image' && (
            <div className="mb-1">
              <img
                src={message.attachment.url}
                alt={message.attachment.name}
                className="rounded-2xl max-w-xs object-cover"
              />
            </div>
          )}
          <div
            className={`rounded-3xl px-4 py-2 ${
              isOwn
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="text-sm leading-relaxed break-words">{message.text}</p>
          </div>
          <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-gray-400">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isOwn && (
              <span className="text-purple-500">
                {message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
