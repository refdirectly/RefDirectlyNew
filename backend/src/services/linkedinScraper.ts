import axios from 'axios';

interface LinkedInJob {
  title: string;
  company: string;
  location: string;
  description: string;
  applyUrl: string;
}

// Bright Data LinkedIn Job Scraper
export const fetchLinkedInJobsBrightData = async (jobUrls: string[]) => {
  try {
    const data = {
      input: jobUrls.map(url => ({ url }))
    };

    const response = await axios.post(
      `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${process.env.BRIGHTDATA_DATASET_ID || 'gd_lpfll7v5hcqtkxl6l'}&notify=false&include_errors=true`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${process.env.BRIGHTDATA_API_KEY || '172ff4bb-aab7-4181-aebb-bae76aa5c558'}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Bright Data response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Bright Data error:', error.message);
    throw error;
  }
};

// Search LinkedIn jobs and get URLs
export const searchLinkedInJobs = async (query: string, location: string = 'United States', limit: number = 10) => {
  try {
    // Use JSearch to find LinkedIn job URLs
    const jsearchJobs = await fetchJobsJsearch(query, location, 1);
    
    // Filter only LinkedIn jobs
    const linkedinJobs = jsearchJobs.filter((job: any) => 
      job.job_apply_link?.includes('linkedin.com') || 
      job.job_google_link?.includes('linkedin.com')
    ).slice(0, limit);

    if (linkedinJobs.length === 0) {
      console.log('⚠️ No LinkedIn jobs found, returning all jobs');
      return jsearchJobs.slice(0, limit);
    }

    console.log(`✅ Found ${linkedinJobs.length} LinkedIn jobs`);
    
    // Extract LinkedIn URLs
    const linkedinUrls = linkedinJobs.map((job: any) => 
      job.job_apply_link?.includes('linkedin.com') ? job.job_apply_link : job.job_google_link
    ).filter(Boolean);

    // Scrape detailed data from Bright Data
    if (linkedinUrls.length > 0) {
      const detailedJobs = await fetchLinkedInJobsBrightData(linkedinUrls);
      return detailedJobs;
    }

    return linkedinJobs;
  } catch (error: any) {
    console.error('❌ LinkedIn search error:', error.message);
    return [];
  }
};

// RapidAPI LinkedIn Active Jobs API
export const fetchLinkedInJobs = async (keywords: string, location: string = '', limit: number = 20) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-1h',
      params: {
        offset: '0',
        description_type: 'text'
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_LINKEDIN_KEY || '7fa0f86964msh5e3200527f84e4cp1bde09jsn06eb6c8e7e3c',
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    return response.data || [];
  } catch (error: any) {
    console.error('LinkedIn Active Jobs API error:', error.message);
    throw error;
  }
};

// LinkedIn Active Jobs API
export const fetchLinkedInActiveJobs = async (offset: number = 0) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-1h',
      params: {
        offset: offset.toString(),
        description_type: 'text'
      },
      headers: {
        'x-rapidapi-key': '7fa0f86964msh5e3200527f84e4cp1bde09jsn06eb6c8e7e3c',
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    return response.data || [];
  } catch (error: any) {
    console.error('LinkedIn Active Jobs API error:', error.message);
    return [];
  }
};

// Jobs Search API (RapidAPI)
export const fetchJobsSearchAPI = async (query: string, location: string = 'United States', limit: number = 20) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://jobs-search-api.p.rapidapi.com/getjobs',
      params: {
        query: `${query} in ${location}`,
        limit: limit.toString()
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_LINKEDIN_KEY || '7fa0f86964msh5e3200527f84e4cp1bde09jsn06eb6c8e7e3c',
        'x-rapidapi-host': 'jobs-search-api.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    return response.data || [];
  } catch (error: any) {
    console.error('Jobs Search API error:', error.message);
    return [];
  }
};

// Alternative: Jsearch API (also on RapidAPI)
export const fetchJobsJsearch = async (query: string, location: string = 'United States', numPages: number = 1) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: `${query} in ${location}`,
        page: '1',
        num_pages: numPages.toString(),
        date_posted: 'week' // Get recent jobs only
      },
      headers: {
        'x-rapidapi-key': '89272c2483mshd4bb70ee0ab1149p1ab30ajsn3c71ca866503',
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    if (typeof response.data === 'string') {
      console.error('API returned string:', response.data);
      throw new Error('API returned invalid format');
    }
    
    if (!response.data || !response.data.data) {
      console.error('API response:', response.data);
      return [];
    }
    
    // JSearch returns jobs with these fields:
    // job_id, job_title, employer_name, employer_logo
    // job_apply_link (direct apply URL)
    // job_google_link (Google Jobs URL)
    // job_city, job_state, job_country
    // job_employment_type, job_description
    // job_posted_at_datetime_utc
    
    const jobs = response.data.data.map((job: any) => ({
      ...job,
      // Ensure we have a valid apply URL
      job_url: job.job_apply_link || job.job_google_link || `https://www.google.com/search?q=${encodeURIComponent(job.job_title + ' ' + job.employer_name + ' job')}`
    }));
    
    console.log(`✅ Fetched ${jobs.length} jobs from JSearch`);
    console.log(`Sample job URLs:`, jobs.slice(0, 3).map((j: any) => ({
      title: j.job_title,
      company: j.employer_name,
      apply_url: j.job_apply_link,
      google_url: j.job_google_link
    })));
    
    return jobs;
  } catch (error: any) {
    console.error('Jsearch API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return [];
  }
};

// Scrape without API (basic web scraping - may break if LinkedIn changes)
export const scrapeLinkedInBasic = async (keywords: string) => {
  // Note: LinkedIn blocks most scrapers, use official API or RapidAPI instead
  const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}`;
  
  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Basic parsing - LinkedIn will likely block this
    return response.data;
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('LinkedIn scraping blocked. Use official API instead.');
  }
};
