import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Building2, Briefcase, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Chat {
  _id: string;
  referralId: { _id: string; company: string; role: string; status: string };
  participants: Array<{ _id: string; name: string; avatarUrl?: string }>;
  lastMessage?: string;
  lastMessageAt?: string;
}

const HRChatsPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referral-hr-chat/my-chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) setChats(data.chats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Company HR Chats</h1>

          {chats.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No HR Chats Yet</h3>
              <p className="text-gray-600 mb-6">
                Once your referral is accepted, you can chat with company HR
              </p>
              <button
                onClick={() => navigate('/find-referrer')}
                className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all"
              >
                Find Referrers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat, idx) => {
                const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
                return (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => navigate(`/referral-hr-chat/${chat.referralId._id}`)}
                    className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-600"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={otherParticipant?.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant?.name}`}
                        alt={otherParticipant?.name}
                        className="h-14 w-14 rounded-full flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">{otherParticipant?.name}</h3>
                          {chat.lastMessageAt && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(chat.lastMessageAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{chat.referralId.company}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{chat.referralId.role}</span>
                          </div>
                        </div>

                        {chat.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                        )}

                        <div className="mt-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            chat.referralId.status === 'accepted' 
                              ? 'bg-green-100 text-green-700'
                              : chat.referralId.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {chat.referralId.status.charAt(0).toUpperCase() + chat.referralId.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HRChatsPage;
