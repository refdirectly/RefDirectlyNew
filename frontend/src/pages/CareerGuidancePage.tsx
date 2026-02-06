import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, MessageCircle, Phone, CheckCircle, Star, Users, Award, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

interface CareerPack {
  _id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
  duration: number;
}

const CareerGuidancePage: React.FC = () => {
  const [packs, setPacks] = useState<CareerPack[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPacks();
    fetchFAQs();
    fetchTestimonials();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/career-packs`);
      const data = await response.json();
      if (data.success) setPacks(data.packs);
    } catch (error) {
      console.error('Failed to fetch packs:', error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faqs`);
      const data = await response.json();
      if (data.success) setFaqs(data.faqs);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/testimonials`);
      const data = await response.json();
      if (data.success) setTestimonials(data.testimonials);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    }
  };

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
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-purple via-brand-magenta to-brand-teal bg-clip-text text-transparent">
              Get Expert Career Guidance from Top HR Professionals
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600">
              1-on-1 sessions with industry experts. Resume reviews, interview prep, career strategy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/career/hrs')}
                className="bg-gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
              >
                Find HR Experts
              </button>
              <button
                onClick={() => document.getElementById('packs')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white border-2 border-brand-purple text-brand-purple px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-purple hover:text-white transition-all"
              >
                View Packages
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'HR Experts', value: '500+' },
              { icon: MessageCircle, label: 'Sessions Done', value: '10,000+' },
              { icon: Award, label: 'Success Rate', value: '95%' },
              { icon: TrendingUp, label: 'Avg Salary Hike', value: '40%' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-12 w-12 text-brand-purple mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose Your Expert', desc: 'Browse verified HR professionals from top companies' },
              { step: '2', title: 'Book a Session', desc: 'Select chat, voice, or video call at your convenience' },
              { step: '3', title: 'Get Guidance', desc: 'Receive personalized career advice and actionable insights' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="h-16 w-16 bg-gradient-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Packs */}
      <section id="packs" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Career Boost Packages</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Choose the perfect package to accelerate your career growth
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {packs.map((pack, idx) => (
              <motion.div
                key={pack._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-brand-purple hover:shadow-2xl transition-all"
              >
                <h3 className="text-2xl font-bold mb-4">{pack.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-brand-purple">₹{pack.discountedPrice}</span>
                  <span className="text-xl text-gray-400 line-through ml-2">₹{pack.originalPrice}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(`/career/pack/${pack._id}`)}
                  className="w-full bg-gradient-primary text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all"
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Success Stories</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial, idx) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar || `https://ui-avatars.com/api/?name=${testimonial.name}`}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.designation} at {testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq._id} className="bg-gray-50 p-6 rounded-xl">
                  <summary className="font-bold text-lg cursor-pointer">{faq.question}</summary>
                  <p className="mt-4 text-gray-700">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-purple via-brand-magenta to-brand-teal text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of professionals who've accelerated their careers with expert guidance</p>
          <button
            onClick={() => navigate('/career/hrs')}
            className="bg-white text-brand-purple px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
          >
            Get Started Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareerGuidancePage;
