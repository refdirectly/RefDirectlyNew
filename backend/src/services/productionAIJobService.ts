import axios from 'axios';
import Groq from 'groq-sdk';

interface JobData {
  job_title: string;
  company: string;
  location: string;
  apply_url: string;
  job_description: string;
  requirements?: string;
  salary?: string;
  employment_type?: string;
}

interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  resume: string;
  skills: string[];
  experience: number;
  education: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

interface AIDecision {
  shouldApply: boolean;
  matchScore: number;
  reasoning: string;
  tailoredCoverLetter: string;
  keyPoints: string[];
}

export class ProductionAIJobService {
  private groq: Groq;
  private brightDataApiKey: string;
  private brightDataBrowserZone: string;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.brightDataApiKey = process.env.BRIGHTDATA_API_KEY || '172ff4bb-aab7-4181-aebb-bae76aa5c558';
    this.brightDataBrowserZone = process.env.BRIGHTDATA_BROWSER_ZONE || 'your-browser-zone';
  }

  // Step 1: Scrape jobs using Bright Data Web Scraper API
  async scrapeJobs(query: string, location: string, limit: number = 50): Promise<JobData[]> {
    try {
      console.log(`🔍 Scraping jobs: ${query} in ${location}`);

      // Use Bright Data's LinkedIn/Indeed/Glassdoor scrapers
      const response = await axios.post(
        'https://api.brightdata.com/datasets/v3/trigger',
        {
          dataset_id: 'gd_lpfll7v5hcqtkxl6l', // LinkedIn jobs dataset
          discover_by: [
            {
              keyword: query,
              location: location,
              limit: limit
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.brightDataApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const snapshotId = response.data.snapshot_id;
      console.log(`📸 Snapshot created: ${snapshotId}`);

      // Poll for results
      let jobs: JobData[] = [];
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const resultResponse = await axios.get(
          `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}`,
          {
            headers: { 'Authorization': `Bearer ${this.brightDataApiKey}` }
          }
        );

        if (resultResponse.data.status === 'ready') {
          jobs = resultResponse.data.data.map((job: any) => ({
            job_title: job.title || job.job_title,
            company: job.company || job.employer_name,
            location: job.location || `${job.city}, ${job.state}`,
            apply_url: job.apply_url || job.job_apply_link,
            job_description: job.description || job.job_description,
            requirements: job.requirements,
            salary: job.salary,
            employment_type: job.employment_type
          }));
          break;
        }
      }

      console.log(`✅ Scraped ${jobs.length} jobs`);
      return jobs;
    } catch (error: any) {
      console.error('❌ Scraping error:', error.message);
      return [];
    }
  }

  // Step 2: AI Decision Layer - Match jobs with candidate
  async analyzeJobMatch(job: JobData, candidate: CandidateProfile): Promise<AIDecision> {
    try {
      const prompt = `
You are an expert career advisor and job matching AI. Analyze if this candidate should apply to this job.

JOB:
Title: ${job.job_title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.job_description}
Requirements: ${job.requirements || 'Not specified'}

CANDIDATE:
Name: ${candidate.name}
Skills: ${candidate.skills.join(', ')}
Experience: ${candidate.experience} years
Education: ${candidate.education}
Resume Summary: ${candidate.resume.substring(0, 500)}

TASK:
1. Calculate match score (0-100)
2. Decide if candidate should apply (score >= 70)
3. Provide reasoning
4. Generate a tailored cover letter (max 300 words)
5. List 3 key points to highlight

Respond in JSON format:
{
  "shouldApply": boolean,
  "matchScore": number,
  "reasoning": "string",
  "tailoredCoverLetter": "string",
  "keyPoints": ["point1", "point2", "point3"]
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const decision: AIDecision = JSON.parse(response);

      console.log(`🤖 AI Decision: ${decision.shouldApply ? '✅ APPLY' : '❌ SKIP'} (Score: ${decision.matchScore})`);
      return decision;
    } catch (error: any) {
      console.error('❌ AI analysis error:', error.message);
      return {
        shouldApply: false,
        matchScore: 0,
        reasoning: 'Error analyzing job',
        tailoredCoverLetter: '',
        keyPoints: []
      };
    }
  }

  // Step 3: Generate AI answers for application questions
  async generateApplicationAnswers(questions: string[], job: JobData, candidate: CandidateProfile): Promise<Record<string, string>> {
    try {
      const prompt = `
You are filling out a job application for:
Job: ${job.job_title} at ${job.company}

Candidate Profile:
${JSON.stringify(candidate, null, 2)}

Answer these application questions professionally and concisely:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Respond in JSON format:
{
  "answer1": "...",
  "answer2": "...",
  ...
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(response);
    } catch (error: any) {
      console.error('❌ Answer generation error:', error.message);
      return {};
    }
  }

  // Step 4: Apply using Bright Data Browser API
  async applyToJobWithBrowser(
    job: JobData,
    candidate: CandidateProfile,
    coverLetter: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🌐 Opening browser for: ${job.job_title} at ${job.company}`);

      // Bright Data Browser API automation script
      const automationScript = `
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'wss://brd-customer-${this.brightDataBrowserZone}:${this.brightDataApiKey}@brd.superproxy.io:9222'
  });

  const page = await browser.newPage();
  
  try {
    // Navigate to job application
    await page.goto('${job.apply_url}', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Fill name
    const nameSelectors = ['input[name*="name"]', 'input[id*="name"]', 'input[placeholder*="name"]'];
    for (const selector of nameSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.type('${candidate.name}');
        break;
      }
    }

    // Fill email
    const emailSelectors = ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]'];
    for (const selector of emailSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.type('${candidate.email}');
        break;
      }
    }

    // Fill phone
    const phoneSelectors = ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]'];
    for (const selector of phoneSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.type('${candidate.phone}');
        break;
      }
    }

    // Fill cover letter
    const coverLetterSelectors = ['textarea[name*="cover"]', 'textarea[id*="cover"]', 'textarea'];
    for (const selector of coverLetterSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.type(\`${coverLetter.replace(/`/g, '\\`')}\`);
        break;
      }
    }

    // Upload resume (if file input exists)
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // Note: In production, upload resume file
      console.log('Resume upload field found');
    }

    // Submit application
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Submit")',
      'button:contains("Apply")'
    ];
    
    for (const selector of submitSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Check for success message
    const successIndicators = ['thank you', 'success', 'submitted', 'received'];
    const pageContent = await page.content();
    const success = successIndicators.some(indicator => 
      pageContent.toLowerCase().includes(indicator)
    );

    await browser.close();
    return { success, message: success ? 'Application submitted' : 'Submitted but no confirmation' };
  } catch (error) {
    await browser.close();
    throw error;
  }
})();
`;

      // Execute automation via Bright Data Browser API
      const response = await axios.post(
        'https://api.brightdata.com/browser/v1/execute',
        {
          script: automationScript,
          timeout: 60000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.brightDataApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Application result:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Browser automation error:`, error.message);
      return { success: false, message: error.message };
    }
  }

  // Complete workflow: Scrape → Analyze → Apply
  async autoApplyWorkflow(
    query: string,
    location: string,
    candidate: CandidateProfile,
    maxApplications: number = 10
  ): Promise<{
    totalJobs: number;
    analyzed: number;
    applied: number;
    results: Array<{ job: string; status: string; reason: string }>;
  }> {
    console.log(`\n🚀 Starting AI Auto-Apply Workflow`);
    console.log(`Query: ${query} | Location: ${location} | Max: ${maxApplications}\n`);

    // Step 1: Scrape jobs
    const jobs = await this.scrapeJobs(query, location, 50);
    
    const results: Array<{ job: string; status: string; reason: string }> = [];
    let appliedCount = 0;

    // Step 2 & 3: Analyze and apply
    for (const job of jobs) {
      if (appliedCount >= maxApplications) break;

      console.log(`\n📋 Analyzing: ${job.job_title} at ${job.company}`);

      // AI decision
      const decision = await this.analyzeJobMatch(job, candidate);

      if (!decision.shouldApply) {
        results.push({
          job: `${job.job_title} at ${job.company}`,
          status: 'skipped',
          reason: decision.reasoning
        });
        continue;
      }

      // Apply with AI-generated content
      const applicationResult = await this.applyToJobWithBrowser(
        job,
        candidate,
        decision.tailoredCoverLetter
      );

      results.push({
        job: `${job.job_title} at ${job.company}`,
        status: applicationResult.success ? 'applied' : 'failed',
        reason: applicationResult.message
      });

      if (applicationResult.success) {
        appliedCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`\n✅ Workflow Complete!`);
    console.log(`Total Jobs: ${jobs.length}`);
    console.log(`Analyzed: ${results.length}`);
    console.log(`Applied: ${appliedCount}\n`);

    return {
      totalJobs: jobs.length,
      analyzed: results.length,
      applied: appliedCount,
      results
    };
  }
}

export const productionAIJobService = new ProductionAIJobService();
