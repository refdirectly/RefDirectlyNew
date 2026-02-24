import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, Award, Link as LinkIcon, Edit, FileText, Building2, Clock, DollarSign, TrendingUp, Download, Share2, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProfileViewPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/user-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow pt-32 pb-16 flex items-center justify-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-purple border-r-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Profile Found</h2>
            <button
              onClick={() => navigate('/user-profile/edit')}
              className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Create Profile
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6 border border-gray-100"
          >
            <div className="relative h-48 bg-gradient-to-r from-brand-purple via-brand-magenta to-brand-teal">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -bottom-16 left-8">
                <div className="h-32 w-32 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
                  <div className="h-28 w-28 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <User className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
              <div className="absolute top-6 right-6 flex gap-3">
                <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
            
            <div className="pt-20 px-8 pb-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">{profile.personalInfo.name}</h1>
                  <p className="text-2xl text-gray-700 font-semibold mb-3">{profile.professionalInfo.currentTitle}</p>
                  {profile.professionalInfo.currentCompany && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Building2 className="h-5 w-5" />
                      <span className="text-lg">{profile.professionalInfo.currentCompany}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-purple" />
                      <span>{profile.personalInfo.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-brand-magenta" />
                      <span>{profile.professionalInfo.totalExperience} years experience</span>
                    </div>
                    {profile.professionalInfo.noticePeriod && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-teal" />
                        <span>{profile.professionalInfo.noticePeriod} notice</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/user-profile/edit')}
                  className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all flex items-center gap-3 hover:scale-105"
                >
                  <Edit className="h-5 w-5" />
                  Edit Profile
                </button>
              </div>
              
              {/* Completeness Bar */}
              <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand-purple" />
                    <span className="text-sm font-bold text-gray-700">Profile Strength</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{profile.completeness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.completeness}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-primary h-4 rounded-full shadow-lg"
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Complete your profile to increase visibility to recruiters</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                      <p className="text-gray-900 font-medium">{profile.personalInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Phone</p>
                      <p className="text-gray-900 font-medium">{profile.personalInfo.phone}</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Bio */}
              {profile.bio && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-magenta to-brand-teal flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Professional Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
                </motion.section>
              )}

              {/* Skills */}
              {profile.technicalSkills?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-teal to-brand-purple flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    Technical Skills
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {profile.technicalSkills.map((skill: string, i: number) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="bg-gradient-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Professional Stats */}
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-brand-purple" />
                  Career Stats
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Experience</p>
                        <p className="text-2xl font-bold text-gray-900">{profile.professionalInfo.totalExperience} <span className="text-sm font-normal">years</span></p>
                      </div>
                    </div>
                  </div>
                  {profile.professionalInfo.expectedSalary && (
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Expected Salary</p>
                          <p className="text-lg font-bold text-gray-900">{profile.professionalInfo.expectedSalary}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {profile.professionalInfo.noticePeriod && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Notice Period</p>
                          <p className="text-lg font-bold text-gray-900">{profile.professionalInfo.noticePeriod}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* Links */}
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-brand-magenta" />
                  Professional Links
                </h2>
                <div className="space-y-3">
                  {profile.links.linkedinUrl && (
                    <a
                      href={profile.links.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                          <LinkIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">LinkedIn</span>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  )}
                  {profile.links.githubUrl && (
                    <a
                      href={profile.links.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center">
                          <LinkIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">GitHub</span>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </a>
                  )}
                  {profile.links.portfolioUrl && (
                    <a
                      href={profile.links.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <LinkIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">Portfolio</span>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-brand-purple transition-colors" />
                    </a>
                  )}
                </div>
              </motion.section>

              {/* Resume */}
              {profile.resumeUrl && (
                <motion.section
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Resume</h2>
                  </div>
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                    Resume uploaded successfully
                  </p>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileViewPage;
