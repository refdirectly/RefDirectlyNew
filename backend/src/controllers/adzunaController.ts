import { Request, Response } from 'express';
import { fetchAdzunaJobs, getJobWithReferrers } from '../services/adzunaService';
import Job from '../models/Job';

export const syncAdzunaJobs = async (req: Request, res: Response) => {
  try {
    const { keywords, location } = req.query;
    
    const result = await fetchAdzunaJobs(
      keywords as string || 'software engineer',
      location as string || 'us'
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getJobsWithReferrers = async (req: Request, res: Response) => {
  try {
    const { search, company, minReferrers } = req.query;
    
    const query: any = { status: 'active' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    let jobs = await Job.find(query)
      .sort({ postedDate: -1, createdAt: -1 })
      .limit(50);

    // Filter by minimum referrers if specified
    if (minReferrers) {
      jobs = jobs.filter(job => (job.availableReferrers || 0) >= parseInt(minReferrers as string));
    }

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getJobDetails = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const result = await getJobWithReferrers(jobId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(404).json({ 
      success: false, 
      error: error.message 
    });
  }
};
