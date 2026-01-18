import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mic, MicOff, PhoneOff, User, Building2, Send, Loader } from 'lucide-react';

const AICallManager: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [leadName, setLeadName] = useState('');
  const [company, setCompany] = useState('');
  const [callPurpose, setCallPurpose] = useState('discovery');
  const [calling, setCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callSid, setCallSid] = useState('');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [callStatus, setCallStatus] = useState('');

  const initiateCall = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    const callType = (document.querySelector('input[name="callType"]:checked') as HTMLInputElement)?.value;
    const useConversationalAI = callType === 'conversational';

    setCalling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai-calling/make-live-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber,
          leadName: leadName || 'Customer',
          company: company || 'Company',
          callPurpose,
          useConversationalAI
        })
      });

      const data = await response.json();
      
      if (data.callSid) {
        setCallSid(data.callSid);
        setCallActive(true);
        setCallStatus('Calling...');
        setTranscript([`📞 Calling ${phoneNumber}...`]);
        
        // Poll for call status
        pollCallStatus(data.callSid);
      } else {
        alert(data.error || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('Failed to initiate call:', error);
      alert('Failed to initiate call');
    } finally {
      setCalling(false);
    }
  };

  const pollCallStatus = async (sid: string) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai-calling/call-details/${sid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.details) {
          setCallStatus(data.details.status);
          
          if (data.details.status === 'completed' || data.details.status === 'failed') {
            setCallActive(false);
            clearInterval(interval);
            setTranscript(prev => [...prev, `📞 Call ended: ${data.details.status}`]);
          } else if (data.details.status === 'in-progress') {
            setTranscript(prev => {
              if (!prev.includes('🎙️ Call connected! AI is talking...')) {
                return [...prev, '🎙️ Call connected! AI is talking...'];
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Failed to get call status:', error);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const endCall = async () => {
    if (!callSid) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai-calling/end-call/${callSid}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCallActive(false);
      setTranscript(prev => [...prev, '📞 Call ended by user']);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">AI Call Manager</h1>
                <p className="text-purple-100">Make real calls with AI voice assistant</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!callActive ? (
              <div className="space-y-6">
                {/* Call Type Selection */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                  <h3 className="font-bold text-purple-900 mb-3">🎙️ Choose Call Type:</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-purple-300 cursor-pointer hover:bg-purple-50">
                      <input type="radio" name="callType" value="conversational" defaultChecked className="w-4 h-4" />
                      <div>
                        <p className="font-semibold text-purple-900">Conversational AI</p>
                        <p className="text-xs text-purple-600">AI listens & responds naturally</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="callType" value="script" className="w-4 h-4" />
                      <div>
                        <p className="font-semibold text-gray-900">Script + IVR</p>
                        <p className="text-xs text-gray-600">Pre-recorded with button menu</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Call Setup Form */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lead Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Call Purpose
                    </label>
                    <select
                      value={callPurpose}
                      onChange={(e) => setCallPurpose(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="discovery">Discovery Call</option>
                      <option value="demo">Product Demo</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="closing">Closing Call</option>
                    </select>
                  </div>
                </div>

                {/* Call Button */}
                <button
                  onClick={initiateCall}
                  disabled={calling || !phoneNumber}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {calling ? (
                    <>
                      <Loader className="h-6 w-6 animate-spin" />
                      Initiating Call...
                    </>
                  ) : (
                    <>
                      <Phone className="h-6 w-6" />
                      Start AI Call
                    </>
                  )}
                </button>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• AI will call the number and have a natural conversation</li>
                    <li>• The AI adapts based on responses and call purpose</li>
                    <li>• Call is recorded and transcribed automatically</li>
                    <li>• You'll receive a summary and next steps after the call</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Call Display */}
                <div className="text-center py-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="inline-block"
                  >
                    <div className="h-24 w-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="h-12 w-12 text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{leadName || 'Customer'}</h2>
                  <p className="text-gray-600">{phoneNumber}</p>
                  <p className="text-lg font-semibold text-green-600 mt-2">{callStatus}</p>
                </div>

                {/* Live Transcript */}
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Mic className="h-5 w-5 text-purple-600" />
                    Live Transcript
                  </h3>
                  <div className="space-y-2">
                    {transcript.map((line, i) => (
                      <p key={i} className="text-sm text-gray-700">{line}</p>
                    ))}
                  </div>
                </div>

                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-3"
                >
                  <PhoneOff className="h-6 w-6" />
                  End Call
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Calls */}
        {!callActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Calls</h2>
            <p className="text-gray-500 text-center py-8">No recent calls</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AICallManager;
