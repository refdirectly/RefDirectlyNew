import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://refdirectly-1.onrender.com';
      
      if (step === 'email') {
        const res = await fetch(`${API_URL}/api/password/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('No account found with this email address.');
          }
          throw new Error(data.message || data.error || 'Failed to send OTP');
        }

        setStep('otp');
      } else {
        const res = await fetch(`${API_URL}/api/password/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword })
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to reset password');
        }

        setSuccess(true);
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('Unable to connect to server. Please check your internet connection or try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-600 mt-2">
              {step === 'email' ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <p className="font-semibold mb-2">Email Sent!</p>
                <p className="text-sm">Check your inbox for password reset instructions.</p>
              </div>
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 'email' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                        minLength={6}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : step === 'email' ? 'Send OTP' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                {step === 'otp' && (
                  <button
                    onClick={() => { setStep('email'); setOtp(''); setNewPassword(''); setError(''); }}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 mx-auto mb-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change Email
                  </button>
                )}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
