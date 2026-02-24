import { Request, Response } from 'express';
import { fetchLinkedInJobs, fetchJobsJsearch, fetchJobsSearchAPI } from '../services/linkedinScraper';
import { fetchAdzunaJobs } from '../services/adzunaService';
import Job from '../models/Job';
import User from '../models/User';

export const scrapeAndSaveJobs = async (req: Request, res: Response) => {
  try {
    const { keywords, location, source = 'jsearch' } = req.body;

    let jobs;
    if (source === 'linkedin') {
      jobs = await fetchLinkedInJobs(keywords, location);
    } else {
      jobs = await fetchJobsJsearch(keywords, location);
    }

    const savedJobs = [];
    for (const job of jobs) {
      const newJob = await Job.create({
        title: job.job_title || job.title,
        company: job.employer_name || job.company,
        companyLogo: job.employer_logo || `https://logo.clearbit.com/${(job.employer_name || job.company).toLowerCase().replace(/\s/g, '')}.com`,
        location: job.job_city || job.job_country || job.location || 'Remote',
        type: job.job_employment_type || 'Full-time',
        experience: job.job_required_experience?.required_experience_in_months 
          ? `${Math.floor(job.job_required_experience.required_experience_in_months / 12)}+ years` 
          : '2+ years',
        salary: job.job_salary || job.salary_range,
        description: job.job_description || job.description || 'No description available',
        requirements: job.job_highlights?.Qualifications || [],
        skills: job.job_required_skills || [],
        benefits: job.job_highlights?.Benefits || [],
        referralReward: Math.floor(Math.random() * 2000) + 3000,
        status: 'active'
      });
      savedJobs.push(newJob);
    }

    res.json({ 
      success: true, 
      message: `Scraped and saved ${savedJobs.length} jobs`,
      jobs: savedJobs 
    });
  } catch (error: any) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to scrape jobs' 
    });
  }
};

export const fetchLiveJobs = async (req: Request, res: Response) => {
  const { keywords = 'software engineer', location = 'in', page = '1' } = req.query;
  
  try {
    console.log(`Fetching jobs: keywords="${keywords}", location="${location}", page=${page}`);
    
    // Try Adzuna API first (prioritize India)
    try {
      const result = await fetchAdzunaJobs(keywords as string, location as string, parseInt(page as string));
      console.log(`✅ Adzuna API success: ${result.count} jobs from ${location}, page ${page} of ${result.totalPages}, total: ${result.totalCount}`);
      return res.json(result);
    } catch (adzunaError: any) {
      console.warn('⚠️ Adzuna API failed, falling back to JSearch:', adzunaError.message);
    }
    
    // Fallback to JSearch
    const jobs = await fetchJobsJsearch(keywords as string, location === 'in' ? 'India' : 'United States');
    
    // Add referrer count for each job
    const jobsWithReferrers = await Promise.all(
      jobs.map(async (job: any) => {
        const company = job.employer_name || job.company;
        const referrerCount = await User.countDocuments({
          role: 'referrer',
          verified: true,
          'companies.name': { $regex: new RegExp(`^${company}$`, 'i') },
          'companies.verified': true
        });
        return { ...job, availableReferrers: referrerCount };
      })
    );
    
    console.log(`✅ JSearch fallback success: ${jobsWithReferrers.length} jobs`);
    res.json({ 
      success: true, 
      count: jobsWithReferrers?.length || 0,
      jobs: jobsWithReferrers || [],
      source: 'jsearch'
    });
  } catch (error: any) {
    console.error('❌ All job sources failed:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch jobs from all sources',
      error: error.message
    });
  }
};
