import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Award, Link as LinkIcon, Save, Upload, FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [profile, setProfile] = useState({
    personalInfo: { name: '', email: '', phone: '', location: '' },
    professionalInfo: { currentTitle: '', currentCompany: '', totalExperience: 0, expectedSalary: '', noticePeriod: '' },
    technicalSkills: [] as string[],
    softSkills: [] as string[],
    certifications: [] as string[],
    education: [{ degree: '', institution: '', year: '', grade: '' }],
    workExperience: [{ title: '', company: '', duration: '', description: '' }],
    links: { linkedinUrl: '', githubUrl: '', portfolioUrl: '' },
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

      const response = await fetch(`${API_URL}/api/user-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
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

      const response = await fetch(`${API_URL}/api/user-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ Profile saved successfully! (${result.completeness}% complete)`);
        navigate('/user-profile/view');
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

    try {
      const token = localStorage.getItem('token');
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
          personalInfo: {
            name: d.personalInfo?.fullName || prev.personalInfo.name,
            email: d.personalInfo?.email || prev.personalInfo.email,
            phone: d.personalInfo?.phone || prev.personalInfo.phone,
            location: d.personalInfo?.location || prev.personalInfo.location
          },
          professionalInfo: {
            ...prev.professionalInfo,
            currentTitle: d.professionalInfo?.currentTitle || prev.professionalInfo.currentTitle,
            currentCompany: d.professionalInfo?.currentCompany || prev.professionalInfo.currentCompany
          },
          technicalSkills: Array.isArray(d.skills) && d.skills.length > 0 ? d.skills : prev.technicalSkills,
          links: {
            linkedinUrl: d.links?.linkedIn || prev.links.linkedinUrl,
            githubUrl: d.links?.github || prev.links.githubUrl,
            portfolioUrl: d.links?.portfolio || prev.links.portfolioUrl
          },
          resumeUrl: result.resumeUrl || prev.resumeUrl
        }));
        alert(`✅ Resume parsed successfully!`);
      }
    } catch (error) {
      console.error('Resume parsing error:', error);
      alert('❌ Failed to parse resume');
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !profile.technicalSkills.includes(skill)) {
      setProfile({ ...profile, technicalSkills: [...profile.technicalSkills, skill] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, technicalSkills: profile.technicalSkills.filter(s => s !== skill) });
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

            <div className="space-y-8">
              {/* Resume Upload */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload Resume (Auto-fill)
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    id="resume-upload"
                    onChange={handleResumeUpload}
                  />
                  <label
                    htmlFor="resume-upload"
                    className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer inline-block"
                  >
                    Upload Resume
                  </label>
                  {profile.resumeUrl && <p className="text-sm text-green-600 mt-3">✓ Resume uploaded</p>}
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
                      value={profile.personalInfo.name}
                      onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, name: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={profile.personalInfo.email}
                      onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, email: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={profile.personalInfo.phone}
                      onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, phone: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={profile.personalInfo.location}
                      onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, location: e.target.value } })}
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
                      value={profile.professionalInfo.currentTitle}
                      onChange={(e) => setProfile({ ...profile, professionalInfo: { ...profile.professionalInfo, currentTitle: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      placeholder="Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Company</label>
                    <input
                      type="text"
                      value={profile.professionalInfo.currentCompany}
                      onChange={(e) => setProfile({ ...profile, professionalInfo: { ...profile.professionalInfo, currentCompany: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      placeholder="Google"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years) *</label>
                    <input
                      type="number"
                      value={profile.professionalInfo.totalExperience}
                      onChange={(e) => setProfile({ ...profile, professionalInfo: { ...profile.professionalInfo, totalExperience: parseInt(e.target.value) || 0 } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Period</label>
                    <select
                      value={profile.professionalInfo.noticePeriod}
                      onChange={(e) => setProfile({ ...profile, professionalInfo: { ...profile.professionalInfo, noticePeriod: e.target.value } })}
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
                  Technical Skills *
                </h2>
                <div className="mb-4">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && skillInput) {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                    placeholder="Type skill and press Enter"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.technicalSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-200">×</button>
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
                      value={profile.links.linkedinUrl}
                      onChange={(e) => setProfile({ ...profile, links: { ...profile.links, linkedinUrl: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub URL</label>
                    <input
                      type="url"
                      value={profile.links.githubUrl}
                      onChange={(e) => setProfile({ ...profile, links: { ...profile.links, githubUrl: e.target.value } })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                      placeholder="https://github.com/johndoe"
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
                  placeholder="Write a brief summary about yourself..."
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
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileEditPage;
