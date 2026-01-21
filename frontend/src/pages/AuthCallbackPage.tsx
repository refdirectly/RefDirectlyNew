import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userId', user.id);
        
        setUserName(user.name);
        setStatus('success');
        
        setTimeout(() => {
          navigate(user.role === 'referrer' ? '/referrer/dashboard' : '/seeker/dashboard', {
            state: { welcomeBack: true, userName: user.name }
          });
        }, 1500);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    } else {
      setStatus('error');
      setTimeout(() => navigate('/auth/login'), 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-magenta to-brand-teal flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-primary mb-6">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Authenticating...
            </h2>
            <p className="text-gray-600">Please wait while we complete your login</p>
          </>
        )}
        
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Welcome Back{userName ? `, ${userName}` : ''}! 🎉
            </h2>
            <p className="text-gray-600">Login successful. Redirecting to your dashboard...</p>
            <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: 'linear' }}
                className="h-full bg-gradient-primary"
              />
            </div>
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600">Redirecting to login page...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallbackPage;
