import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import { io, Socket } from 'socket.io-client';
import ChatList from '../components/chat/ChatList';
import Header from '../components/Header';

export default function SeekerChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [allChats, setAllChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/dashboard');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Fetch all chats
    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/chats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('Fetched chats:', data);
        
        const chats = data.chats || [];
        const formattedChats = chats.map((chat: any) => ({
          _id: chat._id,
          participant: {
            _id: chat.otherParticipant?._id || 'unknown',
            name: chat.otherParticipant?.name || chat.company || 'Unknown',
            avatarUrl: chat.otherParticipant?.avatarUrl
          },
          lastMessage: chat.lastMessage ? {
            text: chat.lastMessage.text,
            createdAt: new Date(chat.lastMessage.createdAt),
            read: chat.lastMessage.read
          } : undefined,
          unreadCount: chat.unreadCount || 0
        }));
        setAllChats(formattedChats);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };

    fetchChats();

    if (roomId) {
      fetch(`${API_URL}/api/referrals/${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setChatInfo(data);
          // Add current chat to list immediately
          if (data && roomId) {
            setAllChats(prev => {
              const exists = prev.some(c => c._id === roomId);
              if (!exists) {
                return [{
                  _id: roomId,
                  participant: {
                    _id: 'other',
                    name: data.company || 'Chat',
                    avatarUrl: undefined
                  },
                  lastMessage: {
                    text: 'Active conversation',
                    createdAt: new Date(),
                    read: true
                  },
                  unreadCount: 0
                }, ...prev];
              }
              return prev;
            });
          }
        })
        .catch(console.error);
    }

    const newSocket = io(API_URL, {
      withCredentials: true,
      auth: { token }
    });
    
    newSocket.on('incoming_chat_message', () => {
      fetchChats();
    });
    
    setSocket(newSocket);
    setLoading(false);

    return () => {
      newSocket.close();
    };
  }, [navigate, roomId]);

  useEffect(() => {
    // Update chat list when messages change
    if (roomId && chatInfo) {
      setAllChats(prev => {
        const exists = prev.some(c => c._id === roomId);
        if (!exists) {
          return [{
            _id: roomId,
            participant: {
              _id: 'other',
              name: chatInfo.company || 'Chat',
              avatarUrl: undefined
            },
            lastMessage: {
              text: 'Active conversation',
              createdAt: new Date(),
              read: true
            },
            unreadCount: 0
          }, ...prev];
        }
        return prev;
      });
    }
  }, [chatInfo]);

  const filteredChats = allChats.filter(chat => 
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-purple border-r-transparent mx-auto mb-4 shadow-lg"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-28">
      <ChatList
        chats={filteredChats}
        selectedChatId={roomId || undefined}
        onSelectChat={(chatId) => navigate(`/chat?room=${chatId}`)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex flex-col bg-white">
        {roomId && socket ? (
          <ChatInterface roomId={roomId} userRole="seeker" socket={socket} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-8 mb-4 inline-block">
                <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
