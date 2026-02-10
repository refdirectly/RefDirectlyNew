import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import Header from '../components/Header';
import { useSocket } from '../hooks/useSocket';
import ChatList from '../components/chat/ChatList';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import VideoCall from '../components/VideoCall';
import IncomingCallModal from '../components/IncomingCallModal';

interface Message {
  _id: string;
  senderId: { _id: string; name: string; avatarUrl?: string };
  content: string;
  createdAt: string;
}

interface Chat {
  _id: string;
  referralId: { company: string; role: string; status: string };
  participants: Array<{ _id: string; name: string; avatarUrl?: string }>;
}

const ReferralHRChatPage: React.FC = () => {
  const { referralId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allChats, setAllChats] = useState<any[]>([]);
  const [showCall, setShowCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallType, setIncomingCallType] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'requesting' | 'ringing' | 'connecting' | 'connected' | 'failed'>('idle');
  const [isCallInitiator, setIsCallInitiator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;

  useEffect(() => {
    startChat();
    fetchAllChats();
  }, [referralId]);

  const fetchAllChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referral-hr-chat/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const formattedChats = data.chats.map((chat: any) => ({
          _id: chat.referralId._id,
          participant: {
            _id: chat.otherParticipant._id,
            name: chat.otherParticipant.name,
            avatarUrl: chat.otherParticipant.avatarUrl
          },
          lastMessage: chat.lastMessage ? {
            text: chat.lastMessage.content,
            createdAt: new Date(chat.lastMessage.createdAt),
            read: true
          } : undefined,
          unreadCount: 0
        }));
        setAllChats(formattedChats);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  useEffect(() => {
    if (!socket || !chat) return;

    // Join the chat room for real-time messaging and calls
    socket.emit('join_chat_room', chat._id);
    console.log('🔌 Joined chat room:', chat._id);

    socket.on('new_message', (message: Message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      fetchAllChats();
    });

    socket.on('incoming-call', ({ isVideo }: { isVideo: boolean }) => {
      console.log('📞 Incoming call, video:', isVideo);
      setIncomingCallType(isVideo);
      setShowIncomingCall(true);
      setCallState('ringing');
    });

    socket.on('call-rejected', () => {
      console.log('❌ Call rejected');
      setShowCall(false);
      setCallState('idle');
      alert('Call was rejected.');
    });

    socket.on('call-accepted', () => {
      console.log('✅ Call accepted');
      setCallState('connecting');
    });

    socket.on('call-failed', ({ reason }: { reason: string }) => {
      console.log('❌ Call failed:', reason);
      setShowCall(false);
      setCallState('idle');
      alert(`Call failed: ${reason}`);
    });

    return () => {
      socket.emit('leave_chat', chat._id);
      socket.off('new_message');
      socket.off('incoming-call');
      socket.off('call-rejected');
      socket.off('call-accepted');
      socket.off('call-failed');
    };
  }, [socket, chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referral-hr-chat/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ referralId })
      });

      const data = await response.json();
      if (data.success) {
        setChat(data.chat);
        loadMessages(data.chat._id);
      } else {
        alert(data.message || 'Failed to start chat');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Failed to connect to HR. Please try again later.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referral-hr-chat/${chatId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (text: string, file?: File) => {
    if (!text.trim() || !chat) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referral-hr-chat/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: chat._id,
          content: text
        })
      });

      const data = await response.json();
      if (data.success) {
        if (socket) {
          socket.emit('send_message', { chatId: chat._id, message: data.message });
        }
        setMessages(prev => [...prev, data.message]);
        fetchAllChats();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const startCall = (video: boolean) => {
    if (!socket || !chat) return;
    console.log('📞 Starting call, video:', video);
    setIsCallInitiator(true);
    setCallState('ringing');
    setIsVideoCall(video);
    setShowCall(true);
    socket.emit('call-request', { roomId: chat._id, isVideo: video });

    setTimeout(() => {
      if (callState === 'ringing') {
        setCallState('failed');
        setShowCall(false);
        alert('Call not answered.');
        setCallState('idle');
        setIsCallInitiator(false);
      }
    }, 30000);
  };

  const handleAcceptCall = () => {
    if (!socket || !chat) return;
    setIsCallInitiator(false);
    setIsVideoCall(incomingCallType);
    setShowIncomingCall(false);
    setShowCall(true);
    setCallState('connecting');
    socket.emit('call-accepted', { roomId: chat._id });
  };

  const handleRejectCall = () => {
    if (!socket || !chat) return;
    setShowIncomingCall(false);
    setCallState('idle');
    socket.emit('call-rejected', { roomId: chat._id });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
        </main>
      </div>
    );
  }

  const otherParticipant = chat?.participants.find(p => p._id !== currentUserId);

  if (showCall && chat) {
    return (
      <VideoCall
        roomId={chat._id}
        socket={socket}
        onClose={() => {
          setShowCall(false);
          setCallState('idle');
          setIsCallInitiator(false);
        }}
        isVideoCall={isVideoCall}
        isInitiator={isCallInitiator}
        otherUserName={otherParticipant?.name || 'User'}
        onCallConnected={() => setCallState('connected')}
        onCallFailed={() => {
          setCallState('failed');
          setShowCall(false);
          setIsCallInitiator(false);
          setTimeout(() => setCallState('idle'), 2000);
        }}
      />
    );
  }

  return (
    <>
      {showIncomingCall && (
        <IncomingCallModal
          callerName={otherParticipant?.name || 'User'}
          isVideo={incomingCallType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    <div className="flex flex-col h-screen bg-gray-50">
      <div style={{ height: '120px' }}></div>
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar */}
        <ChatList
          chats={allChats}
          selectedChatId={chat?._id}
          onSelectChat={(chatId) => navigate(`/referral-hr-chat/${chatId}`)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {chat ? (
            <>
              <ChatHeader
                participant={{
                  name: otherParticipant?.name || 'HR',
                  avatarUrl: otherParticipant?.avatarUrl,
                  isOnline: socket?.connected || false
                }}
                onVoiceCall={() => startCall(false)}
                onVideoCall={() => startCall(true)}
              />

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-2xl p-8 max-w-md shadow-sm border border-gray-100 text-center"
                    >
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-6 mb-6 w-20 h-20 mx-auto flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Company HR Chat</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Secure conversation with {chat?.referralId.company} HR
                      </p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message, index) => {
                      const isMe = message.senderId._id === currentUserId;
                      const showDate = index === 0 || 
                        new Date(messages[index - 1].createdAt).toDateString() !== new Date(message.createdAt).toDateString();
                      
                      return (
                        <React.Fragment key={message._id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full">
                                {new Date(message.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', day: 'numeric', year: 'numeric' 
                                })}
                              </div>
                            </div>
                          )}
                          <MessageBubble
                            message={{
                              _id: message._id,
                              text: message.content,
                              senderRole: isMe ? 'seeker' : 'hr',
                              createdAt: new Date(message.createdAt),
                              read: true
                            }}
                            isOwn={isMe}
                            senderAvatar={message.senderId.avatarUrl}
                            senderName={message.senderId.name}
                          />
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <MessageInput onSend={sendMessage} disabled={sending} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ReferralHRChatPage;
