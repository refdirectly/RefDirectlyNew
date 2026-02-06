import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Video, Clock, Calendar, User, CheckCircle, XCircle, Loader2, DollarSign } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Session {
  _id: string;
  seekerId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  hrId: string;
  sessionType: 'chat' | 'voice' | 'video';
  scheduledAt: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  paymentStatus: 'pending' | 'completed';
  notes?: string;
  createdAt: string;
}

const HRSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hr-sessions/hr`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Failed to load sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = (sessionId: string) => {
    navigate(`/hr-session/${sessionId}`);
  };

  const handleConfirmSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hr-sessions/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to confirm session:', err);
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageCircle className="h-5 w-5" />;
      case 'voice': return <Phone className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const stats = {
    total: sessions.length,
    pending: sessions.filter(s => s.status === 'pending').length,
    confirmed: sessions.filter(s => s.status === 'confirmed').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    earnings: sessions
      .filter(s => s.status === 'completed' && s.paymentStatus === 'completed')
      .reduce((sum, s) => sum + s.amount, 0)
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              My Sessions
            </h1>
            <p className="text-gray-600">Manage your career guidance sessions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-blue-900">{stats.confirmed}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
              <p className="text-sm text-green-700 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-white/90 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-white">₹{stats.earnings}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Sessions List */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'You don\'t have any sessions yet. Job seekers will book sessions with you from the HR experts page.'
                  : `No ${filter} sessions at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <img
                        src={session.seekerId.avatarUrl || `https://ui-avatars.com/api/?name=${session.seekerId.name}&background=random`}
                        alt={session.seekerId.name}
                        className="h-12 w-12 rounded-full"
                      />

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{session.seekerId.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            {getSessionIcon(session.sessionType)}
                            <span className="capitalize">{session.sessionType}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{session.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(session.scheduledAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-green-600">₹{session.amount}</span>
                          </div>
                        </div>

                        {session.notes && (
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            <span className="font-semibold">Notes:</span> {session.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {session.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmSession(session._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Confirm
                        </button>
                      )}
                      
                      {(session.status === 'confirmed' || session.status === 'in_progress') && (
                        <button
                          onClick={() => handleStartSession(session._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                        >
                          {session.status === 'in_progress' ? 'Resume' : 'Start'} Session
                        </button>
                      )}

                      {session.status === 'completed' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HRSessionsPage;
