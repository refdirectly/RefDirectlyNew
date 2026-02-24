import { Request, Response } from 'express';
import { parseResume } from '../services/resumeParserService';
import Profile from '../models/Profile';

export const uploadAndParseResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, mimetype, originalname } = req.file;
    const userId = (req as any).user.id;
    console.log('Parsing resume:', { mimetype, size: buffer.length });
    
    const parsedData = await parseResume(buffer, mimetype);
    console.log('Parsed data:', JSON.stringify(parsedData, null, 2));

    // Store resume file as base64
    const resumeBase64 = buffer.toString('base64');
    const resumeUrl = `data:${mimetype};base64,${resumeBase64}`;

    // Update profile with resume URL
    await Profile.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          'documents.resumeUrl': resumeUrl,
          'documents.resumeName': originalname
        }
      },
      { upsert: true }
    );

    res.json({ 
      success: true, 
      data: parsedData,
      resumeUrl,
      fileName: originalname
    });
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to parse resume', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
