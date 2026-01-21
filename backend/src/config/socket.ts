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

    // Send current unread count
    notificationService.getUnreadCount(userId, role).then(count => {
      socket.emit('unread_count', count);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId}`);
    });
  });

  // Set socket server in notification service
  notificationService.setSocketServer(io);

  return io;
};
