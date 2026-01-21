import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Building2, TrendingUp, Users, DollarSign, CheckCircle, Sparkles, Briefcase, Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword } from '../utils/validation';

const ReferrerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setFieldErrors({
        email: emailValidation.error,
        password: passwordValidation.error
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user.role === 'seeker') {
        setError('This is the Referrer login page. Please use the Job Seeker login page.');
        setLoading(false);
        return;
      }

      if (data.user.role !== 'referrer') {
        setError('Invalid account type. This login is for referrers only.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userId', data.user.id);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/referrer/dashboard', {
          state: { welcomeBack: true, userName: data.user.name }
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const stats = [
    { icon: DollarSign, label: 'Avg. Earnings', value: '$2,450/mo' },
    { icon: Users, label: 'Active Referrers', value: '5,000+' },
    { icon: TrendingUp, label: 'Success Rate', value: '92%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-magenta to-brand-teal">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white hidden lg:block"
            >
              <Link to="/" className="inline-block mb-8">
                <img src="/logo.png" alt="RefDirectly" className="h-20 w-auto brightness-0 invert" />
              </Link>
              <h1 className="font-display text-5xl font-bold mb-6">
                Welcome Back, Referrer!
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Continue earning by connecting talented candidates with opportunities at your company.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                  >
                    <stat.icon className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-90">Pending Requests</span>
                    <span className="font-bold">8 new</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">This Month Earnings</span>
                    <span className="font-bold">$450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Total Referrals</span>
                    <span className="font-bold">23 completed</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-primary mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  Referrer Sign In
                </h2>
                <p className="text-gray-600">Access your referrer dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">{error}</p>
                        {error.includes('Job Seeker') && (
                          <Link 
                            to="/auth/login" 
                            className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900 font-medium mt-2 underline"
                          >
                            <Briefcase className="h-3 w-3" />
                            Go to Job Seeker Login Page
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Login Successful!</p>
                        <p className="text-xs text-green-700 mt-0.5">Redirecting to your dashboard...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all ${
                      fieldErrors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="john@company.com"
                    aria-label="Organization email"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                      }}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all ${
                        fieldErrors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="••••••••"
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-sm font-semibold text-brand-purple hover:text-brand-magenta transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading || success || !validateEmail(email).isValid || !validatePassword(password).isValid}
                  className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {success && <Sparkles className="h-5 w-5" />}
                  {success ? 'Success!' : loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600">
                    Not a referrer yet?{' '}
                    <Link to="/referrer-signup" className="font-semibold text-brand-purple hover:text-brand-magenta transition-colors">
                      Sign up now
                    </Link>
                  </p>
                  <p className="text-sm text-gray-600">
                    Job seeker?{' '}
                    <Link to="/login" className="font-semibold text-brand-teal hover:text-brand-magenta transition-colors">
                      Use regular login
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferrerLoginPage;
