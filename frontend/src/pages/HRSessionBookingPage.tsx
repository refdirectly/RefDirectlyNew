import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Video, Calendar, Clock, CreditCard, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HRSessionBookingPage: React.FC = () => {
  const { hrId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionType = searchParams.get('type') as 'chat' | 'voice' | 'video';
  const navigate = useNavigate();
  const [hr, setHr] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const prices = { chat: 499, voice: 799, video: 999 };
  const price = prices[sessionType] || 499;

  useEffect(() => {
    fetchHRDetails();
  }, [hrId]);

  const fetchHRDetails = async () => {
    // Mock HR data
    setHr({
      _id: hrId,
      name: 'Sarah Johnson',
      currentCompany: 'Google',
      currentTitle: 'Senior HR Manager',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8B5CF6&color=fff&size=200'
    });
  };

  const bookSession = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hr-session/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hrId,
          sessionType,
          scheduledAt: new Date(`${selectedDate}T${selectedTime}`),
          price
        })
      });

      const data = await response.json();
      if (data.success) {
        navigate(`/hr-session/${data.session._id}`);
      }
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const icons = { chat: MessageCircle, voice: Phone, video: Video };
  const Icon = icons[sessionType];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-brand-purple mb-6">
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <img src={hr?.avatarUrl} alt={hr?.name} className="h-20 w-20 rounded-full" />
                <div>
                  <h2 className="text-2xl font-bold">{hr?.name}</h2>
                  <p className="text-gray-600">{hr?.currentTitle}</p>
                  <p className="text-sm text-gray-500">{hr?.currentCompany}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-purple/10 to-brand-magenta/10 rounded-xl mb-6">
                <Icon className="h-8 w-8 text-brand-purple" />
                <div>
                  <p className="font-bold text-lg capitalize">{sessionType} Session</p>
                  <p className="text-sm text-gray-600">45 minutes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Date</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-purple" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Select Time</label>
                  <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-purple">
                    <option value="">Choose time</option>
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Type</span>
                  <span className="font-semibold capitalize">{sessionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">45 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold">₹{price}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brand-purple">₹{price}</span>
                </div>
              </div>

              <button onClick={bookSession} disabled={loading || !selectedDate || !selectedTime} className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                {loading ? 'Processing...' : 'Book & Pay'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment powered by Razorpay
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HRSessionBookingPage;
