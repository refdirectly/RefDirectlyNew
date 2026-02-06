import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Building2, Briefcase, Mail, Phone, FileText, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Referral {
  _id: string;
  company: string;
  role: string;
  status: string;
  seekerId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  seekerProfile: {
    skills: string[];
    resumeUrl?: string;
  };
  acceptedAt: string;
}

interface Chat {
  _id: string;
  referralId: {
    _id: string;
    company: string;
    role: string;
    status: string;
  };
  seekerId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  lastMessageAt?: string;
  messages: any[];
}

const CompanyHRDashboard: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'referrals' | 'chats'>('referrals');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [referralsRes, chatsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/referrals-enhanced/hr`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/referrals-enhanced/hr-chat/chats`, { headers })
      ]);

      const referralsData = await referralsRes.json();
      const chatsData = await chatsRes.json();

      if (referralsData.success) setReferrals(referralsData.referrals);
      if (chatsData.success) setChats(chatsData.chats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (referralId: string) => {
    navigate(`/referral-hr-chat/${referralId}`);
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
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Company HR Dashboard</h1>
            <p className="text-gray-600">Manage assigned candidates and communications</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-4 rounded-xl">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Assigned Candidates</p>
                  <p className="text-3xl font-bold">{referrals.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-xl">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Active Chats</p>
                  <p className="text-3xl font-bold">{chats.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-4 rounded-xl">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Pending Reviews</p>
                  <p className="text-3xl font-bold">
                    {referrals.filter(r => r.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'referrals'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Assigned Candidates ({referrals.length})
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'chats'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Active Chats ({chats.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'referrals' ? (
            <div className="space-y-4">
              {referrals.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Candidates Assigned</h3>
                  <p className="text-gray-600">
                    Candidates will appear here when referrals are accepted
                  </p>
                </div>
              ) : (
                referrals.map((referral, idx) => (
                  <motion.div
                    key={referral._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Candidate Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <img
                          src={referral.seekerId.avatarUrl || `https://ui-avatars.com/api/?name=${referral.seekerId.name}`}
                          alt={referral.seekerId.name}
                          className="h-16 w-16 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{referral.seekerId.name}</h3>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span>{referral.seekerId.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{referral.role}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(referral.acceptedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Skills */}
                          {referral.seekerProfile.skills && referral.seekerProfile.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {referral.seekerProfile.skills.slice(0, 5).map((skill, i) => (
                                <span
                                  key={i}
                                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => openChat(referral._id)}
                              className="bg-gradient-primary text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Chat with Candidate
                            </button>
                            
                            {referral.seekerProfile.resumeUrl && (
                              <a
                                href={referral.seekerProfile.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                View Resume
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-start">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          referral.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : referral.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {chats.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Active Chats</h3>
                  <p className="text-gray-600">
                    Start chatting with candidates from the Assigned Candidates tab
                  </p>
                </div>
              ) : (
                chats.map((chat, idx) => (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => openChat(chat.referralId._id)}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-600"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={chat.seekerId.avatarUrl || `https://ui-avatars.com/api/?name=${chat.seekerId.name}`}
                        alt={chat.seekerId.name}
                        className="h-14 w-14 rounded-full"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">{chat.seekerId.name}</h3>
                          {chat.lastMessageAt && (
                            <span className="text-xs text-gray-500">
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

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {chat.messages.length} messages
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            chat.referralId.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {chat.referralId.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyHRDashboard;
