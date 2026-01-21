import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, XCircle, Clock, Upload, DollarSign, 
  AlertTriangle, FileText, TrendingUp, Shield 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Verification {
  _id: string;
  referralId: any;
  verificationStatus: string;
  verificationStage: string;
  evidence: any[];
  aiAnalysis: {
    confidenceScore: number;
    fraudRisk: string;
    evidenceQuality: string;
    recommendations: string[];
  };
  payment: {
    totalAmount: number;
    platformFee: number;
    referrerAmount: number;
    status: string;
    transactionId?: string;
  };
  timeline: any[];
  dispute?: any;
  autoVerified: boolean;
  manualReviewRequired: boolean;
}

const VerificationDashboard: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ type: 'screenshot', url: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/verification/user/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifications(data.verifications);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    }
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
    } catch (error: any) {
      alert(error.response?.data?.error || 'Payment processing failed');
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Referral Verification</h1>

        {/* Verifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {verifications.map((verification) => (
            <div 
              key={verification._id}
              onClick={() => setSelectedVerification(verification)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.verificationStatus)}`}>
                  {verification.verificationStatus.replace('_', ' ').toUpperCase()}
                </span>
                {verification.autoVerified && (
                  <span title="Auto-verified by AI">
                    <Shield className="w-5 h-5 text-green-500" />
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-lg mb-2">
                {verification.referralId?.company || 'Company'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {verification.referralId?.role || 'Role'}
              </p>

              <div className="flex items-center gap-2 mb-3">
                {getStageIcon(verification.verificationStage)}
                <span className="text-sm text-gray-700">
                  {verification.verificationStage.replace('_', ' ')}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">AI Confidence:</span>
                  <span className="font-medium">{verification.aiAnalysis?.confidenceScore || 0}%</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Evidence:</span>
                  <span className="font-medium">{verification.evidence.length} docs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium text-green-600">
                    ${verification.payment.referrerAmount}
                  </span>
                </div>
              </div>

              {verification.manualReviewRequired && (
                <div className="mt-3 flex items-center gap-2 text-orange-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Manual review required
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Verification Details */}
        {selectedVerification && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Verification Details</h2>
                <p className="text-gray-600">
                  {selectedVerification.referralId?.company} - {selectedVerification.referralId?.role}
                </p>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

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
                <h3 className="font-semibold">Evidence Submitted</h3>
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload Evidence
                </button>
              </div>
              <div className="space-y-2">
                {selectedVerification.evidence.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{ev.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">
                        Uploaded by {ev.uploadedBy} on {new Date(ev.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {ev.verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedVerification.verificationStatus === 'verified' && 
               selectedVerification.payment.status === 'pending' && (
                <button
                  onClick={requestPayment}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Process Payment'}
                </button>
              )}
            </div>

            {/* Upload Modal */}
            {showUpload && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4">Upload Evidence</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="evidence-type" className="block text-sm font-medium mb-2">Evidence Type</label>
                      <select
                        id="evidence-type"
                        value={uploadData.type}
                        onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
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
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={submitEvidence}
                        disabled={loading || !uploadData.url}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowUpload(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationDashboard;
