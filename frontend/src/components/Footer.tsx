import React from 'react';
import { Linkedin, Twitter, Github, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com/company/refdirectly', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com/refdirectly', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/refdirectly', label: 'Instagram' },
    { icon: Github, href: 'https://github.com/refdirectly', label: 'Github' },
  ];

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Find Referrer', path: '/jobs' },
        { name: 'Become Referrer', path: '/referrer-signup' },
        { name: 'Premium', path: '/pricing' },
        { name: 'Pricing', path: '/pricing' }
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Blog', path: '/blog' },
        { name: 'Press', path: '/press' }
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', path: '/help' },
        { name: 'Community', path: '/community' },
        { name: 'Guides', path: '/how-it-works' },
        { name: 'API Docs', path: '/api-docs' }
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Cookie Policy', path: '/cookies' },
        { name: 'Disclaimer', path: '/disclaimer' }
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -mt-px">
        <svg className="relative block w-full h-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,0 L0,50 Q360,120 720,70 Q1080,20 1440,50 L1440,0 Z" className="fill-white"></path>
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-brand-magenta/20 to-brand-teal/30 opacity-50"></div>
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(75, 0, 125, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 167, 197, 0.3) 0%, transparent 50%)' }}></div>
      <div className="container mx-auto px-6 pt-48 pb-20 relative z-10">
        <div className="mb-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-semibold text-gray-300">Join 10,000+ professionals</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-black mb-6 text-white tracking-tight">Stay Updated</h2>
            <p className="text-gray-300 text-xl md:text-2xl mb-12 font-normal">Get exclusive job opportunities and expert referral tips.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                id="newsletter-email"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple focus:bg-white/20 transition-all shadow-xl"
              />
              <button 
                onClick={() => {
                  const email = (document.getElementById('newsletter-email') as HTMLInputElement)?.value;
                  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    alert('✅ Thank you for subscribing! Check your email for confirmation.');
                    (document.getElementById('newsletter-email') as HTMLInputElement).value = '';
                  } else {
                    alert('⚠️ Please enter a valid email address');
                  }
                }}
                className="px-12 py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer"
              >
                Subscribe
              </button>
            </div>
            <p className="text-sm text-gray-300 font-medium">🔒 No spam. Unsubscribe anytime.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-24">
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brand-purple to-brand-magenta bg-clip-text text-transparent mb-3 drop-shadow-lg">50K+</div>
              <div className="text-sm text-gray-200 font-semibold">Active Users</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brand-magenta to-brand-teal bg-clip-text text-transparent mb-3 drop-shadow-lg">10K+</div>
              <div className="text-sm text-gray-200 font-semibold">Successful Referrals</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brand-teal to-brand-purple bg-clip-text text-transparent mb-3 drop-shadow-lg">500+</div>
              <div className="text-sm text-gray-200 font-semibold">Companies</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-3 drop-shadow-lg">4.9★</div>
              <div className="text-sm text-gray-200 font-semibold">User Rating</div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-10 font-semibold">Trusted by professionals at</p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
              <div className="text-2xl md:text-3xl font-black text-white/90 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer">Google</div>
              <div className="text-2xl md:text-3xl font-black text-white/90 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer">Meta</div>
              <div className="text-2xl md:text-3xl font-black text-white/90 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer">Amazon</div>
              <div className="text-2xl md:text-3xl font-black text-white/90 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer">Microsoft</div>
              <div className="text-2xl md:text-3xl font-black text-white/90 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer">Apple</div>
              <div className="text-2xl md:text-3xl font-black text-white/90 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer">Netflix</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 mb-20">
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img src="/logo.png" alt="RefDirectly" className="h-20 w-28 mb-4" />
            </div>
            <p className="text-gray-300 mb-8 max-w-sm leading-relaxed text-base">
              The modern way to get referred and hired. Connect with verified professionals and accelerate your career journey.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="group h-12 w-12 rounded-2xl bg-white/10 hover:bg-gradient-primary border border-white/20 hover:border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-brand-purple/30 backdrop-blur-sm"
                >
                  <social.icon size={20} className="text-white group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-7 bg-gradient-primary bg-clip-text text-transparent">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-gray-300 hover:text-white hover:translate-x-2 inline-flex items-center gap-2 transition-all duration-300 text-sm group"
                    >
                      <span className="h-1 w-1 rounded-full bg-gray-600 group-hover:bg-gradient-primary group-hover:w-2 transition-all"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-magenta/20 to-brand-teal/20 blur-3xl"></div>
          <div className="relative border-t border-white/10 pt-12 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 px-4 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center gap-2">
                    <span className="text-xs font-bold text-green-400">🏆 Best Referral Platform 2024</span>
                  </div>
                  <div className="h-8 px-4 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400">⭐ 4.9/5 Rating</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 font-medium">
                  © {new Date().getFullYear()} RefDirectly, Inc. All rights reserved.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xs text-gray-400">
                    Made with ❤️ for job seekers worldwide
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-6 px-3 rounded-full bg-white/5 border border-white/10 flex items-center text-xs text-gray-400 font-semibold backdrop-blur-sm">🔒 SSL Secure</div>
                    <div className="h-6 px-3 rounded-full bg-white/5 border border-white/10 flex items-center text-xs text-gray-400 font-semibold backdrop-blur-sm">✓ SOC 2</div>
                    <div className="h-6 px-3 rounded-full bg-white/5 border border-white/10 flex items-center text-xs text-gray-400 font-semibold backdrop-blur-sm">🛡️ GDPR</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-gray-300 flex items-center gap-2 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    All Systems Operational
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <Link to="/" className="text-gray-300 hover:text-white transition-all duration-300 font-semibold hover:scale-110">Sitemap</Link>
                  <a href="https://github.com/refdirectly/RefDirectlyNew" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-all duration-300 font-semibold hover:scale-110">Changelog</a>
                  <a href="https://refdirectly-1.onrender.com/api" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-all duration-300 font-semibold hover:scale-110">API</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
