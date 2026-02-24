import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Building2, Clock, DollarSign, Filter, Bookmark, Share2, TrendingUp, Users, Sparkles, ArrowRight, ExternalLink, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReferralRequestModal from '../components/ReferralRequestModal';

interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  skills: string[];
  referralReward: number;
  createdAt: string;
  applicants?: number;
}

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/jobs/live?keywords=${encodeURIComponent(searchTerm || 'software engineer')}&location=${encodeURIComponent(locationFilter || 'in')}&page=${currentPage}`);
        const result = await response.json();
        
        const formattedJobs = (result.jobs || []).map((job: any) => {
          const title = job.title || job.job_title;
          const company = job.company || job.employer_name;
          const titleLower = (title || '').toLowerCase();
          const companyLower = (company || '').toLowerCase();
          
          const tier1 = ['google', 'microsoft', 'apple', 'amazon', 'meta', 'facebook', 'netflix', 'tesla'];
          const tier2 = ['flipkart', 'swiggy', 'zomato', 'paytm', 'uber', 'airbnb', 'salesforce'];
          const isTier1 = tier1.some(c => companyLower.includes(c));
          const isTier2 = tier2.some(c => companyLower.includes(c));
          const isSenior = titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal');
          const isJunior = titleLower.includes('junior') || titleLower.includes('intern') || titleLower.includes('entry');
          
          let reward = 199;
          if (isTier1) reward = isSenior ? 999 : isJunior ? 499 : 699;
          else if (isTier2) reward = isSenior ? 699 : isJunior ? 299 : 499;
          else reward = isSenior ? 399 : isJunior ? 99 : 199;
          
          return {
          _id: job._id || job.job_id,
          title,
          company,
          companyLogo: `https://logo.clearbit.com/${company?.toLowerCase().replace(/\\s/g, '')}.com`,
          location: job.location || `${job.job_city}, ${job.job_state}` || 'Remote',
          type: job.type || job.job_employment_type || 'Full-time',
          salary: job.salary || job.job_salary || 'Competitive',
          description: (job.description || job.job_description || '').substring(0, 200),
          skills: job.skills || job.job_required_skills || [],
          referralReward: reward,
          createdAt: job.createdAt || job.job_posted_at_datetime_utc || new Date().toISOString(),
          applicants: Math.floor(Math.random() * 200) + 10
        }}).filter((job: Job) => job.title && job.company);
        
        setJobs(formattedJobs);
        if (formattedJobs.length > 0 && !selectedJob) {
          setSelectedJob(formattedJobs[0]);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchJobs, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, locationFilter, currentPage]);

  const toggleSave = (jobId: string) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <main className="flex-grow pt-24">
        {/* Hero Search Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold mb-4">
                <Sparkles className="h-4 w-4" />
                10,000+ Live Jobs
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
                Find Your Dream Job
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Discover opportunities at top companies with verified referrals
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/50">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Job title, skills, or company"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    />
                  </div>
                  <div className="w-full md:w-64 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Location"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                    <Search className="h-5 w-5" />
                    Search
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-32">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Filters
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Job Type</label>
                    <div className="space-y-2">
                      {['Full-time', 'Part-time', 'Contract', 'Remote'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Experience Level</label>
                    <div className="space-y-2">
                      {['Entry Level', 'Mid Level', 'Senior', 'Lead'].map(level => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="lg:col-span-2 space-y-4 lg:h-[calc(100vh-250px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedJob(job)}
                      className={`group relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 cursor-pointer transition-all border-2 ${
                        selectedJob?._id === job._id
                          ? 'border-blue-500 shadow-xl shadow-blue-100'
                          : 'border-transparent hover:border-gray-200 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-lg">
                            <img
                              src={job.companyLogo}
                              alt={job.company}
                              className="h-10 w-10 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${job.company[0]}</span>`;
                              }}
                            />
                          </div>
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-gray-700 font-semibold mb-2">{job.company}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                              <Briefcase className="h-3 w-3" />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                              <Clock className="h-3 w-3" />
                              {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                              <TrendingUp className="h-3 w-3" />
                              ₹{job.referralReward}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(job._id);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            >
                              <Heart className={`h-5 w-5 ${savedJobs.has(job._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              {/* Pagination */}
              {!loading && jobs.length > 0 && (
                <div className="flex justify-center items-center gap-4 mt-6 pb-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-bold bg-white/80 backdrop-blur-xl px-6 py-3 rounded-xl border-2 border-gray-200 shadow-lg">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="lg:col-span-2 lg:sticky lg:top-32 lg:h-[calc(100vh-250px)]">
              <AnimatePresence mode="wait">
                {selectedJob ? (
                  <motion.div
                    key={selectedJob._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden h-full flex flex-col"
                  >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-4">
                            <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden ring-4 ring-white/30">
                              <img
                                src={selectedJob.companyLogo}
                                alt={selectedJob.company}
                                className="h-12 w-12 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-white">${selectedJob.company[0]}</span>`;
                                }}
                              />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold mb-1">{selectedJob.title}</h2>
                              <p className="text-white/90 font-semibold">{selectedJob.company}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-lg transition-all">
                              <Share2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => toggleSave(selectedJob._id)}
                              className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-lg transition-all"
                            >
                              <Heart className={`h-5 w-5 ${savedJobs.has(selectedJob._id) ? 'fill-white' : ''}`} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setShowReferralModal(true)}
                            className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                          >
                            Request Referral
                            <ArrowRight className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedJob.title + ' ' + selectedJob.company + ' job apply')}`, '_blank')}
                            className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                          >
                            <ExternalLink className="h-5 w-5" />
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                          <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">{selectedJob.applicants}</p>
                          <p className="text-xs text-gray-600 font-semibold">Applicants</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                          <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">₹{selectedJob.referralReward}</p>
                          <p className="text-xs text-gray-600 font-semibold">Bonus</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                          <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-sm font-bold text-gray-900">{selectedJob.salary}</p>
                          <p className="text-xs text-gray-600 font-semibold">Salary</p>
                        </div>
                      </div>

                      {/* Job Info */}
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700">
                          <MapPin className="h-4 w-4" />
                          {selectedJob.location}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700">
                          <Briefcase className="h-4 w-4" />
                          {selectedJob.type}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700">
                          <Clock className="h-4 w-4" />
                          Posted {new Date(selectedJob.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-white" />
                          </div>
                          About the role
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                      </div>

                      {/* Skills */}
                      {selectedJob.skills?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.skills.slice(0, 10).map((skill, i) => (
                              <span
                                key={i}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Company */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">About {selectedJob.company}</h3>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-14 w-14 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                            <img
                              src={selectedJob.companyLogo}
                              alt={selectedJob.company}
                              className="h-10 w-10 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold text-gray-600">${selectedJob.company[0]}</span>`;
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{selectedJob.company}</p>
                            <p className="text-sm text-gray-600">Technology • 1000+ employees</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/company/${selectedJob.company.toLowerCase().replace(/\s+/g, '-')}`)}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          View company page
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center"
                  >
                    <Building2 className="h-20 w-20 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Select a job to view details</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {selectedJob && (
        <ReferralRequestModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          job={selectedJob}
        />
      )}
    </div>
  );
};

export default JobsPage;
