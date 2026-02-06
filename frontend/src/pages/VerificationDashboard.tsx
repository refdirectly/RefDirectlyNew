import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, XCircle, Clock, Upload, DollarSign, 
  AlertTriangle, FileText, TrendingUp, Shield, Search,
  Filter, Download, Eye, Ban, ThumbsUp, ThumbsDown,
  Activity, Users, Wallet, BarChart3
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Verification {
  _id: string;
  referralId: any;
  seekerId: any;
  referrerId: any;
  verificationStatus: string;
  verificationStage: string;
  evidence: any[];
  aiAnalysis: {
    confidenceScore: number;
    fraudRisk: string;
    evidenceQuality: string;
    recommendations: string[];
    analyzedAt?: Date;
  };
  payment: {
    totalAmount: number;
    platformFee: number;
    referrerAmount: number;
    status: string;
    transactionId?: string;
    paidAt?: Date;
  };
  timeline: any[];
  dispute?: any;
  autoVerified: boolean;
  manualReviewRequired: boolean;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Stats {
  total: number;
  pending: number;
  underReview: number;
  verified: number;
  rejected: number;
  disputed: number;
  totalPaid: number;
  avgConfidence: number;
}

const VerificationDashboard: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<Verification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [uploadData, setUploadData] = useState({ type: 'screenshot', url: '' });
  const [reviewData, setReviewData] = useState({ approved: true, notes: '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    underReview: 0,
    verified: 0,
    rejected: 0,
    disputed: 0,
    totalPaid: 0,
    avgConfidence: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'seeker';
    setUserRole(role);
    fetchVerifications();
    if (role === 'admin') {
      fetchStats();
    }
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchTerm, statusFilter, stageFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/verification/user/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifications(data.verifications);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/verification/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const statusCounts = data.verificationStats.byStatus.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
      
      const paymentData = data.verificationStats.paymentStats[0] || {};
      const aiData = data.verificationStats.aiStats[0] || {};
      
      setStats({
        total: data.verificationStats.byStatus.reduce((sum: number, item: any) => sum + item.count, 0),
        pending: statusCounts.pending || 0,
        underReview: statusCounts.under_review || 0,
        verified: statusCounts.verified || 0,
        rejected: statusCounts.rejected || 0,
        disputed: statusCounts.disputed || 0,
        totalPaid: paymentData.totalAmount || 0,
        avgConfidence: aiData.avgConfidence || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filterVerifications = () => {
    let filtered = [...verifications];
    
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.referralId?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.referralId?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.seekerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.referrerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.verificationStatus === statusFilter);
    }
    
    if (stageFilter !== 'all') {
      filtered = filtered.filter(v => v.verificationStage === stageFilter);
    }
    
    setFilteredVerifications(filtered);
  };

  const submitEvidence = async () => {
    if (!selectedVerification || !uploadData.url) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole') || 'seeker';
      
      await axios.post(
        `${API_URL}/api/verification/${selectedVerification._id}/evidence`,
        { ...uploadData, uploadedBy: userRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Evidence submitted successfully!');
      setShowUpload(false);
      setUploadData({ type: 'screenshot', url: '' });
      fetchVerifications();
    } catch (error) {
      alert('Failed to submit evidence');
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (stage: string) => {
    if (!selectedVerification) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/verification/${selectedVerification._id}/stage`,
        { stage, notes: `Updated to ${stage}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Stage updated successfully!');
      fetchVerifications();
    } catch (error) {
      alert('Failed to update stage');
    }
  };

  const requestPayment = async () => {
    if (!selectedVerification) return;
    
    if (!confirm('Are you sure you want to request payment verification?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/api/verification/${selectedVerification._id}/verify-and-pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Payment processed! Transaction ID: ${data.payment.transactionId}`);
      fetchVerifications();
      setSelectedVerification(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualReview = async () => {
    if (!selectedVerification) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/verification/${selectedVerification._id}/manual-review`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Verification ${reviewData.approved ? 'approved' : 'rejected'} successfully!`);
      setShowReviewModal(false);
      setReviewData({ approved: true, notes: '' });
      fetchVerifications();
      if (userRole === 'admin') fetchStats();
      setSelectedVerification(null);
    } catch (error) {
      alert('Failed to process review');
    } finally {
      setLoading(false);
    }
  };

  const raiseDispute = async () => {
    if (!selectedVerification) return;
    
    const reason = prompt('Please provide a reason for the dispute:');
    if (!reason) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/verification/${selectedVerification._id}/dispute`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Dispute raised successfully!');
      fetchVerifications();
      setSelectedVerification(null);
    } catch (error) {
      alert('Failed to raise dispute');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStageIcon = (stage: string) => {
    const icons: any = {
      referral_sent: <FileText className="w-5 h-5" />,
      interview_scheduled: <Clock className="w-5 h-5" />,
      offer_received: <TrendingUp className="w-5 h-5" />,
      joined: <CheckCircle className="w-5 h-5" />,
      completed: <DollarSign className="w-5 h-5" />
    };
    return icons[stage] || <Clock className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {userRole === 'admin' ? 'Admin Verification Dashboard' : 'Referral Verification'}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Manage and track referral verifications with AI-powered insights
              </p>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Refresh Stats
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards - Admin Only */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">TOTAL</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-sm text-gray-600">All verifications</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Avg Confidence: {stats.avgConfidence.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">PENDING</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stats.pending + stats.underReview}</p>
              <p className="text-sm text-gray-600">Awaiting review</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Disputed: {stats.disputed}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">VERIFIED</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stats.verified}</p>
              <p className="text-sm text-gray-600">Approved cases</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Rejected: {stats.rejected}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">PAID</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">${stats.totalPaid.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total payments</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Platform Fee: ${(stats.totalPaid * 0.1).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Search & Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by company, role, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
              >
                <option value="all">🔍 All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="under_review">🔎 Under Review</option>
                <option value="verified">✅ Verified</option>
                <option value="rejected">❌ Rejected</option>
                <option value="disputed">⚠️ Disputed</option>
              </select>
            </div>
            
            <div>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
              >
                <option value="all">📊 All Stages</option>
                <option value="referral_sent">📤 Referral Sent</option>
                <option value="interview_scheduled">📅 Interview Scheduled</option>
                <option value="offer_received">📨 Offer Received</option>
                <option value="joined">🎉 Joined</option>
                <option value="completed">✨ Completed</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || statusFilter !== 'all' || stageFilter !== 'all') && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredVerifications.length} of {verifications.length} verifications
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setStageFilter('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Verifications Grid */}
        {loading && verifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-6 text-lg font-medium">Loading verifications...</p>
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
              <FileText className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No verifications found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search filters or create a new verification</p>
            {(searchTerm || statusFilter !== 'all' || stageFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setStageFilter('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Verification Cases ({filteredVerifications.length})
              </h2>
              <div className="flex gap-2">
                <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredVerifications.map((verification) => (
            <div 
              key={verification._id}
              onClick={() => setSelectedVerification(verification)}
              className="group bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl cursor-pointer transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(verification.verificationStatus)}`}>
                  {verification.verificationStatus.replace('_', ' ')}
                </span>
                <div className="flex gap-2">
                  {verification.autoVerified && (
                    <span title="Auto-verified by AI" className="p-2 bg-green-100 rounded-lg">
                      <Shield className="w-4 h-4 text-green-600" />
                    </span>
                  )}
                  {verification.manualReviewRequired && (
                    <span title="Manual review required" className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-xl mb-1 text-gray-900 group-hover:text-blue-600 transition">
                {verification.referralId?.company || 'Company'}
              </h3>
              <p className="text-sm text-gray-600 mb-4 font-medium">
                {verification.referralId?.role || 'Role'}
              </p>

              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  {getStageIcon(verification.verificationStage)}
                </div>
                <span className="text-sm font-semibold text-gray-700 capitalize">
                  {verification.verificationStage.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    AI Confidence
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (verification.aiAnalysis?.confidenceScore || 0) >= 80 ? 'bg-green-500' :
                          (verification.aiAnalysis?.confidenceScore || 0) >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${verification.aiAnalysis?.confidenceScore || 0}%` }}
                      />
                    </div>
                    <span className="font-bold text-sm">{verification.aiAnalysis?.confidenceScore || 0}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Evidence
                  </span>
                  <span className="font-bold text-sm">{verification.evidence.length} docs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Payment
                  </span>
                  <span className="font-bold text-green-600 text-lg">
                    ${verification.payment.referrerAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {verification.dispute?.raised && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <Ban className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-red-700">Dispute Raised</span>
                </div>
              )}
            </div>
          ))}
          </div>
          </>
        )}

        {/* Selected Verification Details */}
        {selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start z-10">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Verification Details</h2>
                  <p className="text-gray-600">
                    {selectedVerification.referralId?.company} - {selectedVerification.referralId?.role}
                  </p>
                  {userRole === 'admin' && (
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-600">Seeker: {selectedVerification.seekerId?.name || 'N/A'}</span>
                      <span className="text-gray-600">Referrer: {selectedVerification.referrerId?.name || 'N/A'}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">

            {/* AI Analysis */}
            {selectedVerification.aiAnalysis && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  AI Analysis
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedVerification.aiAnalysis.confidenceScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fraud Risk</p>
                    <p className={`text-lg font-semibold ${
                      selectedVerification.aiAnalysis.fraudRisk === 'low' ? 'text-green-600' :
                      selectedVerification.aiAnalysis.fraudRisk === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedVerification.aiAnalysis.fraudRisk.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Evidence Quality</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {selectedVerification.aiAnalysis.evidenceQuality}
                    </p>
                  </div>
                </div>
                {selectedVerification.aiAnalysis.recommendations?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {selectedVerification.aiAnalysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Payment Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">${selectedVerification.payment.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee (10%):</span>
                  <span>-${selectedVerification.payment.platformFee}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                  <span>You Receive:</span>
                  <span>${selectedVerification.payment.referrerAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    selectedVerification.payment.status === 'completed' ? 'text-green-600' :
                    selectedVerification.payment.status === 'processing' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {selectedVerification.payment.status.toUpperCase()}
                  </span>
                </div>
                {selectedVerification.payment.transactionId && (
                  <div className="text-xs text-gray-500">
                    Transaction ID: {selectedVerification.payment.transactionId}
                  </div>
                )}
              </div>
            </div>

            {/* Evidence */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Evidence Submitted ({selectedVerification.evidence.length})
                </h3>
                {userRole !== 'admin' && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Evidence
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {selectedVerification.evidence.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No evidence submitted yet</p>
                ) : (
                  selectedVerification.evidence.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium capitalize">{ev.type.replace('_', ' ')}</p>
                          {ev.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-600">
                          Uploaded by {ev.uploadedBy} on {new Date(ev.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Timeline
              </h3>
              <div className="space-y-3">
                {selectedVerification.timeline.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        event.status === 'completed' || event.status === 'verified' ? 'bg-green-500' :
                        event.status === 'rejected' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      {i < selectedVerification.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium capitalize">{event.stage.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{event.notes}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.date).toLocaleString()} • By {event.verifiedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            {selectedVerification.adminNotes && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold mb-2 text-purple-900">Admin Notes</h3>
                <p className="text-sm text-purple-800">{selectedVerification.adminNotes}</p>
              </div>
            )}

            {/* Dispute Info */}
            {selectedVerification.dispute?.raised && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold mb-2 text-red-900 flex items-center gap-2">
                  <Ban className="w-5 h-5" />
                  Dispute Raised
                </h3>
                <p className="text-sm text-red-800 mb-2">{selectedVerification.dispute.reason}</p>
                <p className="text-xs text-red-600">
                  Raised by {selectedVerification.dispute.raisedBy} on {new Date(selectedVerification.dispute.raisedAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              {/* Admin Actions */}
              {userRole === 'admin' && selectedVerification.manualReviewRequired && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex-1 min-w-[200px] px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Manual Review
                </button>
              )}
              
              {/* Payment Action */}
              {selectedVerification.verificationStatus === 'verified' && 
               selectedVerification.payment.status === 'pending' && (
                <button
                  onClick={requestPayment}
                  disabled={loading}
                  className="flex-1 min-w-[200px] px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {loading ? 'Processing...' : 'Process Payment'}
                </button>
              )}
              
              {/* Dispute Action */}
              {userRole !== 'admin' && 
               !selectedVerification.dispute?.raised && 
               selectedVerification.verificationStatus !== 'rejected' && (
                <button
                  onClick={raiseDispute}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium"
                >
                  Raise Dispute
                </button>
              )}
            </div>
            </div>

            {/* Upload Modal */}
            {showUpload && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">Upload Evidence</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="evidence-type" className="block text-sm font-medium mb-2">Evidence Type</label>
                      <select
                        id="evidence-type"
                        value={uploadData.type}
                        onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="screenshot">Screenshot</option>
                        <option value="email">Email</option>
                        <option value="offer_letter">Offer Letter</option>
                        <option value="joining_letter">Joining Letter</option>
                        <option value="payslip">Payslip</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Document URL</label>
                      <input
                        type="text"
                        value={uploadData.url}
                        onChange={(e) => setUploadData({...uploadData, url: e.target.value})}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={submitEvidence}
                        disabled={loading || !uploadData.url}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                      <button
                        onClick={() => setShowUpload(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Manual Review Modal */}
            {showReviewModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">Manual Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Decision</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setReviewData({...reviewData, approved: true})}
                          className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                            reviewData.approved
                              ? 'border-green-600 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-green-300'
                          }`}
                        >
                          <ThumbsUp className="w-5 h-5 mx-auto mb-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => setReviewData({...reviewData, approved: false})}
                          className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                            !reviewData.approved
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-gray-300 hover:border-red-300'
                          }`}
                        >
                          <ThumbsDown className="w-5 h-5 mx-auto mb-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Notes</label>
                      <textarea
                        value={reviewData.notes}
                        onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                        placeholder="Add notes about your decision..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleManualReview}
                        disabled={loading || !reviewData.notes}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {loading ? 'Processing...' : 'Submit Review'}
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewModal(false);
                          setReviewData({ approved: true, notes: '' });
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationDashboard;
