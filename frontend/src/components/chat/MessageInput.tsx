import React, { useState, useRef } from 'react';
import { Smile, Paperclip, Send, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageInputProps {
  onSend: (text: string, file?: File) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙌', '👏', '💪', '🚀', '⭐', '✅', '💼', '📝', '📧', '📞', '💡', '🎯'];

  const handleSend = () => {
    if ((!inputText.trim() && !selectedFile) || disabled) return;
    
    onSend(inputText.trim() || `Sent ${selectedFile?.name}`, selectedFile || undefined);
    setInputText('');
    setSelectedFile(null);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      {/* File Preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 flex items-center gap-3 bg-gray-100 rounded-xl p-3"
          >
            {selectedFile.type.startsWith('image/') ? (
              <ImageIcon className="h-5 w-5 text-purple-500" />
            ) : (
              <Paperclip className="h-5 w-5 text-purple-500" />
            )}
            <span className="text-sm text-gray-700 flex-1 truncate font-medium">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {/* Emoji Picker Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Smile className="h-5 w-5 text-gray-500" />
        </button>

        {/* Attachment Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />

        {/* Emoji Picker Popup */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-20 left-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 grid grid-cols-5 gap-2 z-10"
            >
              {emojis.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-gray-50 rounded-lg"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Field */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-200 hover:border-gray-300 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Message..."
            disabled={disabled}
            className="w-full px-4 py-2 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!inputText.trim() && !selectedFile) || disabled}
          className="text-sm font-semibold text-purple-500 hover:text-purple-600 disabled:text-gray-300 transition-colors px-3"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
