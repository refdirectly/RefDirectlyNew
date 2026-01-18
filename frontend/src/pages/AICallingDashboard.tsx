import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, BarChart3, Mail, Activity, Send, Loader } from 'lucide-react';

const AICallingDashboard: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Call Script Generation
  const [scriptForm, setScriptForm] = useState({
    leadName: '',
    company: '',
    role: '',
    painPoints: '',
    objective: 'discovery'
  });

  // Call Analysis
  const [analysisForm, setAnalysisForm] = useState({
    transcript: '',
    duration: 0
  });

  // Follow-up Generation
  const [followupForm, setFollowupForm] = useState({
    leadName: '',
    callSummary: '',
    nextSteps: '',
    type: 'email'
  });

  // Real-time Coaching
  const [coachingForm, setCoachingForm] = useState({
    currentPhase: 'introduction',
    transcript: '',
    leadResponse: ''
  });

  const handleGenerateScript = async () => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai-calling/generate-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scriptForm)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to generate script:', error);
      setResult({ error: 'Failed to generate script' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCall = async () => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai-calling/analyze-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(analysisForm)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to analyze call:', error);
      setResult({ error: 'Failed to analyze call' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFollowup = async () => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai-calling/generate-followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(followupForm)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to generate follow-up:', error);
      setResult({ error: 'Failed to generate follow-up' });
    } finally {
      setLoading(false);
    }
  };

  const handleGetCoaching = async () => {
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai-calling/coaching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(coachingForm)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to get coaching:', error);
      setResult({ error: 'Failed to get coaching' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Calling System</h1>
          <p className="text-gray-600 mt-2">Automated call scripts, analysis, and real-time coaching</p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveFeature('script')}
            className={`p-6 bg-white rounded-xl shadow-lg cursor-pointer border-2 transition-all ${
              activeFeature === 'script' ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <Phone className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Call Script Generation</h3>
            <p className="text-sm text-gray-600">AI generates personalized call scripts based on lead data</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveFeature('analysis')}
            className={`p-6 bg-white rounded-xl shadow-lg cursor-pointer border-2 transition-all ${
              activeFeature === 'analysis' ? 'border-green-500' : 'border-gray-200'
            }`}
          >
            <BarChart3 className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Call Analysis</h3>
            <p className="text-sm text-gray-600">Analyze call transcripts for sentiment and insights</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveFeature('followup')}
            className={`p-6 bg-white rounded-xl shadow-lg cursor-pointer border-2 transition-all ${
              activeFeature === 'followup' ? 'border-purple-500' : 'border-gray-200'
            }`}
          >
            <Mail className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Follow-up Generation</h3>
            <p className="text-sm text-gray-600">Auto-generate email/SMS follow-ups after calls</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveFeature('coaching')}
            className={`p-6 bg-white rounded-xl shadow-lg cursor-pointer border-2 transition-all ${
              activeFeature === 'coaching' ? 'border-orange-500' : 'border-gray-200'
            }`}
          >
            <Activity className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Real-time Coaching</h3>
            <p className="text-sm text-gray-600">Live suggestions during sales calls</p>
          </motion.div>
        </div>

        {/* Feature Forms */}
        {activeFeature && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            {activeFeature === 'script' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Generate Call Script</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Name</label>
                    <input
                      type="text"
                      value={scriptForm.leadName}
                      onChange={(e) => setScriptForm({ ...scriptForm, leadName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={scriptForm.company}
                      onChange={(e) => setScriptForm({ ...scriptForm, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={scriptForm.role}
                      onChange={(e) => setScriptForm({ ...scriptForm, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="CTO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pain Points</label>
                    <textarea
                      value={scriptForm.painPoints}
                      onChange={(e) => setScriptForm({ ...scriptForm, painPoints: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Struggling with manual processes..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Objective</label>
                    <select
                      value={scriptForm.objective}
                      onChange={(e) => setScriptForm({ ...scriptForm, objective: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="discovery">Discovery</option>
                      <option value="demo">Demo</option>
                      <option value="closing">Closing</option>
                      <option value="followup">Follow-up</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateScript}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {loading ? 'Generating...' : 'Generate Script'}
                  </button>
                </div>
              </div>
            )}

            {activeFeature === 'analysis' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Analyze Call</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Call Transcript</label>
                    <textarea
                      value={analysisForm.transcript}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, transcript: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      rows={8}
                      placeholder="Paste call transcript here..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (seconds)</label>
                    <input
                      type="number"
                      value={analysisForm.duration}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="300"
                    />
                  </div>
                  <button
                    onClick={handleAnalyzeCall}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {loading ? 'Analyzing...' : 'Analyze Call'}
                  </button>
                </div>
              </div>
            )}

            {activeFeature === 'followup' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Generate Follow-up</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Name</label>
                    <input
                      type="text"
                      value={followupForm.leadName}
                      onChange={(e) => setFollowupForm({ ...followupForm, leadName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Call Summary</label>
                    <textarea
                      value={followupForm.callSummary}
                      onChange={(e) => setFollowupForm({ ...followupForm, callSummary: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={4}
                      placeholder="Discussed pricing and implementation timeline..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Next Steps</label>
                    <input
                      type="text"
                      value={followupForm.nextSteps}
                      onChange={(e) => setFollowupForm({ ...followupForm, nextSteps: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Schedule demo, send proposal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <select
                      value={followupForm.type}
                      onChange={(e) => setFollowupForm({ ...followupForm, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateFollowup}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {loading ? 'Generating...' : 'Generate Follow-up'}
                  </button>
                </div>
              </div>
            )}

            {activeFeature === 'coaching' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Real-time Coaching</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Phase</label>
                    <select
                      value={coachingForm.currentPhase}
                      onChange={(e) => setCoachingForm({ ...coachingForm, currentPhase: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="introduction">Introduction</option>
                      <option value="discovery">Discovery</option>
                      <option value="presentation">Presentation</option>
                      <option value="objection_handling">Objection Handling</option>
                      <option value="closing">Closing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Conversation Transcript</label>
                    <textarea
                      value={coachingForm.transcript}
                      onChange={(e) => setCoachingForm({ ...coachingForm, transcript: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      rows={6}
                      placeholder="Current conversation..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Response</label>
                    <input
                      type="text"
                      value={coachingForm.leadResponse}
                      onChange={(e) => setCoachingForm({ ...coachingForm, leadResponse: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Latest response from lead..."
                    />
                  </div>
                  <button
                    onClick={handleGetCoaching}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {loading ? 'Getting Suggestions...' : 'Get Coaching'}
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 className="font-bold text-gray-900 mb-3">Result:</h3>
                {result.error ? (
                  <div className="text-red-600">{result.error}</div>
                ) : (
                  <div className="space-y-3">
                    {result.script && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Generated Script:</p>
                        <div className="bg-white p-4 rounded border border-gray-200 whitespace-pre-wrap">{result.script}</div>
                      </div>
                    )}
                    {result.analysis && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Sentiment:</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            result.analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                            result.analysis.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {result.analysis.sentiment}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Key Points:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {result.analysis.keyPoints?.map((point: string, i: number) => (
                              <li key={i} className="text-gray-700">{point}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Recommendations:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {result.analysis.recommendations?.map((rec: string, i: number) => (
                              <li key={i} className="text-gray-700">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {result.followup && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Follow-up Message:</p>
                        <div className="bg-white p-4 rounded border border-gray-200 whitespace-pre-wrap">{result.followup}</div>
                      </div>
                    )}
                    {result.suggestions && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Coaching Suggestions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {result.suggestions.map((suggestion: string, i: number) => (
                            <li key={i} className="text-gray-700">{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AICallingDashboard;
