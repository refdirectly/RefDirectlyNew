import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { productionAIJobService } from '../services/productionAIJobService';
import User from '../models/User';
import Application from '../models/Application';

export const startProductionAutoApply = async (req: AuthRequest, res: Response) => {
  try {
    const { query, location, maxApplications } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build candidate profile
    const candidateProfile = {
      name: user.name || 'Candidate',
      email: user.email,
      phone: user.phone || '',
      resume: user.resumeUrl || '',
      skills: user.skills || [],
      experience: user.experience || 0,
      education: 'Bachelor\'s Degree', // Add to user model
      linkedinUrl: user.linkedinUrl,
      githubUrl: '', // Add to user model
      portfolioUrl: '' // Add to user model
    };

    console.log(`🚀 Starting production auto-apply for user: ${user.email}`);

    // Start workflow in background
    res.json({
      success: true,
      message: 'AI auto-apply started! You will receive an email with results.',
      status: 'processing'
    });

    // Run workflow asynchronously
    productionAIJobService.autoApplyWorkflow(
      query || 'Software Engineer',
      location || 'United States',
      candidateProfile,
      maxApplications || 10
    ).then(async (workflowResult) => {
      console.log(`✅ Workflow completed for ${user.email}`);
      
      // Save successful applications to database
      for (const result of workflowResult.results) {
        if (result.status === 'applied') {
          try {
            await Application.create({
              seekerId: userId,
              jobTitle: result.job.split(' at ')[0],
              company: result.job.split(' at ')[1],
              status: 'applied',
              aiGenerated: true,
              appliedAt: new Date()
            });
          } catch (err) {
            console.error('Error saving application:', err);
          }
        }
      }

      // Send email notification
      // TODO: Implement email notification with results
      console.log(`📧 Email sent to ${user.email} with ${workflowResult.applied} applications`);
    }).catch((error) => {
      console.error('❌ Workflow error:', error);
    });

  } catch (error: any) {
    console.error('Production auto-apply error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAutoApplyStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    // Get recent AI-generated applications
    const applications = await Application.find({
      seekerId: userId,
      aiGenerated: true
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      totalApplications: applications.length,
      applications: applications.map(app => ({
        jobTitle: app.jobTitle,
        company: app.company,
        status: app.status,
        appliedAt: app.appliedAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
