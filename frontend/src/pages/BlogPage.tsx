import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, TrendingUp, Briefcase, Users, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Posts');
  const [emailError, setEmailError] = useState('');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    alert(`Thank you for subscribing! We'll send weekly career tips to ${email}`);
    setEmail('');
    setEmailError('');
  };

  const handleReadArticle = (postId: number) => {
    alert(`Article ${postId} - Full article feature coming soon! For now, contact us at blog@refdirectly.com`);
  };

  const handleLoadMore = () => {
    alert('Loading more articles... Feature coming soon!');
  };

  const featuredPost = {
    id: 1,
    title: '10 Proven Strategies to Get Referrals at Top Tech Companies',
    excerpt: 'Learn the insider secrets that helped thousands of job seekers land interviews at Google, Meta, Amazon, and more through employee referrals.',
    author: 'Sarah Johnson',
    date: 'Jan 15, 2025',
    readTime: '8 min read',
    category: 'Career Tips',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
    featured: true
  };

  const blogPosts = [
    {
      id: 2,
      title: 'How to Write a Referral Request That Gets Responses',
      excerpt: 'Master the art of crafting compelling referral requests that professionals actually want to respond to.',
      author: 'Michael Chen',
      date: 'Jan 12, 2025',
      readTime: '6 min read',
      category: 'Networking',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Success Story: From Unemployed to Google in 3 Months',
      excerpt: 'Read how John used RefDirectly to land his dream job at Google after months of unsuccessful applications.',
      author: 'Emily Rodriguez',
      date: 'Jan 10, 2025',
      readTime: '5 min read',
      category: 'Success Stories',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'The Ultimate Guide to LinkedIn Networking for Referrals',
      excerpt: 'Step-by-step guide to building meaningful connections on LinkedIn that lead to job referrals.',
      author: 'David Park',
      date: 'Jan 8, 2025',
      readTime: '10 min read',
      category: 'LinkedIn',
      image: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Why Employee Referrals Have 4x Higher Success Rate',
      excerpt: 'Data-driven insights into why referrals are the most effective way to land your next job.',
      author: 'Lisa Thompson',
      date: 'Jan 5, 2025',
      readTime: '7 min read',
      category: 'Research',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      title: 'How to Stand Out When Requesting a Referral',
      excerpt: 'Tips and tricks to make your profile memorable and increase your chances of getting referred.',
      author: 'Alex Kumar',
      date: 'Jan 3, 2025',
      readTime: '6 min read',
      category: 'Career Tips',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    },
    {
      id: 7,
      title: 'Referral Etiquette: Do\'s and Don\'ts',
      excerpt: 'Essential guidelines for maintaining professional relationships while seeking referrals.',
      author: 'Rachel Green',
      date: 'Dec 30, 2024',
      readTime: '5 min read',
      category: 'Networking',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop'
    }
  ];

  const categories = [
    { name: 'All Posts', count: 24, icon: Briefcase },
    { name: 'Career Tips', count: 12, icon: Target },
    { name: 'Success Stories', count: 8, icon: TrendingUp },
    { name: 'Networking', count: 6, icon: Users }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-purple via-brand-magenta to-brand-teal text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                RefDirectly Blog
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8">
                Career tips, referral strategies, and success stories from our community
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                  <span className="font-semibold">24 Articles</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                  <span className="font-semibold">50K+ Readers</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                  <span className="font-semibold">Weekly Updates</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 -mt-12">
          <div className="max-w-7xl mx-auto">
            {/* Featured Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-12"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-64 md:h-auto">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 w-fit">
                    ⭐ Featured Post
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 text-lg mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <Link
                    to="#"
                    onClick={(e) => { e.preventDefault(); handleReadArticle(featuredPost.id); }}
                    className="inline-flex items-center gap-2 bg-gradient-primary text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all w-fit"
                  >
                    Read Full Article
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                  <h3 className="font-bold text-xl text-gray-900 mb-6">Categories</h3>
                  <div className="space-y-3">
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                          selectedCategory === category.name 
                            ? 'bg-gradient-primary text-white' 
                            : 'hover:bg-gradient-primary hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <category.icon className="h-5 w-5" />
                          <span className="font-semibold">{category.name}</span>
                        </div>
                        <span className="text-sm bg-gray-100 group-hover:bg-white/20 px-3 py-1 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="font-bold text-lg text-gray-900 mb-4">Subscribe</h4>
                    <p className="text-sm text-gray-600 mb-4">Get weekly career tips delivered to your inbox</p>
                    <form onSubmit={handleSubscribe}>
                      <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple mb-3"
                      />
                      {emailError && <p className="text-red-500 text-xs mb-2">{emailError}</p>}
                      <button type="submit" className="w-full bg-gradient-primary text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Blog Posts Grid */}
              <div className="lg:col-span-3">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
                  <p className="text-gray-600 mt-2">Expert insights to accelerate your career</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {blogPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleReadArticle(post.id)}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                    >
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                          {post.category}
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-brand-purple transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {post.author}
                          </div>
                          <div className="flex items-center gap-3">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                  <button 
                    onClick={handleLoadMore}
                    className="px-8 py-4 border-2 border-brand-purple text-brand-purple rounded-xl font-bold hover:bg-brand-purple hover:text-white transition-all"
                  >
                    Load More Articles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
