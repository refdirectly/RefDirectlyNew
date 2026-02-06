import React from 'react';
import { Phone, Video, Info } from 'lucide-react';

interface ChatHeaderProps {
  participant: {
    name: string;
    avatarUrl?: string;
    isOnline?: boolean;
  };
  onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ participant, onBack }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="relative">
            <img
              src={participant.avatarUrl || `https://ui-avatars.com/api/?name=${participant.name}&background=6366f1&color=fff&bold=true`}
              alt={participant.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            {participant.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{participant.name}</h3>
            <p className="text-xs text-gray-500">{participant.isOnline ? 'Active now' : 'Offline'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Voice call">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Video call">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Info">
            <Info className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
