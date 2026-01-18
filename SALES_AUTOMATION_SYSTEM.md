# AI Sales Automation System - Complete Documentation

## Overview
Professional AI-powered call management and email automation system for advertisement sales teams. Built with production-level features including automated follow-ups, lead scoring, call analysis, and intelligent email campaigns.

## Features

### 🤖 AI-Powered Features
- **Call Transcript Analysis**: Automatically analyze sales calls to extract key insights, sentiment, and action items
- **Lead Scoring**: AI-based scoring (0-100) to prioritize high-quality leads
- **Email Generation**: Generate personalized emails based on lead context and interaction history
- **Next Action Suggestions**: AI recommends the best next step for each lead

### 📧 Email Automation
- **Automated Campaigns**: Send initial outreach, follow-ups, proposals, and reminders
- **Email Tracking**: Track opens and clicks with pixel tracking
- **Bulk Sending**: Send campaigns to multiple leads with smart delays
- **Personalization**: AI-generated content tailored to each lead

### 📞 Call Management
- **Call History**: Track all calls with duration, summary, and sentiment
- **Transcript Storage**: Store and analyze call transcripts
- **Outcome Tracking**: Record call outcomes and next steps

### 🎯 Lead Management
- **Complete CRM**: Manage leads through entire sales pipeline
- **Status Tracking**: Track leads from new → contacted → qualified → closed
- **Priority System**: Urgent, high, medium, low priority levels
- **Custom Fields**: Industry, company size, budget, notes

### 📊 Analytics & Reporting
- **Dashboard Stats**: Real-time metrics on leads, conversions, and activities
- **AI Score Tracking**: Monitor lead quality over time
- **Activity Logs**: Complete history of all interactions
- **Weekly Reports**: Automated summary reports

### ⏰ Automation Schedulers
- **Follow-up Scheduler**: Automatically send follow-ups at optimal times
- **Score Updates**: Daily AI score recalculation
- **Stale Lead Re-engagement**: Automatically reach out to inactive high-quality leads
- **Weekly Summaries**: Team performance reports

## Architecture

### Backend Structure
```
backend/src/
├── models/
│   └── SalesLead.ts          # Lead data model
├── services/
│   ├── aiSalesService.ts     # AI analysis & generation
│   ├── emailAutomationService.ts  # Email sending & tracking
│   └── salesScheduler.ts     # Automated tasks
├── controllers/
│   └── salesController.ts    # API endpoints
├── routes/
│   └── sales.ts              # Route definitions
└── utils/
    └── logger.ts             # Production logging
```

### Frontend Structure
```
frontend/src/pages/
└── SalesDashboard.tsx        # Main dashboard UI
```

## API Endpoints

### Lead Management
```
POST   /api/sales/leads              # Create new lead
GET    /api/sales/leads              # Get all leads (with filters)
GET    /api/sales/leads/:id          # Get single lead
PUT    /api/sales/leads/:id          # Update lead
DELETE /api/sales/leads/:id          # Delete lead
```

### Call Management
```
POST   /api/sales/leads/:id/calls    # Add call record with AI analysis
```

### Email Automation
```
POST   /api/sales/leads/:id/email    # Send email to lead
POST   /api/sales/emails/bulk        # Send bulk emails
```

### AI Features
```
GET    /api/sales/leads/:id/suggestions  # Get AI suggestions
```

### Analytics
```
GET    /api/sales/dashboard/stats    # Get dashboard statistics
```

### Tracking
```
GET    /api/sales/track/open/:trackingId  # Email open tracking pixel
```

## Setup Instructions

### 1. Environment Variables
Add to `backend/.env`:
```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
COMPANY_NAME=Your Company Name

# URLs
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start the Server
```bash
npm run dev
```

The sales automation schedulers will start automatically.

### 4. Access the Dashboard
Navigate to: `http://localhost:5173/admin/sales`

## Usage Guide

### Creating a Lead
```javascript
POST /api/sales/leads
{
  "companyName": "Acme Corp",
  "contactPerson": "John Doe",
  "email": "john@acme.com",
  "phone": "+1234567890",
  "industry": "Technology",
  "companySize": "51-200",
  "source": "linkedin",
  "budget": 50000,
  "notes": "Interested in Q1 campaign",
  "sendInitialEmail": true
}
```

### Recording a Call
```javascript
POST /api/sales/leads/:id/calls
{
  "transcript": "Full call transcript here...",
  "duration": 1800,
  "outcome": "Scheduled follow-up meeting"
}
```

Response includes:
- AI-generated summary
- Sentiment analysis
- Key points extracted
- Recommended next steps

### Sending Automated Email
```javascript
POST /api/sales/leads/:id/email
{
  "type": "follow_up"  // initial, follow_up, proposal, reminder, thank_you
}
```

AI will generate personalized content based on:
- Lead's company and industry
- Previous interactions
- Current status in pipeline

### Getting AI Suggestions
```javascript
GET /api/sales/leads/:id/suggestions
```

Returns:
- Recommended next action
- Priority level
- Reasoning
- Suggested follow-up date
- Draft email content

## Automation Schedules

### Follow-up Scheduler
- **Frequency**: Every hour
- **Action**: Checks for leads needing follow-up and sends automated emails
- **Updates**: Next follow-up date and priority

### AI Score Update
- **Frequency**: Daily at 2 AM
- **Action**: Recalculates AI scores for all active leads
- **Factors**: Engagement, company size, budget, interaction history

### Stale Lead Re-engagement
- **Frequency**: Daily at 10 AM
- **Action**: Identifies leads inactive for 30+ days with score ≥50
- **Result**: Sends re-engagement email and schedules follow-up

### Weekly Summary
- **Frequency**: Every Monday at 9 AM
- **Action**: Generates team performance report
- **Metrics**: New leads, closed deals, calls, emails

## Lead Scoring Algorithm

AI considers:
- **Company Size**: Larger companies = higher score
- **Industry**: Target industries weighted higher
- **Budget**: Disclosed budget increases score
- **Engagement**: More interactions = higher score
- **Source**: Quality sources (referrals) score higher
- **Recency**: Recent activity boosts score

Score ranges:
- **80-100**: Hot lead - immediate action
- **60-79**: Warm lead - high priority
- **40-59**: Qualified lead - regular follow-up
- **20-39**: Cold lead - nurture campaign
- **0-19**: Low quality - minimal effort

## Email Types

### Initial Outreach
- Introduces your company
- Highlights value proposition
- Soft call-to-action

### Follow-up
- References previous interaction
- Provides additional value
- Suggests next steps

### Proposal
- Detailed solution overview
- Pricing information
- Clear next steps

### Reminder
- Gentle nudge
- References previous conversation
- Easy scheduling option

### Thank You
- Post-meeting appreciation
- Summarizes discussion
- Confirms next steps

## Best Practices

### 1. Lead Quality
- Always provide accurate company information
- Add detailed notes after each interaction
- Update status promptly

### 2. Email Campaigns
- Use 2-3 second delays between bulk emails
- Personalize with custom content when possible
- Monitor open and click rates

### 3. Call Management
- Record calls immediately after completion
- Include full transcripts for best AI analysis
- Review AI suggestions before acting

### 4. Follow-ups
- Trust AI-suggested timing
- Adjust priority based on lead response
- Don't over-contact (respect cadence)

### 5. Monitoring
- Check dashboard daily
- Review high-priority leads first
- Act on "needs follow-up" alerts

## Production Deployment

### 1. Security
- Use environment variables for all secrets
- Enable rate limiting (already configured)
- Use HTTPS in production
- Implement authentication middleware

### 2. Email Deliverability
- Use dedicated SMTP service (SendGrid, AWS SES)
- Configure SPF, DKIM, DMARC records
- Monitor bounce rates
- Implement unsubscribe functionality

### 3. Monitoring
- Logs stored in `backend/logs/`
- Monitor error.log for issues
- Track sales.log for activity
- Set up alerts for failures

### 4. Scaling
- Use Redis for caching lead data
- Implement queue system for bulk emails
- Consider separate worker for AI processing
- Database indexing already configured

### 5. Backup
- Regular MongoDB backups
- Export lead data periodically
- Store call transcripts externally

## Troubleshooting

### Emails Not Sending
1. Check SMTP credentials in .env
2. Verify SMTP_USER has "App Password" enabled (Gmail)
3. Check logs: `backend/logs/error.log`
4. Test with single email before bulk

### AI Features Not Working
1. Verify OPENAI_API_KEY is set
2. Check API quota/billing
3. Review logs for API errors
4. Ensure proper JSON response format

### Schedulers Not Running
1. Verify server is running continuously
2. Check logs for cron errors
3. Ensure MongoDB connection is stable
4. Review timezone settings

### Low Lead Scores
1. Add more interaction data
2. Update company size and budget
3. Record call outcomes
4. Increase engagement frequency

## Support & Maintenance

### Regular Tasks
- Weekly: Review dashboard stats
- Monthly: Analyze conversion rates
- Quarterly: Update email templates
- Annually: Review AI model performance

### Updates
- Keep dependencies updated
- Monitor OpenAI API changes
- Update email templates seasonally
- Refine lead scoring algorithm

## API Rate Limits
- General: 500 requests per 15 minutes
- Bulk emails: Recommended 2-3 second delay
- AI calls: Subject to OpenAI limits

## Data Privacy
- Store only necessary lead information
- Implement data retention policies
- Provide unsubscribe mechanism
- Comply with GDPR/CCPA if applicable

## Future Enhancements
- [ ] SMS integration
- [ ] Voice call automation
- [ ] LinkedIn integration
- [ ] Calendar scheduling
- [ ] Advanced analytics dashboard
- [ ] A/B testing for emails
- [ ] Multi-language support
- [ ] Mobile app

## License
Proprietary - All rights reserved

## Contact
For support, contact your development team.
