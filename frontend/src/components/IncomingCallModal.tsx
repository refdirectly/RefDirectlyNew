import { motion } from 'framer-motion';
import { Phone, Video, X } from 'lucide-react';

interface IncomingCallModalProps {
  callerName: string;
  isVideo: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({ callerName, isVideo, onAccept, onReject }: IncomingCallModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
          >
            {callerName.charAt(0).toUpperCase()}
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{callerName}</h3>
          <p className="text-gray-600 mb-8">
            Incoming {isVideo ? 'video' : 'voice'} call...
          </p>
          
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReject}
              className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors"
            >
              <X size={28} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              className="p-5 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-colors"
            >
              {isVideo ? <Video size={28} /> : <Phone size={28} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
