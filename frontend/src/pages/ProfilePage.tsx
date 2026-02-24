import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, FileText, Link as LinkIcon, Save, Upload } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
  currentCompany: string;
  experience: string;
  expectedSalary: string;
  noticePeriod: string;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    grade: string;
  }>;
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
  bio: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    currentTitle: '',
    currentCompany: '',
    experience: '',
    expectedSalary: '',
    noticePeriod: '',
    skills: [],
    education: [{ degree: '', institution: '', year: '', grade: '' }],
    workExperience: [{ title: '', company: '', duration: '', description: '' }],
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          const p = data.profile;
          setProfile({
            name: p.personalInfo?.name || '',
            email: p.personalInfo?.email || '',
            phone: p.personalInfo?.phone || '',
            location: p.personalInfo?.location || '',
            currentTitle: p.professionalInfo?.currentTitle || '',
            currentCompany: p.professionalInfo?.currentCompany || '',
            experience: p.professionalInfo?.totalExperience?.toString() || '',
            expectedSalary: p.professionalInfo?.expectedSalary || '',
            noticePeriod: p.professionalInfo?.noticePeriod || '',
            skills: Array.isArray(p.skills?.technical) ? p.skills.technical : [],
            education: Array.isArray(p.education) && p.education.length > 0 ? p.education : [{ degree: '', institution: '', year: '', grade: '' }],
            workExperience: Array.isArray(p.workExperience) && p.workExperience.length > 0 ? p.workExperience : [{ title: '', company: '', duration: '', description: '' }],
            linkedinUrl: p.links?.linkedinUrl || '',
            githubUrl: p.links?.githubUrl || '',
            portfolioUrl: p.links?.portfolioUrl || '',
            resumeUrl: p.documents?.resumeUrl || '',
            bio: p.bio || ''
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Please login first');
        navigate('/login');
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const payload = {
        personalInfo: {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          location: profile.location
        },
        professionalInfo: {
          currentTitle: profile.currentTitle,
          currentCompany: profile.currentCompany,
          totalExperience: parseInt(profile.experience) || 0,
          expectedSalary: profile.expectedSalary,
          noticePeriod: profile.noticePeriod
        },
        skills: {
          technical: profile.skills,
          soft: [],
          certifications: []
        },
        education: profile.education,
        workExperience: profile.workExperience,
        links: {
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          portfolioUrl: profile.portfolioUrl
        },
        documents: {
          resumeUrl: profile.resumeUrl
        },
        bio: profile.bio
      };

      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ Profile saved successfully! (${result.completeness}% complete)`);
        navigate('/profile/view');
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('❌ Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_URL}/api/resume/parse`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const d = result.data;
        setProfile(prev => ({
          ...prev,
          name: d.personalInfo?.fullName || prev.name,
          email: d.personalInfo?.email || prev.email,
          phone: d.personalInfo?.phone || prev.phone,
          location: d.personalInfo?.location || prev.location,
          currentTitle: d.professionalInfo?.currentTitle || prev.currentTitle,
          currentCompany: d.professionalInfo?.currentCompany || prev.currentCompany,
          experience: d.professionalInfo?.experience?.toString() || prev.experience,
          bio: d.professionalInfo?.bio || prev.bio,
          skills: Array.isArray(d.skills) && d.skills.length > 0 ? d.skills : prev.skills,
          education: Array.isArray(d.education) && d.education.length > 0 ? d.education : prev.education,
          workExperience: Array.isArray(d.workExperience) && d.workExperience.length > 0 ? d.workExperience : prev.workExperience,
          linkedinUrl: d.links?.linkedIn || prev.linkedinUrl,
          githubUrl: d.links?.github || prev.githubUrl,
          portfolioUrl: d.links?.portfolio || prev.portfolioUrl,
          resumeUrl: result.resumeUrl || prev.resumeUrl
        }));
        alert(`✅ Resume "${result.fileName}" uploaded and parsed successfully!`);
      } else {
        alert(`❌ ${result.error || 'Failed to parse resume'}`);
      }
    } catch (error: any) {
      console.error('Resume parsing error:', error);
      alert(`❌ Error: ${error.message || 'Failed to parse resume'}`);
    } finally {
      setParsing(false);
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile({ ...profile, skills: [...profile.skills, skill] });
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-3xl font-bold text-gray-900">Edit Profile</h1>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-purple border-r-transparent"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Resume Upload */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Upload Resume (Auto-fill)
                  </h2>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Upload your resume to auto-fill profile</p>
                    <p className="text-sm text-gray-500 mb-4">Supports PDF and DOCX formats</p>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      id="resume-upload"
                      onChange={handleResumeUpload}
                      disabled={parsing}
                    />
                    <label
                      htmlFor="resume-upload"
                      className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer inline-block"
                    >
                      {parsing ? 'Parsing...' : 'Upload Resume'}
                    </label>
                    {profile.resumeUrl && (
                      <p className="text-sm text-green-600 mt-3">✓ Resume uploaded</p>
                    )}
                  </div>
                </section>

                {/* Basic Information */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="Bangalore, India"
                      />
                    </div>
                  </div>
                </section>

                {/* Professional Details */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Title *</label>
                      <input
                        type="text"
                        value={profile.currentTitle}
                        onChange={(e) => setProfile({ ...profile, currentTitle: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Company</label>
                      <input
                        type="text"
                        value={profile.currentCompany}
                        onChange={(e) => setProfile({ ...profile, currentCompany: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="Google"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years) *</label>
                      <input
                        type="number"
                        value={profile.experience}
                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Salary</label>
                      <input
                        type="text"
                        value={profile.expectedSalary}
                        onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="15-20 LPA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Period</label>
                      <select
                        value={profile.noticePeriod}
                        onChange={(e) => setProfile({ ...profile, noticePeriod: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="Immediate">Immediate</option>
                        <option value="15 days">15 days</option>
                        <option value="1 month">1 month</option>
                        <option value="2 months">2 months</option>
                        <option value="3 months">3 months</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills *
                  </h2>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && skillInput) {
                          e.preventDefault();
                          handleSkillAdd(skillInput);
                        }
                      }}
                      placeholder="Type skill and press Enter"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                      >
                        {skill}
                        <button onClick={() => handleSkillRemove(skill)} className="hover:text-red-200">×</button>
                      </span>
                    ))}
                  </div>
                </section>

                {/* Links */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Professional Links
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL *</label>
                      <input
                        type="url"
                        value={profile.linkedinUrl}
                        onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub URL</label>
                      <input
                        type="url"
                        value={profile.githubUrl}
                        onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="https://github.com/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio URL</label>
                      <input
                        type="url"
                        value={profile.portfolioUrl}
                        onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="https://johndoe.com"
                      />
                    </div>
                  </div>
                </section>

                {/* Bio */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    placeholder="Write a brief summary about yourself, your experience, and career goals..."
                  />
                </section>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
