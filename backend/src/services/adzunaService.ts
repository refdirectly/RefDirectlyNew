import axios from 'axios';
import Job from '../models/Job';
import User from '../models/User';

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  created: string;
}

export const fetchAdzunaJobs = async (keywords: string = 'software engineer', location: string = 'in', page: number = 1) => {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      throw new Error('Adzuna API credentials not configured');
    }

    // Normalize location to country code - prioritize India
    let countryCode = 'in'; // Default to India
    let whereParam = undefined; // For city-specific searches
    const locationLower = location.toLowerCase();
    
    // Check if it's a city in India
    const indianCities = ['bangalore', 'bengaluru', 'mumbai', 'delhi', 'gurgaon', 'gurugram', 'hyderabad', 'pune', 'chennai', 'kolkata', 'noida', 'ahmedabad', 'jaipur', 'chandigarh'];
    const isIndianCity = indianCities.some(city => locationLower.includes(city));
    
    if (isIndianCity || locationLower.includes('india') || locationLower === 'in') {
      countryCode = 'in';
      if (isIndianCity) {
        whereParam = location; // Use city name for filtering
      }
    } else if (locationLower.includes('united states') || locationLower === 'us') {
      countryCode = 'us';
    } else if (locationLower.includes('united kingdom') || locationLower === 'gb' || locationLower === 'uk') {
      countryCode = 'gb';
    } else if (locationLower.includes('canada') || locationLower === 'ca') {
      countryCode = 'ca';
    } else if (locationLower.includes('australia') || locationLower === 'au') {
      countryCode = 'au';
    }

    const params: any = {
      app_id: appId,
      app_key: appKey,
      what: keywords,
      results_per_page: 50,
      sort_by: 'date'
    };
    
    if (whereParam) {
      params.where = whereParam;
    }

    // Fetch single page
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}`,
      { params, timeout: 10000 }
    );

    const jobs = response.data.results || [];
    const totalCount = response.data.count || 0;
    const processedJobs = [];

    for (const job of jobs) {
      const companyName = job.company.display_name;
      
      // Skip jobs without company name
      if (!companyName || !job.title) continue;
      
      // Count verified referrers for this company
      const referrerCount = await User.countDocuments({
        role: 'referrer',
        verified: true,
        'companies.name': { $regex: new RegExp(`^${companyName}$`, 'i') },
        'companies.verified': true
      });

      // Save or update job in database
      const jobData = {
        title: job.title,
        company: companyName,
        location: job.location.display_name,
        description: job.description.substring(0, 500),
        salary: job.salary_min && job.salary_max 
          ? `₹${job.salary_min.toLocaleString('en-IN')} - ₹${job.salary_max.toLocaleString('en-IN')}`
          : 'Not specified',
        applyUrl: job.redirect_url,
        source: 'adzuna',
        externalId: job.id,
        postedDate: new Date(job.created),
        availableReferrers: referrerCount,
        status: 'active'
      };

      const savedJob = await Job.findOneAndUpdate(
        { externalId: job.id, source: 'adzuna' },
        jobData,
        { upsert: true, new: true }
      );

      processedJobs.push({
        ...savedJob.toObject(),
        availableReferrers: referrerCount
      });
    }

    return {
      success: true,
      count: processedJobs.length,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / 50),
      jobs: processedJobs
    };
  } catch (error: any) {
    console.error('Adzuna API error:', error.response?.data || error.message);
    throw new Error(`Adzuna API failed: ${error.response?.status || error.message}`);
  }
};

export const getJobWithReferrers = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // Get verified referrers for this company
  const referrers = await User.find({
    role: 'referrer',
    verified: true,
    'companies.name': { $regex: new RegExp(`^${job.company}$`, 'i') },
    'companies.verified': true
  }).select('name email companies rating pricePerReferral');

  return {
    job,
    availableReferrers: referrers.length,
    referrers
  };
};
