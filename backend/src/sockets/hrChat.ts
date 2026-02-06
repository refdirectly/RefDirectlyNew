import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import ReferralChat from '../models/ReferralChat';

export const createHRChatHandler = (io: Server, socket: Socket) => {
  // Join HR chat room
  socket.on('join_hr_chat', async (data: { referralId: string; token: string }) => {
    try {
      const { referralId, token } = data;
      
      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userId = decoded.userId || decoded.id;

      // Verify user is participant
      const chat = await ReferralChat.findOne({ referralId });
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      if (chat.seekerId.toString() !== userId && chat.hrId.toString() !== userId) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      const roomName = `referral_hr_${referralId}`;
      socket.join(roomName);
      
      console.log(`✅ User ${userId} joined HR chat room: ${roomName}`);
      
      // Notify other participant
      socket.to(roomName).emit('user_joined', { userId });
    } catch (error) {
      console.error('Join HR chat error:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Leave HR chat room
  socket.on('leave_hr_chat', (data: { referralId: string }) => {
    const roomName = `referral_hr_${data.referralId}`;
    socket.leave(roomName);
    socket.to(roomName).emit('user_left');
  });

  // Typing indicator
  socket.on('hr_chat_typing', (data: { referralId: string; isTyping: boolean }) => {
    const roomName = `referral_hr_${data.referralId}`;
    socket.to(roomName).emit('hr_chat_typing', { isTyping: data.isTyping });
  });

  // Mark messages as read
  socket.on('mark_hr_chat_read', async (data: { referralId: string; userId: string }) => {
    try {
      const chat = await ReferralChat.findOne({ referralId: data.referralId });
      if (chat) {
        chat.messages.forEach((msg: any) => {
          if (msg.senderId.toString() !== data.userId) {
            msg.read = true;
          }
        });
        await chat.save();
      }
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });
};
