import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from './config/passport';
import { createReferralHandler } from './sockets/referral';
import { createNotificationHandler } from './sockets/notification';
import { createHRChatHandler } from './sockets/hrChat';
import { startScheduler } from './utils/scheduler';
import { startEscrowCron } from './utils/escrowCron';
import authRoutes from './routes/auth';
import referralRoutes from './routes/referrals';
import referralEnhancedRoutes from './routes/referralEnhanced';
import paymentRoutes from './routes/payments';
import paymentRoute from './routes/payment';
import matchingRoutes from './routes/matching';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import aiJobRoutes from './routes/aiJobs';
import dashboardRoutes from './routes/dashboard';
import walletRoutes from './routes/wallet';
import jobPostingRoutes from './routes/jobPostings';
import escrowRoutes from './routes/escrow';
import chatRoutes from './routes/chat';
import aiResumeRoutes from './routes/aiResume';
import notificationRoutes from './routes/notifications';
import atsRoutes from './routes/ats';
import adminRoutes from './routes/admin';
import passwordRoutes from './routes/password';
import adzunaRoutes from './routes/adzuna';
import apiJobRoutes from './routes/apiJobs';
import subscriptionRoutes from './routes/subscription';
import salesRoutes from './routes/sales';
import productionAIJobRoutes from './routes/productionAIJobs';
import verificationRoutes from './routes/verification';
import aiCallingRoutes from './routes/aiCalling';
import salesScheduler from './services/salesScheduler';
import careerRoutes from './routes/career';
import careerPackRoutes from './routes/careerPacks';
import hrSessionRoutes from './routes/hrSession';
import hrSessions from './routes/hrSessions';
import faqRoutes from './routes/faqs';
import testimonialRoutes from './routes/testimonials';
import referralHRChatRoutes from './routes/referralHRChat';
import companyHRRoutes from './routes/companyHR';
import hrRoutes from './routes/hr';
import companyReferrerRoutes from './routes/companyReferrer';
import enhancedEscrowRoutes from './routes/enhancedEscrow';
import withdrawalRoutes from './routes/withdrawals';
import profileRoutes from './routes/profile';
import resumeParserRoutes from './routes/resumeParser';
import userProfileRoutes from './routes/userProfile';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://refdirectlywebsite.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Disable helmet completely for maximum compatibility
app.disable('x-powered-by');

// Add explicit headers for Safari/Brave/Mobile compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://refdirectlywebsite.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());

// Rate limiting - more lenient for mobile
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());

// Connect to MongoDB with timeout settings
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/production-ai-jobs', productionAIJobRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/referrals-enhanced', referralEnhancedRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', paymentRoute);
app.use('/api/matching', matchingRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai-jobs', aiJobRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/job-postings', jobPostingRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai-resume', aiResumeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai-resume', atsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/adzuna', adzunaRoutes);
app.use('/api/api-jobs', apiJobRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/ai-calling', aiCallingRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/career-packs', careerPackRoutes);
app.use('/api/hr-session', hrSessionRoutes);
app.use('/api/hr-sessions', hrSessions);
app.use('/api/faqs', faqRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/referral-hr-chat', referralHRChatRoutes);
app.use('/api/company-hr', companyHRRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/company', companyReferrerRoutes);
app.use('/api/escrow', enhancedEscrowRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeParserRoutes);
app.use('/api/user-profile', userProfileRoutes);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/ping', (req, res) => {
  res.status(200).send('pong'); // just a simple response
});
// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  createReferralHandler(io, socket);
  createNotificationHandler(io, socket);
  createHRChatHandler(io, socket);
  
  // WebRTC call signaling
  socket.on('call-request', ({ roomId, isVideo }) => {
    console.log(`📞 Call request in room ${roomId}, video: ${isVideo}, from socket: ${socket.id}`);
    const room = io.sockets.adapter.rooms.get(roomId);
    console.log(`📍 Room ${roomId} has ${room?.size || 0} participants`);
    
    if (!room || room.size < 2) {
      console.log('❌ Room validation failed');
      socket.emit('call-failed', { reason: 'User not in room' });
      return;
    }
    
    console.log('✅ Broadcasting incoming-call to room');
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
    console.log(`📤 Relaying offer to room ${roomId}`);
    socket.to(roomId).emit('offer', { offer });
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`📤 Relaying answer to room ${roomId}`);
    socket.to(roomId).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  socket.on('end-call', ({ roomId }) => {
    console.log(`📴 Call ended in room ${roomId}`);
    socket.to(roomId).emit('call-ended');
  });
  
  // Generic chat handlers for referral HR chat
  socket.on('join_chat', (chatId: string) => {
    socket.join(`chat:${chatId}`);
    console.log(`Socket ${socket.id} joined chat:${chatId}`);
  });

  socket.on('leave_chat', (chatId: string) => {
    socket.leave(`chat:${chatId}`);
    console.log(`Socket ${socket.id} left chat:${chatId}`);
  });

  socket.on('send_message', (data: { chatId: string; message: any }) => {
    socket.to(`chat:${data.chatId}`).emit('new_message', data.message);
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

export { io };

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  startScheduler();
  startEscrowCron();
  salesScheduler.startAll();
});