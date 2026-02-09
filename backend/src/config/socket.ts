import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import notificationService from '../services/notificationService';

export const setupSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // JWT Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;

    console.log(`✅ User connected: ${userId} (${role})`);

    // Join user-specific room
    socket.join(`user:${userId}`);
    
    // Join role-specific room for broadcasts
    socket.join(`role:${role}`);
    
    // Track online users
    socket.data.online = true;

    // Send current unread count
    notificationService.getUnreadCount(userId, role).then(count => {
      socket.emit('notification:count', count);
    });

    // Handle notification read events
    socket.on('notification:read', async (notificationId: string) => {
      await notificationService.markAsRead(notificationId, userId);
    });

    // Check if user is online in a room
    socket.on('check-user-online', async ({ roomId }, callback) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room || room.size < 2) {
        callback({ online: false });
        return;
      }
      
      // Check if other user in room is actually online
      const socketsInRoom = await io.in(roomId).fetchSockets();
      const otherSocket = socketsInRoom.find(s => s.id !== socket.id);
      
      callback({ 
        online: !!otherSocket && otherSocket.data.online,
        userId: otherSocket?.data.userId 
      });
    });

    // WebRTC signaling for video/voice calls
    socket.on('call-request', ({ roomId, isVideo }) => {
      console.log(`📞 Call request in room ${roomId}, video: ${isVideo}`);
      const room = io.sockets.adapter.rooms.get(roomId);
      
      if (!room || room.size < 2) {
        socket.emit('call-failed', { reason: 'User not in room' });
        return;
      }
      
      socket.to(roomId).emit('incoming-call', { isVideo });
    });

    socket.on('call-accepted', ({ roomId }) => {
      console.log(`✅ Call accepted in room ${roomId}`);
      socket.to(roomId).emit('call-accepted');
    });

    socket.on('call-rejected', ({ roomId }) => {
      console.log(`❌ Call rejected in room ${roomId}`);
      socket.to(roomId).emit('call-rejected');
    });

    socket.on('offer', ({ roomId, offer }) => {
      console.log(`📤 Sending offer to room ${roomId}`);
      socket.to(roomId).emit('offer', { offer });
    });

    socket.on('answer', ({ roomId, answer }) => {
      console.log(`📤 Sending answer to room ${roomId}`);
      socket.to(roomId).emit('answer', { answer });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate });
    });

    socket.on('end-call', ({ roomId }) => {
      console.log(`📴 Call ended in room ${roomId}`);
      socket.to(roomId).emit('call-ended');
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId}`);
      socket.data.online = false;
    });
  });

  // Set socket server in notification service
  notificationService.setSocketServer(io);

  return io;
};
