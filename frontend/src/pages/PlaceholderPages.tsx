import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Mail, Phone, MapPin, Award, Users, TrendingUp, MessageCircle, BookOpen, Shield, FileText, Cookie, AlertTriangle, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Press Page
export const PressPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  const handleDownloadAssets = () => {
    const link = document.createElement('a');
    link.href = '/press-kit.zip';
    link.download = 'RefDirectly-Press-Kit.zip';
    link.click();
    alert('Press kit download started! If download doesn\'t start, please contact press@refdirectly.com');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <Newspaper className="h-4 w-4" />
                <span className="text-sm font-semibold">Press & Media</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6">Press Kit</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Media resources, company information, and press releases for journalists and partners.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">50,000+</h3>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">10,000+</h3>
                <p className="text-gray-600">Successful Referrals</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Partner Companies</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About RefDirectly</h2>
              <p className="text-gray-600 text-lg mb-4">RefDirectly is the leading platform connecting job seekers with verified employees at top companies for referrals. Founded in 2024, we've helped thousands of professionals land their dream jobs through our innovative referral marketplace.</p>
              <p className="text-gray-600 text-lg">Our mission is to democratize access to job opportunities by making employee referrals accessible to everyone, regardless of their network.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Press Contact</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-brand-purple" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <a href="mailto:press@refdirectly.com" className="text-brand-purple hover:underline">press@refdirectly.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-brand-purple" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <a href="tel:+919555219911" className="text-brand-purple hover:underline">+91 95552 19911</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-brand-purple" />
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">DLF Phase 3, Gurgaon, Haryana, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-primary text-white rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Download Press Kit</h3>
              <p className="mb-6">Logos, brand guidelines, and media assets</p>
              <button onClick={handleDownloadAssets} className="bg-white text-brand-purple px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all">Download Assets</button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Help Center Page
export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  const faqs = [
    { q: 'How does RefDirectly work?', a: 'RefDirectly connects job seekers with verified employees at top companies. You can browse jobs, request referrals, and get introduced to hiring managers through our platform.' },
    { q: 'Is RefDirectly free to use?', a: 'Yes! Job seekers can browse jobs and request referrals for free. We offer premium features for enhanced visibility and priority support.' },
    { q: 'How do I request a referral?', a: 'Simply browse our job listings, find a position you\'re interested in, and click "Request Referral". Our verified employees will review your profile and connect with you.' },
    { q: 'What is the success rate?', a: 'Our users have a 92% higher success rate compared to traditional applications. Employee referrals significantly increase your chances of getting an interview.' },
    { q: 'How long does it take to get a referral?', a: 'Most referral requests are reviewed within 24-48 hours. Once accepted, you\'ll be connected with the referrer immediately.' },
    { q: 'Can I become a referrer?', a: 'Yes! If you work at a company and want to earn money by referring candidates, sign up as a referrer. You\'ll earn rewards for successful placements.' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">Help Center</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6">How Can We Help?</h1>
              <div className="max-w-2xl mx-auto">
                <input 
                  type="text" 
                  placeholder="Search for answers..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" 
                />
              </div>
            </div>

            <div className="space-y-4 mb-12">
              {faqs.filter(faq => 
                searchQuery === '' || 
                faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                faq.a.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((faq, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.q}</h3>
                    <span className="text-2xl text-brand-purple">{expandedFaq === i ? '−' : '+'}</span>
                  </div>
                  {expandedFaq === i && <p className="text-gray-600">{faq.a}</p>}
                </div>
              ))}
            </div>

            <div className="bg-gradient-primary text-white rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
              <p className="mb-6">Our support team is here 24/7</p>
              <a href="mailto:support@refdirectly.com" className="inline-block bg-white text-brand-purple px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all">Contact Support</a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Community Page
export const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <Users className="h-4 w-4" />
                <span className="text-sm font-semibold">Community</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6">Join Our Community</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Connect with 50,000+ professionals sharing referral tips, career advice, and success stories.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="h-16 w-16 rounded-full bg-blue-100 mb-4 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Discussion Forums</h3>
                <p className="text-gray-600 mb-4">Ask questions, share experiences, and learn from others in our active community forums.</p>
                <button onClick={() => navigate('/signup')} className="text-brand-purple font-semibold hover:underline">Join Discussions →</button>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="h-16 w-16 rounded-full bg-green-100 mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Success Stories</h3>
                <p className="text-gray-600 mb-4">Read inspiring stories from community members who landed their dream jobs.</p>
                <button onClick={() => navigate('/blog')} className="text-brand-purple font-semibold hover:underline">Read Stories →</button>
              </div>
            </div>

            <div className="bg-gradient-primary text-white rounded-2xl p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Community Guidelines</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto">Be respectful, helpful, and professional. We're all here to help each other succeed.</p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-bold mb-2">✓ Be Respectful</h4>
                  <p className="text-sm opacity-90">Treat everyone with kindness and professionalism</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-bold mb-2">✓ Share Knowledge</h4>
                  <p className="text-sm opacity-90">Help others by sharing your experiences</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-bold mb-2">✓ Stay Professional</h4>
                  <p className="text-sm opacity-90">Keep discussions career-focused and appropriate</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// API Docs Page
export const APIDocsPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-semibold">API Documentation</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6">Developer API</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Integrate RefDirectly into your applications with our powerful REST API.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started</h2>
              <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm mb-6">
                <div>curl -X GET https://refdirectly-1.onrender.com/api/jobs \</div>
                <div className="ml-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
              </div>
              <p className="text-gray-600">Base URL: <code className="bg-gray-100 px-2 py-1 rounded">https://refdirectly-1.onrender.com/api</code></p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">📋 Jobs API</h3>
                <p className="text-gray-600 mb-4">Access job listings and search functionality</p>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">GET /api/jobs</code>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">👤 Users API</h3>
                <p className="text-gray-600 mb-4">Manage user profiles and authentication</p>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">GET /api/users</code>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">🤝 Referrals API</h3>
                <p className="text-gray-600 mb-4">Create and manage referral requests</p>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">POST /api/referrals</code>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Analytics API</h3>
                <p className="text-gray-600 mb-4">Track performance and metrics</p>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">GET /api/analytics</code>
              </div>
            </div>

            <div className="bg-gradient-primary text-white rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Need an API Key?</h3>
              <p className="mb-6">Contact our team to get started with API access</p>
              <a href="mailto:api@refdirectly.com" className="inline-block bg-white text-brand-purple px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all">Request API Access</a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Privacy Policy Page
export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-semibold">Privacy Policy</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: January 18, 2025</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 mb-4">We collect information you provide directly to us, including:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Name, email address, and contact information</li>
                  <li>Professional information (resume, work history, skills)</li>
                  <li>Account credentials and preferences</li>
                  <li>Payment information for premium services</li>
                  <li>Communications with other users and support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Connect job seekers with referrers</li>
                  <li>Process transactions and send notifications</li>
                  <li>Respond to your comments and questions</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Detect and prevent fraud and abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                <p className="text-gray-600 mb-4">We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Other users (when you request referrals)</li>
                  <li>Service providers who assist our operations</li>
                  <li>Law enforcement when required by law</li>
                  <li>Business partners with your consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-600">We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>Object to certain data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
                <p className="text-gray-600">If you have questions about this Privacy Policy, please contact us at:</p>
                <p className="text-brand-purple font-semibold mt-2">privacy@refdirectly.com</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Terms of Service Page
export const TermsOfServicePage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-semibold">Terms of Service</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-gray-600">Last updated: January 18, 2025</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600">By accessing and using RefDirectly, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
                <p className="text-gray-600 mb-4">To use certain features, you must create an account. You agree to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Notify us of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
                <p className="text-gray-600 mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Spam or send unsolicited communications</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated tools to scrape our content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Referral Services</h2>
                <p className="text-gray-600">RefDirectly facilitates connections between job seekers and referrers. We do not guarantee job placements or interview opportunities. Referrers are independent users, not employees of RefDirectly.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
                <p className="text-gray-600">Premium features require payment. All fees are non-refundable unless otherwise stated. We reserve the right to change pricing with 30 days notice.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
                <p className="text-gray-600">All content on RefDirectly, including text, graphics, logos, and software, is owned by RefDirectly and protected by copyright laws. You may not copy, modify, or distribute our content without permission.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-600">RefDirectly is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
                <p className="text-gray-600">We may suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
                <p className="text-gray-600">Questions about these Terms? Contact us at:</p>
                <p className="text-brand-purple font-semibold mt-2">legal@refdirectly.com</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Cookie Policy Page
export const CookiePolicyPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <Cookie className="h-4 w-4" />
                <span className="text-sm font-semibold">Cookie Policy</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
              <p className="text-gray-600">Last updated: January 18, 2025</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                <p className="text-gray-600">Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and understand how you use our services.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Essential Cookies</h3>
                    <p className="text-gray-600">Required for the website to function properly. These cannot be disabled.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Analytics Cookies</h3>
                    <p className="text-gray-600">Help us understand how visitors interact with our website by collecting anonymous data.</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Functional Cookies</h3>
                    <p className="text-gray-600">Remember your preferences and settings to provide a personalized experience.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Marketing Cookies</h3>
                    <p className="text-gray-600">Track your activity to deliver relevant advertisements and measure campaign effectiveness.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
                <p className="text-gray-600 mb-4">You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800"><strong>Note:</strong> Most browsers accept cookies by default. You can change your browser settings to refuse cookies or alert you when cookies are being sent.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                <p className="text-gray-600">We use third-party services like Google Analytics and social media platforms that may set their own cookies. Please review their privacy policies for more information.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600">Questions about our cookie policy? Contact us at:</p>
                <p className="text-brand-purple font-semibold mt-2">privacy@refdirectly.com</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Disclaimer Page
export const DisclaimerPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-semibold">Disclaimer</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-4">Disclaimer</h1>
              <p className="text-gray-600">Last updated: January 18, 2025</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">General Information</h2>
                <p className="text-gray-600">The information provided by RefDirectly is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Employment Guarantee</h2>
                <p className="text-gray-600">RefDirectly is a platform that facilitates connections between job seekers and referrers. We do not guarantee:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-4">
                  <li>Job placements or offers</li>
                  <li>Interview opportunities</li>
                  <li>Successful referrals</li>
                  <li>Response from referrers or companies</li>
                  <li>Specific outcomes from using our services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Content</h2>
                <p className="text-gray-600">Our platform may contain links to third-party websites or services. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Advice</h2>
                <p className="text-gray-600">The information on RefDirectly is not intended to be a substitute for professional career advice. Always seek the advice of qualified professionals with any questions you may have regarding career decisions.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibility</h2>
                <p className="text-gray-600">Users are responsible for:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-4">
                  <li>Verifying information provided by other users</li>
                  <li>Conducting due diligence on job opportunities</li>
                  <li>Protecting their personal information</li>
                  <li>Complying with applicable laws and regulations</li>
                  <li>Their interactions with other users</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-600">Under no circumstance shall RefDirectly have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Disclaimer</h2>
                <p className="text-gray-600">We reserve the right to modify this disclaimer at any time. Changes will be effective immediately upon posting to the website.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-600">If you have any questions about this Disclaimer, please contact us at:</p>
                <p className="text-brand-purple font-semibold mt-2">legal@refdirectly.com</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Careers Page
export const CareersPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    window.scrollTo(0, 0);
    fetchJobs();
  }, []);
  
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/career/jobs`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApply = (job: any) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };
  
  const openings = [
    { title: 'Senior Full Stack Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Product Manager', dept: 'Product', location: 'Remote', type: 'Full-time' },
    { title: 'UX Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
    { title: 'Customer Success Manager', dept: 'Customer Success', location: 'Remote', type: 'Full-time' },
    { title: 'Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time' },
    { title: 'Data Scientist', dept: 'Data', location: 'Remote', type: 'Full-time' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2 rounded-full mb-6">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm font-semibold">Join Our Team</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6">Careers at RefDirectly</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Help us revolutionize how people find jobs. Join a team that's making a real impact on millions of careers.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Growth</h3>
                <p className="text-gray-600">Join a rapidly scaling startup</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-4xl mb-4">🌎</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Remote First</h3>
                <p className="text-gray-600">Work from anywhere in the world</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Competitive Pay</h3>
                <p className="text-gray-600">Top-tier compensation + equity</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Open Positions</h2>
              <div className="space-y-4">
                {(loading ? openings : jobs.length > 0 ? jobs : openings).map((job, i) => (
                  <div key={i} className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl hover:border-brand-purple transition-all cursor-pointer">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>🏢 {job.dept}</span>
                        <span>📍 {job.location}</span>
                        <span>📅 {job.type}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleApply(job)}
                      className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-primary text-white rounded-2xl p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Don't See Your Role?</h2>
              <p className="text-lg mb-6">We're always looking for talented people. Send us your resume!</p>
              <a href="mailto:careers@refdirectly.com" className="inline-block bg-white text-brand-purple px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all">Email Us</a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
      {showApplicationModal && selectedJob && (
        <ApplicationModal job={selectedJob} onClose={() => setShowApplicationModal(false)} />
      )}
    </div>
  );
};

// Application Modal Component
const ApplicationModal: React.FC<{ job: any; onClose: () => void }> = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    resumeUrl: '',
    coverLetter: '',
    experience: '',
    currentCompany: '',
    currentRole: '',
    skills: '',
    portfolioUrl: '',
    expectedSalary: '',
    noticePeriod: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!formData.fullName) newErrors.fullName = 'Required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.phone) newErrors.phone = 'Required';
    if (!formData.coverLetter) newErrors.coverLetter = 'Required';
    if (!formData.experience) newErrors.experience = 'Required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/career/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job._id || job.title,
          ...formData,
          experience: parseInt(formData.experience),
          skills: formData.skills.split(',').map((s: string) => s.trim())
        })
      });
      
      if (response.ok) {
        alert('✅ Application submitted successfully! We\'ll review and get back to you soon.');
        onClose();
      } else {
        alert('❌ Error submitting application. Please try again.');
      }
    } catch (error) {
      alert('❌ Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-primary text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Apply for {job.title}</h2>
              <p className="text-sm opacity-90">{job.dept || job.department} • {job.location} • {job.type}</p>
            </div>
            <button type="button" onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2" title="Close modal">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input id="full-name" type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="John Doe" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="john@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
              <input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="+91 98765 43210" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-1">Years of Experience *</label>
              <input id="experience" type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="5" />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current-company" className="block text-sm font-semibold text-gray-700 mb-1">Current Company</label>
              <input id="current-company" type="text" value={formData.currentCompany} onChange={(e) => setFormData({...formData, currentCompany: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="Google" />
            </div>
            <div>
              <label htmlFor="current-role" className="block text-sm font-semibold text-gray-700 mb-1">Current Role</label>
              <input id="current-role" type="text" value={formData.currentRole} onChange={(e) => setFormData({...formData, currentRole: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="Software Engineer" />
            </div>
          </div>

          <div>
            <label htmlFor="linkedin-url" className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn URL</label>
            <input id="linkedin-url" type="url" value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="https://linkedin.com/in/yourprofile" />
          </div>

          <div>
            <label htmlFor="resume-url" className="block text-sm font-semibold text-gray-700 mb-1">Resume URL (Google Drive/Dropbox)</label>
            <input id="resume-url" type="url" value={formData.resumeUrl} onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="https://drive.google.com/..." />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-1">Skills (comma-separated)</label>
            <input id="skills" type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="React, Node.js, Python" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expected-salary" className="block text-sm font-semibold text-gray-700 mb-1">Expected Salary</label>
              <input id="expected-salary" type="text" value={formData.expectedSalary} onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="₹15-20 LPA" />
            </div>
            <div>
              <label htmlFor="notice-period" className="block text-sm font-semibold text-gray-700 mb-1">Notice Period</label>
              <input id="notice-period" type="text" value={formData.noticePeriod} onChange={(e) => setFormData({...formData, noticePeriod: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="Immediate / 30 days" />
            </div>
          </div>

          <div>
            <label htmlFor="portfolio-url" className="block text-sm font-semibold text-gray-700 mb-1">Portfolio URL</label>
            <input id="portfolio-url" type="url" value={formData.portfolioUrl} onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="https://yourportfolio.com" />
          </div>

          <div>
            <label htmlFor="cover-letter" className="block text-sm font-semibold text-gray-700 mb-1">Cover Letter *</label>
            <textarea id="cover-letter" value={formData.coverLetter} onChange={(e) => setFormData({...formData, coverLetter: e.target.value})} rows={6} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple" placeholder="Tell us why you're a great fit for this role..."></textarea>
            {errors.coverLetter && <p className="text-red-500 text-xs mt-1">{errors.coverLetter}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
