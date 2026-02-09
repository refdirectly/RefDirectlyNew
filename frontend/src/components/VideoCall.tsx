import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  roomId: string;
  socket: any;
  onClose: () => void;
  isVideoCall: boolean;
  isInitiator: boolean;
  otherUserName?: string;
  onCallConnected?: () => void;
  onCallFailed?: () => void;
}

export default function VideoCall({ roomId, socket, onClose, isVideoCall, isInitiator, otherUserName = 'User', onCallConnected, onCallFailed }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callStartTimeRef = useRef<number>(0);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    initCall();
    
    // Set connection timeout
    connectionTimeoutRef.current = setTimeout(() => {
      if (callStatus === 'connecting') {
        console.error('⏰ Connection timeout');
        setCallStatus('failed');
        onCallFailed?.();
        alert('Failed to establish connection. Please check your internet and try again.');
        endCall();
      }
    }, 30000); // 30 second timeout
    
    const timer = setInterval(() => {
      if (callStartTimeRef.current > 0) {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }
    }, 1000);
    
    return () => {
      cleanup();
      clearInterval(timer);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  const initCall = async () => {
    try {
      console.log('🎬 Initializing call, isInitiator:', isInitiator);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall ? { width: 1280, height: 720 } : false,
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      
      console.log('✅ Got local media stream');
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      });
      peerConnectionRef.current = pc;
      console.log('✅ Created peer connection');

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
        console.log('➕ Added track:', track.kind);
      });

      pc.ontrack = (event) => {
        console.log('📺 Remote track received');
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setCallStatus('connected');
        callStartTimeRef.current = Date.now();
        onCallConnected?.();
        
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('📤 Sending ICE candidate');
          socket.emit('ice-candidate', { roomId, candidate: event.candidate });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('🔌 Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setCallStatus('connected');
          callStartTimeRef.current = Date.now();
          onCallConnected?.();
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.error('❌ Connection failed/disconnected');
          setCallStatus('failed');
          onCallFailed?.();
          setTimeout(() => endCall(), 2000);
        }
      };

      // Set up socket listeners BEFORE creating/waiting for offer
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('call-ended');
      
      socket.on('offer', async (data: { offer: RTCSessionDescriptionInit }) => {
        try {
          console.log('📥 Received offer, creating answer');
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log('📤 Sending answer');
          socket.emit('answer', { roomId, answer });
        } catch (err) {
          console.error('❌ Error handling offer:', err);
        }
      });

      socket.on('answer', async (data: { answer: RTCSessionDescriptionInit }) => {
        try {
          console.log('📥 Received answer, setting remote description');
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('✅ Remote description set');
        } catch (err) {
          console.error('❌ Error handling answer:', err);
        }
      });

      socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
        try {
          console.log('📥 Received ICE candidate');
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('❌ Error adding ICE candidate:', err);
        }
      });

      socket.on('call-ended', () => {
        console.log('📴 Call ended by other user');
        endCall();
      });

      // Now create offer if initiator
      if (isInitiator) {
        console.log('📤 Creating and sending offer as initiator');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('📤 Emitting offer to room:', roomId);
        socket.emit('offer', { roomId, offer });
        console.log('✅ Offer sent');
      } else {
        console.log('⏳ Waiting for offer from initiator');
      }
    } catch (err: any) {
      console.error('❌ Call init error:', err);
      setCallStatus('failed');
      alert(err.name === 'NotAllowedError' 
        ? 'Camera/microphone access denied. Please allow permissions.' 
        : 'Failed to start call. Please check your devices.');
      onClose();
    }
  };

  const cleanup = () => {
    localStream?.getTracks().forEach(track => track.stop());
    peerConnectionRef.current?.close();
    socket.off('offer');
    socket.off('answer');
    socket.off('ice-candidate');
    socket.off('call-ended');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream && isVideoCall) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const endCall = () => {
    cleanup();
    socket.emit('end-call', { roomId });
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50 flex flex-col"
    >
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              {otherUserName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{otherUserName}</h3>
              <div className="flex items-center gap-2">
                {callStatus === 'connecting' && (
                  <span className="text-yellow-400 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Connecting...
                  </span>
                )}
                {callStatus === 'connected' && (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {formatDuration(callDuration)}
                  </span>
                )}
                {callStatus === 'failed' && (
                  <span className="text-red-400 text-sm">Connection failed</span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={endCall}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {isVideoCall ? (
          <>
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center text-5xl font-bold text-white">
                    {otherUserName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white text-lg">Waiting for {otherUserName}...</p>
                </div>
              </div>
            )}
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute bottom-24 right-6 w-48 h-36 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl"
            >
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff className="text-white" size={32} />
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black">
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-6 flex items-center justify-center text-6xl font-bold text-white shadow-2xl"
              >
                {otherUserName.charAt(0).toUpperCase()}
              </motion.div>
              <p className="text-white text-2xl font-semibold mb-2">{otherUserName}</p>
              <p className="text-white/60">Voice Call</p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
        <div className="flex justify-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute} 
            className={`p-5 rounded-full transition-all shadow-lg ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/20 backdrop-blur-md hover:bg-white/30'
            } text-white`}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </motion.button>
          
          {isVideoCall && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVideo} 
              className={`p-5 rounded-full transition-all shadow-lg ${
                isVideoOff 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/20 backdrop-blur-md hover:bg-white/30'
              } text-white`}
            >
              {isVideoOff ? <VideoOff size={28} /> : <VideoIcon size={28} />}
            </motion.button>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={endCall} 
            className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all"
          >
            <PhoneOff size={28} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
