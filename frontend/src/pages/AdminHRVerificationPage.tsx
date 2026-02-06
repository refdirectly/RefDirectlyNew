import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Building2, Briefcase, Mail, Calendar, Search, Filter } from 'lucide-react';

interface HRExpert {
  _id: string;
  name: string;
  email: string;
  company: string;
  currentTitle: string;
  experience: number;
  pricePerSession: number;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  bio?: string;
}

const AdminHRVerificationPage: React.FC = () => {
  const [hrs, setHrs] = useState<HRExpert[]>([]);
  const [filteredHrs, setFilteredHrs] = useState<HRExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHRs();
  }, []);

  useEffect(() => {
    filterHRs();
  }, [hrs, filter, searchQuery]);

  const fetchHRs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users?role=company_hr&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setHrs(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch HRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHRs = () => {
    let filtered = [...hrs];

    if (filter === 'pending') {
      filtered = filtered.filter(hr => !hr.verified);
    } else if (filter === 'verified') {
      filtered = filtered.filter(hr => hr.verified);
    }

    if (searchQuery) {
      filtered = filtered.filter(hr =>
        hr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hr.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHrs(filtered);
  };

  const handleVerify = async (hrId: string) => {
    setProcessingId(hrId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${hrId}/verify`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setHrs(hrs.map(hr => hr._id === hrId ? { ...hr, verified: true } : hr));
      }
    } catch (error) {
      console.error('Failed to verify HR:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (hrId: string) => {
    if (!confirm('Are you sure you want to reject this HR application?')) return;
    
    setProcessingId(hrId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${hrId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setHrs(hrs.filter(hr => hr._id !== hrId));
      }
    } catch (error) {
      console.error('Failed to reject HR:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const stats = {
    total: hrs.length,
    pending: hrs.filter(hr => !hr.verified).length,
    verified: hrs.filter(hr => hr.verified).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HR applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">HR Expert Verification</h1>
          <p className="text-gray-600 mt-2">Review and approve HR expert applications</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.verified}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or company..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === 'verified'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Verified ({stats.verified})
              </button>
            </div>
          </div>
        </div>

        {/* HR List */}
        {filteredHrs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHrs.map((hr) => (
              <div key={hr._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{hr.name}</h3>
                      {hr.verified ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{hr.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{hr.company || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{hr.currentTitle || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{hr.experience || 0} years experience</span>
                      </div>
                    </div>

                    {hr.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{hr.bio}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Price: <span className="font-semibold text-gray-900">₹{hr.pricePerSession || 199}/session</span>
                      </span>
                      <span className="text-gray-600">
                        Applied: <span className="font-semibold text-gray-900">{new Date(hr.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  {!hr.verified && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleVerify(hr._id)}
                        disabled={processingId === hr._id}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        {processingId === hr._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(hr._id)}
                        disabled={processingId === hr._id}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <XCircle className="h-5 w-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHRVerificationPage;
