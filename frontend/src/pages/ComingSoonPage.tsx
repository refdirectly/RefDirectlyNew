import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Coming Soon</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-12">
              {description}
            </p>

            <div className="bg-white rounded-2xl shadow-xl p-12 mb-8">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block h-20 w-20 rounded-full bg-gradient-primary mb-6 animate-pulse"></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">We're Working On It!</h3>
                  <p className="text-gray-600 mb-6">This page is under construction. Check back soon for updates.</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => navigate(-1)}
                      className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-brand-purple hover:text-brand-purple transition-all"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Go Back
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-3">Want to be notified when this page launches?</h4>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
                <button className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap">
                  Notify Me
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComingSoonPage;
