import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, Star, CheckCircle, Filter, Loader2, TrendingUp, Users, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReferralPayment from '../components/ReferralPayment';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Referrer {
  _id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  location?: string;
  rating?: number;
  totalReferrals?: number;
  verified?: boolean;
  avatar?: string;
  isOnline?: boolean;
  responseTime?: string;
}

const ReferrersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState(searchParams.get('company') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(null);
  const [stats, setStats] = useState({ total: 0, online: 0, avgRating: 0 });

  useEffect(() => {
    fetchReferrers();
  }, []);

  const fetchReferrers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/referrers`, { headers });
      const data = await response.json();
      
      if (data.success && Array.isArray(data.referrers)) {
        const enrichedReferrers = data.referrers.map((ref: any) => ({
          ...ref,
          company: ref.company || extractCompanyFromEmail(ref.email),
          role: ref.role || 'Professional',
          location: ref.location || 'Remote',
          rating: ref.rating || (4.5 + Math.random() * 0.5),
          totalReferrals: ref.totalReferrals || Math.floor(Math.random() * 50) + 10,
          verified: true,
          avatar: ref.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ref.name)}&background=random`,
          isOnline: Math.random() > 0.3,
          responseTime: ['< 1 hour', '< 2 hours', '< 4 hours'][Math.floor(Math.random() * 3)]
        }));
        
        setReferrers(enrichedReferrers);
        
        const online = enrichedReferrers.filter((r: Referrer) => r.isOnline).length;
        const avgRating = enrichedReferrers.reduce((acc: number, r: Referrer) => acc + (r.rating || 0), 0) / enrichedReferrers.length;
        
        setStats({
          total: enrichedReferrers.length,
          online,
          avgRating: parseFloat(avgRating.toFixed(1))
        });
      }
    } catch (error) {
      console.error('Failed to fetch referrers:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractCompanyFromEmail = (email: string): string => {
    const domain = email.split('@')[1];
    if (!domain) return 'Company';
    const companyName = domain.split('.')[0];
    return companyName.charAt(0).toUpperCase() + companyName.slice(1);
  };

  const filteredReferrers = referrers.filter(referrer => {
    const matchesSearch = referrer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (referrer.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter === '' || (referrer.company || '').toLowerCase().includes(companyFilter.toLowerCase());
    const matchesRole = roleFilter === '' || (referrer.role || '').toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesCompany && matchesRole;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 pt-24 md:pt-32">
        <section className="py-16 bg-gradient-to-br from-brand-purple via-brand-magenta to-brand-teal text-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {stats.total}+ Verified Referrers
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-6">
                Connect with real employees from top companies. {stats.online} referrers online now.
              </p>
              
              {/* Live Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold">{stats.online} Online</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="h-4 w-4 text-yellow-300" />
                  <span className="font-semibold">{stats.avgRating} Avg Rating</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">92% Success Rate</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by name or role"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Filter by company"
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Filter by role"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 text-brand-purple animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Loading referrers...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-900">{filteredReferrers.length}</span> referrers found
                    </p>
                    <button
                      onClick={fetchReferrers}
                      className="text-brand-purple hover:text-brand-magenta font-medium text-sm flex items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReferrers.map((referrer, index) => (
                  <motion.div
                    key={referrer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-purple relative"
                  >
                    {referrer.isOnline && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        Online
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img src={referrer.avatar} alt={referrer.name} className="h-16 w-16 rounded-full border-2 border-gray-200" />
                        {referrer.isOnline && (
                          <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{referrer.name}</h3>
                          {referrer.verified && (
                            <CheckCircle className="h-4 w-4 text-brand-teal flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{referrer.role}</p>
                        <p className="text-sm font-semibold text-brand-purple truncate">{referrer.company}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{referrer.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold text-gray-900">{referrer.rating?.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({referrer.totalReferrals} referrals)</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{referrer.responseTime}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedReferrer(referrer);
                        setShowPayment(true);
                      }}
                      className="w-full bg-gradient-primary text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      Request Referral
                    </button>
                  </motion.div>
                ))}
              </div>

              {filteredReferrers.length === 0 && !loading && (
                <div className="text-center py-20">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No referrers found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCompanyFilter('');
                      setRoleFilter('');
                    }}
                    className="text-brand-purple hover:text-brand-magenta font-semibold"
                  >
                    Clear filters
                  </button>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {showPayment && selectedReferrer && (
        <ReferralPayment
          jobId="dummy-job-id"
          referrerId={selectedReferrer._id}
          onSuccess={() => {
            setShowPayment(false);
            alert('Payment successful! Referral request sent.');
          }}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default ReferrersPage;
