import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import HRSession from '../models/HRSession';
import User from '../models/User';
import { io } from '../server';

export const bookSession = async (req: AuthRequest, res: Response) => {
  try {
    const { hrId, sessionType, scheduledAt, price } = req.body;
    const seekerId = req.user?.userId;

    const session = new HRSession({
      seekerId,
      hrId,
      sessionType,
      scheduledAt,
      price,
      roomId: `hr_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await session.save();

    res.status(201).json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSeekerSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await HRSession.find({ seekerId: req.user?.userId })
      .populate('hrId', 'name email currentCompany currentTitle avatarUrl')
      .sort({ scheduledAt: -1 });

    res.json({ success: true, sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHRSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await HRSession.find({ hrId: req.user?.userId })
      .populate('seekerId', 'name email avatarUrl')
      .sort({ scheduledAt: -1 });

    res.json({ success: true, sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const session = await HRSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.seekerId.toString() !== userId && session.hrId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    session.status = 'in_progress';
    session.startedAt = new Date();
    await session.save();

    io.to(session.roomId!).emit('session_started', { sessionId: session._id });

    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const session = await HRSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.seekerId.toString() !== userId && session.hrId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    session.status = 'completed';
    session.endedAt = new Date();
    if (session.startedAt) {
      session.duration = Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000);
    }
    await session.save();

    io.to(session.roomId!).emit('session_ended', { sessionId: session._id });

    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    const session = await HRSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.seekerId.toString() !== userId && session.hrId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const message = {
      senderId: userId,
      content,
      timestamp: new Date()
    };

    session.messages = session.messages || [];
    session.messages.push(message as any);
    await session.save();

    io.to(session.roomId!).emit('new_message', message);

    res.json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
