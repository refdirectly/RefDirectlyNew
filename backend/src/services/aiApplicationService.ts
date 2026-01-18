import { chromium, Browser, Page } from 'playwright';
import nodemailer from 'nodemailer';
import Groq from 'groq-sdk';

interface ApplicationResult {
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'success' | 'failed' | 'partial';
  submittedAt?: Date;
  error?: string;
  screenshotPath?: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  resumePath?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  currentCompany?: string;
  currentTitle?: string;
  skills?: string[];
  coverLetter?: string;
}

export class AIApplicationService {
  private browser: Browser | null = null;
  private emailTransporter: any;
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  async initialize() {
    if (this.browser) return;
    
    this.browser = await chromium.launch({
      headless: true, // Changed to true for production
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
  }

  async applyToJob(jobUrl: string, profile: UserProfile): Promise<ApplicationResult> {
    if (!this.browser) await this.initialize();
    
    const page = await this.browser!.newPage();
    
    try {
      console.log(`🔍 Navigating to: ${jobUrl}`);
      
      // Faster navigation with shorter timeout
      await page.goto(jobUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      await page.waitForTimeout(2000);

      // Detect platform and apply
      if (jobUrl.includes('linkedin.com')) {
        return await this.applyLinkedIn(page, jobUrl, profile);
      } else if (jobUrl.includes('indeed.com')) {
        return await this.applyIndeed(page, jobUrl, profile);
      } else if (jobUrl.includes('greenhouse.io')) {
        return await this.applyGreenhouse(page, jobUrl, profile);
      } else if (jobUrl.includes('lever.co')) {
        return await this.applyLever(page, jobUrl, profile);
      } else if (jobUrl.includes('workday.com')) {
        return await this.applyWorkday(page, jobUrl, profile);
      } else if (jobUrl.includes('ziprecruiter.com') || jobUrl.includes('dice.com') || jobUrl.includes('jobgether.com')) {
        // Skip aggregator sites - they redirect and cause timeouts
        return {
          jobId: jobUrl,
          jobTitle: await this.extractJobTitle(page),
          company: await this.extractCompany(page),
          status: 'failed',
          error: 'Job aggregator site - please apply directly on company website'
        };
      } else {
        return await this.applyGeneric(page, jobUrl, profile);
      }
    } catch (error: any) {
      console.error('❌ Application error:', error.message);
      return {
        jobId: '',
        jobTitle: 'Unknown',
        company: 'Unknown',
        status: 'failed',
        error: error.message.substring(0, 100)
      };
    } finally {
      await page.close();
    }
  }

  private async applyLinkedIn(page: Page, jobUrl: string, profile: UserProfile): Promise<ApplicationResult> {
    try {
      // Wait for Easy Apply button
      const easyApplyBtn = page.locator('button.jobs-apply-button, button:has-text("Easy Apply")').first();
      
      if (await easyApplyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await easyApplyBtn.click();
        await page.waitForTimeout(2000);

        // Fill multi-step form
        let step = 0;
        while (step < 10) {
          await this.fillLinkedInFormStep(page, profile);
          
          // Check for submit button
          const submitBtn = page.locator('button:has-text("Submit application"), button[aria-label*="Submit"]').first();
          if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await submitBtn.click();
            await page.waitForTimeout(3000);
            
            // Verify submission
            const successMsg = await page.locator('text=/application.*submitted|thank you/i').isVisible({ timeout: 5000 }).catch(() => false);
            
            return {
              jobId: jobUrl,
              jobTitle: await this.extractJobTitle(page),
              company: await this.extractCompany(page),
              status: successMsg ? 'success' : 'partial',
              submittedAt: new Date()
            };
          }

          // Click Next/Continue
          const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Review")').first();
          if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextBtn.click();
            await page.waitForTimeout(1500);
            step++;
          } else {
            break;
          }
        }
      }

      return {
        jobId: jobUrl,
        jobTitle: await this.extractJobTitle(page),
        company: await this.extractCompany(page),
        status: 'failed',
        error: 'Could not complete application'
      };
    } catch (error: any) {
      return {
        jobId: jobUrl,
        jobTitle: 'Unknown',
        company: 'Unknown',
        status: 'failed',
        error: error.message
      };
    }
  }

  private async fillLinkedInFormStep(page: Page, profile: UserProfile) {
    // Fill text inputs
    const inputs = await page.locator('input[type="text"]:visible, input[type="email"]:visible, input[type="tel"]:visible, textarea:visible').all();
    
    for (const input of inputs) {
      const label = (await input.getAttribute('aria-label') || '').toLowerCase();
      const name = (await input.getAttribute('name') || '').toLowerCase();
      const field = `${label} ${name}`;

      try {
        if (field.includes('phone') || field.includes('mobile')) {
          await input.fill(profile.phone);
        } else if (field.includes('email')) {
          await input.fill(profile.email);
        } else if (field.includes('first') && field.includes('name')) {
          await input.fill(profile.name.split(' ')[0]);
        } else if (field.includes('last') && field.includes('name')) {
          await input.fill(profile.name.split(' ').slice(1).join(' ') || profile.name);
        } else if (field.includes('linkedin')) {
          if (profile.linkedinUrl) await input.fill(profile.linkedinUrl);
        } else if (field.includes('github')) {
          if (profile.githubUrl) await input.fill(profile.githubUrl);
        } else if (field.includes('website') || field.includes('portfolio')) {
          if (profile.portfolioUrl) await input.fill(profile.portfolioUrl);
        }
      } catch (e) {}
    }

    // Handle file upload
    if (profile.resumePath) {
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await fileInput.setInputFiles(profile.resumePath);
        await page.waitForTimeout(2000);
      }
    }

    // Handle dropdowns
    const selects = await page.locator('select:visible').all();
    for (const select of selects) {
      try {
        const options = await select.locator('option').all();
        if (options.length > 1) await select.selectOption({ index: 1 });
      } catch (e) {}
    }
  }

  private async applyIndeed(page: Page, jobUrl: string, profile: UserProfile): Promise<ApplicationResult> {
    try {
      const applyBtn = page.locator('button:has-text("Apply now"), a:has-text("Apply now")').first();
      
      if (await applyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await applyBtn.click();
        await page.waitForTimeout(2000);

        // Fill Indeed form
        await this.fillGenericForm(page, profile);

        // Submit
        const submitBtn = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Continue")').first();
        if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(3000);

          return {
            jobId: jobUrl,
            jobTitle: await this.extractJobTitle(page),
            company: await this.extractCompany(page),
            status: 'success',
            submittedAt: new Date()
          };
        }
      }

      return {
        jobId: jobUrl,
        jobTitle: await this.extractJobTitle(page),
        company: await this.extractCompany(page),
        status: 'failed',
        error: 'Could not find apply button'
      };
    } catch (error: any) {
      return {
        jobId: jobUrl,
        jobTitle: 'Unknown',
        company: 'Unknown',
        status: 'failed',
        error: error.message
      };
    }
  }

  private async applyGreenhouse(page: Page, jobUrl: string, profile: UserProfile): Promise<ApplicationResult> {
    try {
      await page.fill('input[name="job_application[first_name]"]', profile.name.split(' ')[0]);
      await page.fill('input[name="job_application[last_name]"]', profile.name.split(' ').slice(1).join(' '));
      await page.fill('input[name="job_application[email]"]', profile.email);
      await page.fill('input[name="job_application[phone]"]', profile.phone);

      if (profile.resumePath) {
        await page.setInputFiles('input[type="file"]', profile.resumePath);
        await page.waitForTimeout(2000);
      }

      const submitBtn = page.locator('input[type="submit"], button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(3000);

      return {
        jobId: jobUrl,
        jobTitle: await this.extractJobTitle(page),
        company: await this.extractCompany(page),
        status: 'success',
        submittedAt: new Date()
      };
    } catch (error: any) {
      return {
        jobId: jobUrl,
        jobTitle: 'Unknown',
        company: 'Unknown',
        status: 'failed',
        error: error.message
      };
    }
  }

  private async applyGeneric(page: Page, jobUrl: string, profile: UserProfile): Promise<ApplicationResult> {
    try {
      // Use AI to understand the page and fill forms intelligently
      const pageContent = await page.content();
      const pageText = await page.evaluate(() => {
        // @ts-ignore
        return document.body.innerText;
      });
      
      // AI analyzes the page structure
      const aiAnalysis = await this.analyzePageWithAI(pageText.substring(0, 3000), profile);
      
      console.log('🤖 AI Analysis:', aiAnalysis.strategy);

      // Step 1: Click apply button if needed
      if (aiAnalysis.needsApplyClick) {
        const applySelectors = [
          'button:has-text("Apply")',
          'a:has-text("Apply")',
          'button:has-text("Submit Application")',
          '[class*="apply"][role="button"]',
          'a[href*="apply"]'
        ];

        for (const selector of applySelectors) {
          try {
            const btn = page.locator(selector).first();
            if (await btn.isVisible({ timeout: 1000 })) {
              await btn.click({ timeout: 5000 });
              await page.waitForTimeout(2000);
              console.log('✅ Clicked apply button');
              break;
            }
          } catch (e) {}
        }
      }

      // Step 2: AI-powered form filling
      await this.fillFormWithAI(page, profile, aiAnalysis);

      // Step 3: Smart submit with multiple attempts
      const submitted = await this.smartSubmit(page);

      if (submitted) {
        // Verify success
        await page.waitForTimeout(3000);
        const success = await this.verifySubmission(page);
        
        return {
          jobId: jobUrl,
          jobTitle: await this.extractJobTitle(page),
          company: await this.extractCompany(page),
          status: success ? 'success' : 'partial',
          submittedAt: success ? new Date() : undefined,
          error: success ? undefined : 'Submitted but no confirmation'
        };
      }

      return {
        jobId: jobUrl,
        jobTitle: await this.extractJobTitle(page),
        company: await this.extractCompany(page),
        status: 'partial',
        error: 'Could not submit - form filled'
      };
    } catch (error: any) {
      return {
        jobId: jobUrl,
        jobTitle: await this.extractJobTitle(page),
        company: await this.extractCompany(page),
        status: 'failed',
        error: error.message.substring(0, 100)
      };
    }
  }

  private async analyzePageWithAI(pageText: string, profile: UserProfile): Promise<any> {
    try {
      const prompt = `Analyze this job application page and provide a strategy:

Page Content:
${pageText}

Candidate: ${profile.name}, ${profile.email}, ${profile.phone}

Respond in JSON:
{
  "needsApplyClick": boolean,
  "hasLoginRequired": boolean,
  "formFields": ["name", "email", "phone", "resume", "coverLetter"],
  "submitButtonText": "Submit" or "Apply",
  "strategy": "brief description"
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(response);
    } catch (error) {
      return {
        needsApplyClick: true,
        hasLoginRequired: false,
        formFields: ['name', 'email', 'phone'],
        submitButtonText: 'Submit',
        strategy: 'Standard form filling'
      };
    }
  }

  private async fillFormWithAI(page: Page, profile: UserProfile, analysis: any) {
    // Get all input fields
    const inputs = await page.locator('input:visible, textarea:visible, select:visible').all();
    
    for (const input of inputs) {
      try {
        const type = await input.getAttribute('type');
        const name = (await input.getAttribute('name') || '').toLowerCase();
        const id = (await input.getAttribute('id') || '').toLowerCase();
        const placeholder = (await input.getAttribute('placeholder') || '').toLowerCase();
        const label = await input.evaluate((el: any) => {
          // @ts-ignore
          const labelEl = document.querySelector(`label[for="${el.id}"]`);
          return labelEl?.textContent?.toLowerCase() || '';
        });
        
        const field = `${name} ${id} ${placeholder} ${label}`;

        // Smart field detection
        if (type === 'file') {
          if (profile.resumePath) {
            await input.setInputFiles(profile.resumePath);
            console.log('✅ Uploaded resume');
          }
        } else if (type === 'email' || field.includes('email')) {
          await input.fill(profile.email);
        } else if (type === 'tel' || field.includes('phone') || field.includes('mobile')) {
          await input.fill(profile.phone);
        } else if (field.includes('first') && field.includes('name')) {
          await input.fill(profile.name.split(' ')[0]);
        } else if (field.includes('last') && field.includes('name')) {
          await input.fill(profile.name.split(' ').slice(1).join(' ') || profile.name);
        } else if (field.includes('full') && field.includes('name') || field === 'name') {
          await input.fill(profile.name);
        } else if (field.includes('linkedin')) {
          if (profile.linkedinUrl) await input.fill(profile.linkedinUrl);
        } else if (field.includes('github')) {
          if (profile.githubUrl) await input.fill(profile.githubUrl);
        } else if (field.includes('portfolio') || field.includes('website')) {
          if (profile.portfolioUrl) await input.fill(profile.portfolioUrl);
        } else if (field.includes('cover') || field.includes('letter') || field.includes('message')) {
          const coverLetter = await this.generateCoverLetter(profile);
          await input.fill(coverLetter);
          console.log('✅ Generated cover letter');
        } else if (field.includes('experience') || field.includes('years')) {
          await input.fill(profile.yearsOfExperience?.toString() || '3');
        }
      } catch (e) {}
    }

    // Handle dropdowns
    const selects = await page.locator('select:visible').all();
    for (const select of selects) {
      try {
        const options = await select.locator('option').all();
        if (options.length > 1) {
          await select.selectOption({ index: 1 });
        }
      } catch (e) {}
    }

    // Handle checkboxes (terms and conditions)
    const checkboxes = await page.locator('input[type="checkbox"]:visible').all();
    for (const checkbox of checkboxes) {
      try {
        const label = await checkbox.evaluate((el: any) => {
          // @ts-ignore
          const labelEl = document.querySelector(`label[for="${el.id}"]`);
          return labelEl?.textContent?.toLowerCase() || '';
        });
        
        if (label.includes('agree') || label.includes('terms') || label.includes('privacy')) {
          await checkbox.check();
        }
      } catch (e) {}
    }
  }

  private async smartSubmit(page: Page): Promise<boolean> {
    const submitStrategies = [
      // Strategy 1: Standard submit button
      async () => {
        const selectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button:has-text("Submit")',
          'button:has-text("Apply")',
          'button:has-text("Send")',
          'button:has-text("Continue")'
        ];
        
        for (const selector of selectors) {
          try {
            const btn = page.locator(selector).first();
            if (await btn.isVisible({ timeout: 1000 })) {
              await btn.click({ timeout: 5000, force: true });
              console.log(`✅ Clicked submit: ${selector}`);
              return true;
            }
          } catch (e) {}
        }
        return false;
      },
      
      // Strategy 2: Form submission via Enter key
      async () => {
        try {
          await page.keyboard.press('Enter');
          console.log('✅ Pressed Enter');
          return true;
        } catch (e) {
          return false;
        }
      },
      
      // Strategy 3: Click any button with submit-like text
      async () => {
        try {
          const buttons = await page.locator('button:visible, a[role="button"]:visible').all();
          for (const btn of buttons) {
            const text = (await btn.textContent() || '').toLowerCase();
            if (text.includes('submit') || text.includes('apply') || text.includes('send')) {
              await btn.click({ timeout: 5000, force: true });
              console.log(`✅ Clicked button: ${text}`);
              return true;
            }
          }
        } catch (e) {}
        return false;
      }
    ];

    for (const strategy of submitStrategies) {
      if (await strategy()) {
        return true;
      }
    }

    return false;
  }

  private async verifySubmission(page: Page): Promise<boolean> {
    try {
      const successIndicators = [
        'text=/thank you|success|submitted|received|confirmation/i',
        '[class*="success"]',
        '[class*="confirmation"]',
        '[class*="complete"]'
      ];

      for (const indicator of successIndicators) {
        if (await page.locator(indicator).isVisible({ timeout: 2000 }).catch(() => false)) {
          return true;
        }
      }

      // Check URL change
      const url = page.url();
      if (url.includes('success') || url.includes('thank') || url.includes('confirmation')) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  private async generateCoverLetter(profile: UserProfile): Promise<string> {
    try {
      const prompt = `Write a brief professional cover letter (150 words max) for:
Name: ${profile.name}
Skills: ${profile.skills?.join(', ') || 'Software Development'}
Experience: ${profile.yearsOfExperience || 3} years

Keep it concise and enthusiastic.`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 300
      });

      return completion.choices[0]?.message?.content || 'I am excited to apply for this position.';
    } catch (error) {
      return `I am ${profile.name}, and I am excited to apply for this position. With ${profile.yearsOfExperience || 3} years of experience, I believe I would be a great fit for your team.`;
    }
  }

  private async applyLever(page: Page, jobUrl: string, profile: UserProfile): Promise<ApplicationResult> {
    try {
      await page.fill('input[name="name"]', profile.name);
      await page.fill('input[name="email"]', profile.email);
      await page.fill('input[name="phone"]', profile.phone);

      if (profile.resumePath) {
        await page.setInputFiles('input[type="file"]', profile.resumePath);
        await page.waitForTimeout(2000);
      }

      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(3000);

      return {
        jobId: jobUrl,
        jobTitle: await this.extractJobTitle(page),
        company: await this.extractCompany(page),
        status: 'success',
        submittedAt: new Date()
      };
    } catch (error: any) {
      return {
        jobId: jobUrl,
        jobTitle: 'Unknown',
        company: 'Unknown',
        status: 'failed',
        error: error.message
      };
    }
  }

  private async applyWorkday(page: Page, jobUrl: string, profile: UserProfile): Promise<ApplicationResult> {
    try {
      // Workday has complex multi-step forms
      await this.fillGenericForm(page, profile);

      // Click through multiple "Next" buttons
      for (let i = 0; i < 5; i++) {
        const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
        if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(2000);
        } else {
          break;
        }
      }

      // Final submit
      const submitBtn = page.locator('button:has-text("Submit")').first();
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(3000);

        return {
          jobId: jobUrl,
          jobTitle: await this.extractJobTitle(page),
          company: await this.extractCompany(page),
          status: 'success',
          submittedAt: new Date()
        };
      }

      return {
        jobId: jobUrl,
        jobTitle: await this.extractJobTitle(page),
        company: await this.extractCompany(page),
        status: 'partial',
        error: 'Could not complete Workday application'
      };
    } catch (error: any) {
      return {
        jobId: jobUrl,
        jobTitle: 'Unknown',
        company: 'Unknown',
        status: 'failed',
        error: error.message
      };
    }
  }

  private async fillGenericForm(page: Page, profile: UserProfile) {
    const inputs = await page.locator('input:visible, textarea:visible').all();
    
    for (const input of inputs) {
      try {
        const type = await input.getAttribute('type');
        const name = (await input.getAttribute('name') || '').toLowerCase();
        const id = (await input.getAttribute('id') || '').toLowerCase();
        const placeholder = (await input.getAttribute('placeholder') || '').toLowerCase();
        const field = `${name} ${id} ${placeholder}`;

        if (type === 'file' && profile.resumePath) {
          await input.setInputFiles(profile.resumePath);
        } else if (field.includes('phone') || field.includes('mobile') || type === 'tel') {
          await input.fill(profile.phone);
        } else if (type === 'email' || field.includes('email')) {
          await input.fill(profile.email);
        } else if (field.includes('first') && field.includes('name')) {
          await input.fill(profile.name.split(' ')[0]);
        } else if (field.includes('last') && field.includes('name')) {
          await input.fill(profile.name.split(' ').slice(1).join(' ') || profile.name);
        } else if (field.includes('name') && !field.includes('company')) {
          await input.fill(profile.name);
        }
      } catch (e) {}
    }
  }

  private async extractJobTitle(page: Page): Promise<string> {
    try {
      const title = await page.locator('h1, .job-title, [class*="job-title"]').first().textContent({ timeout: 2000 });
      return title?.trim() || 'Unknown Position';
    } catch {
      return 'Unknown Position';
    }
  }

  private async extractCompany(page: Page): Promise<string> {
    try {
      const company = await page.locator('.company-name, [class*="company"], [class*="employer"]').first().textContent({ timeout: 2000 });
      return company?.trim() || 'Unknown Company';
    } catch {
      return 'Unknown Company';
    }
  }

  async sendConfirmationEmail(userEmail: string, results: ApplicationResult[]) {
    if (!this.emailTransporter) {
      console.log('Email not configured');
      return;
    }

    const successful = results.filter(r => r.status === 'success');
    const partial = results.filter(r => r.status === 'partial');
    const failed = results.filter(r => r.status === 'failed');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">🤖 AI Job Application Report</h2>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin: 0;">✅ Successfully Applied: ${successful.length}</h3>
          ${successful.map(r => `
            <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
              <strong>${r.jobTitle}</strong> at ${r.company}<br>
              <small style="color: #666;">Submitted: ${r.submittedAt?.toLocaleString()}</small>
            </div>
          `).join('')}
        </div>

        ${partial.length > 0 ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #d97706; margin: 0;">⚠️ Partially Completed: ${partial.length}</h3>
            ${partial.map(r => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                <strong>${r.jobTitle}</strong> at ${r.company}<br>
                <small style="color: #666;">${r.error}</small>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${failed.length > 0 ? `
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin: 0;">❌ Failed: ${failed.length}</h3>
            ${failed.map(r => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                <strong>${r.jobTitle}</strong> at ${r.company}<br>
                <small style="color: #666;">${r.error}</small>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <p style="margin-top: 30px; color: #666;">
          <strong>Next Steps:</strong><br>
          • Check your email for confirmation from companies<br>
          • Review partially completed applications in your browser<br>
          • Follow up on applications after 3-5 days
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated message from ReferAI. Do not reply to this email.
        </p>
      </div>
    `;

    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `🤖 AI Applied to ${successful.length} Jobs Successfully!`,
        html
      });
      console.log('✅ Confirmation email sent');
    } catch (error: any) {
      console.error('Email error:', error.message);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const aiApplicationService = new AIApplicationService();
