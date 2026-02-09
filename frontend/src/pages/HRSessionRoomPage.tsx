import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Video, PhoneOff, VideoOff, Mic, MicOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Header from '../components/Header';
import ChatList from '../components/chat/ChatList';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import VideoCall from '../components/VideoCall';
import IncomingCallModal from '../components/IncomingCallModal';

const HRSessionRoomPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showCall, setShowCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallType, setIncomingCallType] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(`hr-session-${sessionId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    
    fetchSession();
    fetchAllSessions();

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const newSocket = io(API_URL, {
      withCredentials: true,
      auth: { token }
    });
    setSocket(newSocket);
    newSocket.emit('join_chat_room', sessionId);

    return () => {
      newSocket.close();
    };
  }, [sessionId]);

  const fetchAllSessions = async () => {
    try {
      // Always include current session in the list
      const currentSession = {
        _id: sessionId,
        participant: {
          _id: 'hr-1',
          name: 'Sarah Johnson',
          avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8B5CF6&color=fff'
        },
        lastMessage: {
          text: messages.length > 0 ? messages[messages.length - 1].content : 'Start conversation',
          createdAt: new Date(),
          read: true
        },
        unreadCount: 0
      };
      setAllSessions([currentSession]);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchSession = async () => {
    try {
      const mockSession = {
        _id: sessionId,
        sessionType: 'chat',
        status: 'ongoing',
        hrId: { 
          name: 'Sarah Johnson', 
          avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8B5CF6&color=fff' 
        }
      };
      setSession(mockSession);
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  };

  const startCall = (video: boolean) => {
    setIsVideoCall(video);
    setShowCall(true);
    if (socket) {
      socket.emit('call-request', { roomId: sessionId, isVideo: video });
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('incoming-call', ({ isVideo }: { isVideo: boolean }) => {
      setIncomingCallType(isVideo);
      setShowIncomingCall(true);
    });
    return () => socket.off('incoming-call');
  }, [socket]);

  const handleAcceptCall = () => {
    setIsVideoCall(incomingCallType);
    setShowIncomingCall(false);
    setShowCall(true);
    if (socket) {
      socket.emit('call-accepted', { roomId: sessionId });
    }
  };

  const handleRejectCall = () => {
    setShowIncomingCall(false);
    if (socket) {
      socket.emit('call-rejected', { roomId: sessionId });
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const message = {
      senderId: 'current-user',
      content: text,
      timestamp: new Date()
    };

    const newMessages = [...messages, message];
    setMessages(newMessages);
    
    // Persist to localStorage
    localStorage.setItem(`hr-session-${sessionId}`, JSON.stringify(newMessages));
    
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const endSession = async () => {
    if (confirm('End this session?')) {
      navigate('/career/hrs');
    }
  };

  const filteredSessions = allSessions.filter(s => 
    s.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showCall && socket) {
    return <VideoCall roomId={sessionId!} socket={socket} onClose={() => setShowCall(false)} isVideoCall={isVideoCall} isInitiator={true} otherUserName={session?.hrId?.name || 'HR Expert'} />;
  }

  return (
    <>
      {showIncomingCall && (
        <IncomingCallModal
          callerName={session?.hrId?.name || 'HR Expert'}
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
          chats={filteredSessions}
          selectedChatId={sessionId}
          onSelectChat={(id) => navigate(`/hr-session/${id}`)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {sessionId && session ? (
            <>
              <ChatHeader
                participant={{
                  name: session?.hrId?.name || 'HR',
                  avatarUrl: session?.hrId?.avatarUrl,
                  isOnline: true
                }}
                onVoiceCall={() => startCall(false)}
                onVideoCall={() => startCall(true)}
              />

              {/* Main Content */}
              <div className="flex-1 flex">
                {session?.sessionType === 'video' ? (
                  <div className="flex-grow relative bg-black">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-48 h-36 rounded-xl object-cover border-2 border-white" />
                  </div>
                ) : session?.sessionType === 'voice' ? (
                  <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-brand-purple to-brand-magenta">
                    <div className="text-center text-white">
                      <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                        <Phone className="h-16 w-16" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2">{session?.hrId?.name}</h2>
                      <p className="text-xl opacity-90">Voice Call in Progress</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col bg-white">
                    <div className="flex-1 overflow-y-auto p-4 bg-white">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl p-8 max-w-md shadow-sm border border-gray-100 text-center"
                          >
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-6 mb-6 w-20 h-20 mx-auto flex items-center justify-center">
                              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">Start Your Session</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Send a message to begin your conversation</p>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {messages.map((msg, idx) => (
                            <MessageBubble
                              key={idx}
                              message={{
                                text: msg.content,
                                senderRole: msg.senderId === 'current-user' ? 'seeker' : 'hr',
                                createdAt: msg.timestamp,
                                read: true
                              }}
                              isOwn={msg.senderId === 'current-user'}
                              senderAvatar={session?.hrId?.avatarUrl}
                              senderName={session?.hrId?.name}
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    <MessageInput onSend={sendMessage} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Select a session to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default HRSessionRoomPage;
