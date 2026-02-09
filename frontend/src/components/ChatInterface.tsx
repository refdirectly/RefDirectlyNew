import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Smile, Send, Check, CheckCheck, Image, File, X, MoreVertical, Phone, Video, Search } from 'lucide-react';
import VideoCall from './VideoCall';
import IncomingCallModal from './IncomingCallModal';

interface Message {
  _id?: string;
  senderRole: 'seeker' | 'referrer' | 'system';
  text: string;
  createdAt: Date;
  read?: boolean;
  attachment?: { type: string; url: string; name: string };
}

interface ChatInterfaceProps {
  roomId: string;
  userRole: 'seeker' | 'referrer';
  socket: any;
  onClose?: () => void;
}

export default function ChatInterface({ roomId, userRole, socket, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCall, setShowCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallType, setIncomingCallType] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'requesting' | 'ringing' | 'connecting' | 'connected' | 'failed' | 'unavailable'>('idle');
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [isCallInitiator, setIsCallInitiator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙌', '👏', '💪', '🚀', '⭐', '✅', '💼', '📝', '📧', '📞', '💡', '🎯'];

  useEffect(() => {
    if (!socket) return;

    console.log('🔌 Joining chat room:', roomId);
    socket.emit('join_chat_room', roomId);
    setIsConnected(true);
    
    socket.on('connect', () => {
      console.log('🔌 Socket reconnected, rejoining room:', roomId);
      socket.emit('join_chat_room', roomId);
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Fetch chat history
    const fetchMessages = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        console.log('📥 Loading chat history...');
        const response = await fetch(`${API_URL}/api/chat/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load messages: ${response.status}`);
        }
        
        const data = await response.json();
        const loadedMessages = data.messages || [];
        console.log(`✅ Loaded ${loadedMessages.length} messages`);
        setMessages(loadedMessages);
      } catch (error: any) {
        console.error('❌ Error loading messages:', error);
        setLoadError(error.message || 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();

    const handleIncomingMessage = (msg: Message) => {
      console.log('📥 INCOMING MESSAGE EVENT FIRED:', msg.text);
      
      setMessages(prev => {
        console.log('📊 Current messages:', prev.length);
        
        // Check if already exists
        const exists = prev.some(m => 
          m.text === msg.text && 
          m.senderRole === msg.senderRole && 
          Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 5000
        );
        
        if (exists) {
          console.log('⚠️ Duplicate, skipping');
          return prev;
        }
        
        console.log('✅ ADDING NEW MESSAGE');
        return [...prev, msg];
      });
    };
    
    socket.off('incoming_chat_message');
    socket.on('incoming_chat_message', handleIncomingMessage);
    console.log('🎯 Socket listener attached');

    socket.on('typing', ({ isTyping: typing }: { isTyping: boolean }) => {
      setIsTyping(typing);
    });

    return () => {
      console.log('🧹 Cleanup');
      socket.off('incoming_chat_message', handleIncomingMessage);
      socket.off('typing');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedFile) || !socket) return;

    const messageText = inputText.trim() || `Sent ${selectedFile?.name}`;
    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      _id: tempId,
      senderRole: userRole,
      text: messageText,
      createdAt: new Date(),
      read: false
    };

    console.log('📤 Sending message:', messageText);
    
    // Clear input immediately for better UX
    setInputText('');
    setSelectedFile(null);
    setShowEmojiPicker(false);
    
    // Add message to local state immediately (optimistic update)
    setMessages(prev => [...prev, newMessage]);

    // Send to server via socket
    socket.emit('chat_message', {
      roomId,
      text: messageText,
      senderRole: userRole
    });
    
    // Also save via API for reliability
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${API_URL}/api/chat/${roomId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: messageText,
          senderRole: userRole
        })
      });
      console.log('✅ Message saved to database');
    } catch (error) {
      console.error('❌ Failed to save message:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startCall = (video: boolean) => {
    console.log('📞 Starting call, video:', video);
    console.log('📍 Room ID:', roomId);
    console.log('🔌 Socket connected:', socket?.connected);
    console.log('🎯 Call state:', callState);
    
    setIsCallInitiator(true);
    setCallState('ringing');
    setIsVideoCall(video);
    setShowCall(true);
    
    console.log('📤 Emitting call-request to room:', roomId);
    socket.emit('call-request', { roomId, isVideo: video });
    
    const timeoutId = setTimeout(() => {
      console.log('⏰ Checking call state after 30s:', callState);
      if (callState === 'ringing') {
        console.log('⏰ Call timeout');
        setCallState('failed');
        setShowCall(false);
        alert('Call not answered. The referrer may be busy.');
        setCallState('idle');
        setIsCallInitiator(false);
      }
    }, 30000);
    
    (window as any).callTimeoutId = timeoutId;
  };

  useEffect(() => {
    if (!socket) return;
    
    console.log('📡 Setting up call event listeners');
    
    socket.on('incoming-call', ({ isVideo }: { isVideo: boolean }) => {
      console.log('📞 INCOMING CALL RECEIVED! Video:', isVideo);
      setIncomingCallType(isVideo);
      setShowIncomingCall(true);
      setCallState('ringing');
    });
    
    socket.on('call-rejected', () => {
      console.log('❌ Call rejected by other user');
      setShowCall(false);
      setCallState('idle');
      alert('Call was rejected by the other user.');
    });
    
    socket.on('call-accepted', () => {
      console.log('✅ Call accepted');
      setCallState('connecting');
      // Clear timeout
      if ((window as any).callTimeoutId) {
        clearTimeout((window as any).callTimeoutId);
      }
    });
    
    socket.on('call-failed', ({ reason }: { reason: string }) => {
      console.log('❌ Call failed:', reason);
      setShowCall(false);
      setCallState('idle');
      alert(`Call failed: ${reason}`);
    });
    
    return () => {
      console.log('🧹 Cleaning up call event listeners');
      socket.off('incoming-call');
      socket.off('call-rejected');
      socket.off('call-accepted');
      socket.off('call-failed');
    };
  }, [socket]);

  if (showCall) {
    return (
      <VideoCall 
        roomId={roomId} 
        socket={socket} 
        onClose={() => {
          setShowCall(false);
          setCallState('idle');
          setIsCallInitiator(false);
        }} 
        isVideoCall={isVideoCall} 
        isInitiator={isCallInitiator} 
        otherUserName={userRole === 'seeker' ? 'Referrer' : 'Job Seeker'}
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

  const handleAcceptCall = () => {
    setIsCallInitiator(false);
    setIsVideoCall(incomingCallType);
    setShowIncomingCall(false);
    setShowCall(true);
    setCallState('connecting');
    socket.emit('call-accepted', { roomId });
  };

  const handleRejectCall = () => {
    setShowIncomingCall(false);
    setCallState('idle');
    socket.emit('call-rejected', { roomId });
  };

  return (
    <>
      {showIncomingCall && (
        <IncomingCallModal
          callerName={userRole === 'seeker' ? 'Referrer' : 'Job Seeker'}
          isVideo={incomingCallType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {roomId.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Chat</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">{isConnected ? 'Online' : 'Offline'}</p>
              {callState === 'ringing' && (
                <span className="text-xs text-yellow-600 font-medium animate-pulse">Ringing...</span>
              )}
              {callState === 'connecting' && (
                <span className="text-xs text-blue-600 font-medium">Connecting...</span>
              )}
              {callState === 'connected' && (
                <span className="text-xs text-green-600 font-medium">In Call</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              console.log('Voice call button clicked');
              startCall(false);
            }} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Voice call"
            disabled={callState !== 'idle' || !isConnected}
          >
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={() => {
              console.log('Video call button clicked');
              startCall(true);
            }} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Video call"
            disabled={callState !== 'idle' || !isConnected}
          >
            <Video className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      {/* Modern Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-white"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-purple border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading messages...</p>
          </div>
        )}

        {/* Error State */}
        {loadError && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md shadow-lg">
              <p className="text-red-600 font-semibold mb-2">Failed to load messages</p>
              <p className="text-gray-600 text-sm mb-4">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-magenta transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {!isLoading && !loadError && (
          <>
        <AnimatePresence>
          {messages.map((msg, idx) => {
            const isOwn = msg.senderRole === userRole;
            const isSystem = msg.senderRole === 'system';
            const showDate = idx === 0 || 
              new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

            if (isSystem) {
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center my-3">
                  <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-full font-medium">{msg.text}</div>
                </motion.div>
              );
            }

            return (
              <React.Fragment key={idx}>
                {showDate && (
                  <div className="flex justify-center my-3">
                    <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                )}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  transition={{ duration: 0.2, ease: "easeOut" }} 
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
                >
                  <div className={`max-w-[70%] ${isOwn ? '' : 'flex items-end gap-2'}`}>
                    {!isOwn && (
                      <img
                        src={`https://ui-avatars.com/api/?name=${userRole === 'seeker' ? 'Referrer' : 'Seeker'}&background=6366f1&color=fff&bold=true`}
                        alt="Avatar"
                        className="h-7 w-7 rounded-full flex-shrink-0 mb-1"
                      />
                    )}
                    <div>
                      <div className={`rounded-3xl px-4 py-2 ${
                        isOwn 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.attachment && (
                          <div className="mb-2">
                            {msg.attachment.type === 'image' ? (
                              <img src={msg.attachment.url} alt={msg.attachment.name} className="rounded-lg max-w-full h-auto" />
                            ) : (
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <File className="h-4 w-4" />
                                <span className="text-sm">{msg.attachment.name}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2 mb-1">
            <img
              src={`https://ui-avatars.com/api/?name=${userRole === 'seeker' ? 'Referrer' : 'Seeker'}&background=6366f1&color=fff&bold=true`}
              alt="Avatar"
              className="h-7 w-7 rounded-full flex-shrink-0 mb-1"
            />
            <div className="bg-gray-100 px-4 py-2.5 rounded-3xl">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 max-w-md shadow-sm border border-gray-100"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-6 mb-6 w-20 h-20 mx-auto flex items-center justify-center">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">No messages yet</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Start the conversation by sending a message below</p>
            </motion.div>
          </div>
        )}

        <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Instagram-style Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        {selectedFile && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex items-center gap-3 bg-gray-100 rounded-xl p-3 border border-gray-200">
            {selectedFile.type.startsWith('image/') ? <Image className="h-5 w-5 text-purple-500" /> : <File className="h-5 w-5 text-purple-500" />}
            <span className="text-sm text-gray-700 flex-1 truncate font-medium">{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-600 transition-colors" title="Remove file">
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
        
        <div className="flex items-end gap-2">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <Smile className="h-5 w-5 text-gray-400" />
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <Paperclip className="h-5 w-5 text-gray-400" />
          </button>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx" aria-label="Attach file" />
          
          {showEmojiPicker && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-24 left-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 grid grid-cols-5 gap-2 z-10">
              {emojis.map((emoji, i) => (
                <button type="button" key={i} onClick={() => handleEmojiClick(emoji)} className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-gray-50 rounded-lg" title={`Insert ${emoji} emoji`}>
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
          
          <div className="flex-1 bg-white rounded-3xl border border-gray-200 hover:border-gray-300 transition-colors">
            <label htmlFor="message-input" className="sr-only">Type your message</label>
            <input 
              id="message-input" 
              type="text" 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} 
              placeholder="Message..." 
              className="w-full px-4 py-2 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm" 
            />
          </div>
          
          <button 
            type="button" 
            onClick={handleSend} 
            disabled={!inputText.trim() && !selectedFile} 
            className="text-sm font-semibold text-purple-500 hover:text-purple-600 disabled:text-gray-300 transition-colors px-3" 
            title="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
