import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Building2, Briefcase, Clock, Video, Phone, MessageCircle, Search, TrendingUp, Award, Users, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface HRExpert {
  _id: string;
  name: string;
  email: string;
  currentCompany: string;
  currentTitle: string;
  experience: number;
  rating: number;
  avatarUrl?: string;
  bio?: string;
  hrType: 'open' | 'company';
  pricePerSession?: number;
  verified: boolean;
}

const HRExpertsPage: React.FC = () => {
  const [experts, setExperts] = useState<HRExpert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<HRExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExperts();
  }, []);

  useEffect(() => {
    filterExperts();
  }, [experts, searchQuery, selectedCompany, selectedExperience, sortBy]);

  const fetchExperts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hr/experts`);
      const data = await response.json();
      
      if (data.success && data.data?.length > 0) {
        setExperts(data.data);
      } else {
        setExperts([]);
      }
    } catch (error) {
      console.error('Failed to fetch HR experts:', error);
      setExperts([]);
    } finally {
      setLoading(false);
    }
  };


  const filterExperts = () => {
    let filtered = [...experts];

    if (searchQuery) {
      filtered = filtered.filter(expert =>
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.currentTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCompany !== 'all') {
      filtered = filtered.filter(expert => expert.currentCompany === selectedCompany);
    }

    if (selectedExperience !== 'all') {
      const [min, max] = selectedExperience.split('-').map(Number);
      filtered = filtered.filter(expert => {
        const exp = expert.experience || 0;
        return max ? exp >= min && exp <= max : exp >= min;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0);
      if (sortBy === 'price') return (a.pricePerSession || 0) - (b.pricePerSession || 0);
      return 0;
    });

    setFilteredExperts(filtered);
  };

  const companies = Array.from(new Set(experts.map(e => e.currentCompany).filter(Boolean)));

  const bookSession = (expertId: string, sessionType: 'chat' | 'voice' | 'video') => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login', { state: { returnUrl: '/career/hrs' } });
      return;
    }
    navigate(`/career/book/${expertId}?type=${sessionType}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading HR experts...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 via-brand-magenta/5 to-brand-teal/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-purple via-brand-magenta to-brand-teal bg-clip-text text-transparent">
              Connect with Verified HR Experts
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Get personalized career guidance from recruiters at top tech companies.
            </p>
            <p className="text-lg text-gray-500">
              Real recruiters. Real insights. Real results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, company, or role..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-purple"
              />
            </div>
            
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-purple"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>

            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-purple"
            >
              <option value="all">All Experience</option>
              <option value="0-5">0-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10-15">10-15 years</option>
              <option value="15">15+ years</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-purple"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price">Lowest Price</option>
            </select>
          </div>
        </div>
      </section>

      {/* HR Experts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {filteredExperts.length} Expert{filteredExperts.length !== 1 ? 's' : ''} Available
            </h2>
          </div>

          {filteredExperts.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No HR experts found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCompany('all');
                  setSelectedExperience('all');
                }}
                className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert, idx) => (
                <motion.div
                  key={expert._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-brand-purple"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={expert.avatarUrl || `https://ui-avatars.com/api/?name=${expert.name}&background=8B5CF6&color=fff`}
                      alt={expert.name}
                      className="h-16 w-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{expert.name}</h3>
                        {expert.verified && (
                          <CheckCircle className="h-5 w-5 text-blue-500" title="Verified" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(expert.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          {expert.rating?.toFixed(1) || 'New'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Building2 className="h-4 w-4 text-brand-purple" />
                      <span>{expert.currentCompany || 'Company'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Briefcase className="h-4 w-4 text-brand-magenta" />
                      <span>{expert.currentTitle || 'HR Professional'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="h-4 w-4 text-brand-teal" />
                      <span>{expert.experience || 0}+ years experience</span>
                    </div>
                  </div>

                  {expert.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{expert.bio}</p>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Starting from</span>
                      <span className="text-2xl font-bold text-brand-purple">
                        ₹{expert.pricePerSession || 499}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => bookSession(expert._id, 'chat')}
                        className="flex flex-col items-center gap-1 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
                        title="Chat Session"
                      >
                        <MessageCircle className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-green-700">Chat</span>
                      </button>
                      <button
                        onClick={() => bookSession(expert._id, 'voice')}
                        className="flex flex-col items-center gap-1 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                        title="Voice Call"
                      >
                        <Phone className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-blue-700">Call</span>
                      </button>
                      <button
                        onClick={() => bookSession(expert._id, 'video')}
                        className="flex flex-col items-center gap-1 p-3 bg-brand-purple/10 hover:bg-brand-purple/20 rounded-xl transition-all group"
                        title="Video Call"
                      >
                        <Video className="h-5 w-5 text-brand-purple group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-brand-purple">Video</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HRExpertsPage;
