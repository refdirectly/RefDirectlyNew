# 🚀 AI Sales Automation System - Quick Start

## What's Included

A complete, production-ready AI-powered sales automation system with:

✅ **AI Call Analysis** - Automatically analyze sales calls and extract insights  
✅ **Lead Scoring** - AI-based lead quality scoring (0-100)  
✅ **Email Automation** - Send personalized emails automatically  
✅ **Smart Follow-ups** - Automated follow-up scheduling  
✅ **CRM Dashboard** - Complete lead management interface  
✅ **Analytics** - Real-time sales metrics and reporting  

## 🏃 Quick Start (5 minutes)

### 1. Configure Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` and add:
```env
OPENAI_API_KEY=sk-your-key-here
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Setup Sample Data
```bash
npm run setup-sales
```

### 3. Start Server
```bash
npm run dev
```

### 4. Access Dashboard
Open: `http://localhost:5173/admin/sales`

## 📧 Email Setup (Gmail)

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use App Password in `SMTP_PASS`

## 🎯 Key Features

### Lead Management
- Create and track leads through sales pipeline
- Automatic AI scoring based on quality indicators
- Priority levels: Urgent, High, Medium, Low
- Status tracking: New → Contacted → Qualified → Closed

### AI-Powered Automation
- **Call Analysis**: Upload transcripts, get summaries and sentiment
- **Email Generation**: AI writes personalized emails
- **Next Action**: AI suggests best next step for each lead
- **Smart Scheduling**: Optimal follow-up timing

### Email Campaigns
- Initial outreach
- Follow-up sequences
- Proposal sending
- Reminder emails
- Thank you notes

### Automated Schedulers
- **Hourly**: Check and send follow-ups
- **Daily 2 AM**: Update AI scores
- **Daily 10 AM**: Re-engage stale leads
- **Monday 9 AM**: Weekly team summary

## 📊 API Endpoints

```bash
# Create Lead
POST /api/sales/leads
{
  "companyName": "Acme Corp",
  "contactPerson": "John Doe",
  "email": "john@acme.com",
  "phone": "+1234567890",
  "industry": "Technology",
  "companySize": "51-200",
  "source": "linkedin",
  "sendInitialEmail": true
}

# Get All Leads
GET /api/sales/leads?status=new&priority=high

# Record Call with AI Analysis
POST /api/sales/leads/:id/calls
{
  "transcript": "Call transcript here...",
  "duration": 1800,
  "outcome": "Scheduled meeting"
}

# Send Automated Email
POST /api/sales/leads/:id/email
{
  "type": "follow_up"
}

# Get AI Suggestions
GET /api/sales/leads/:id/suggestions

# Dashboard Stats
GET /api/sales/dashboard/stats
```

## 🎨 Dashboard Features

### Stats Overview
- Total leads
- Qualified leads
- Conversion rate
- Leads needing follow-up

### Lead Table
- Filter by status, priority, score
- Quick actions: Email, AI suggestions, Details
- Visual AI score indicators
- Priority color coding

### Actions
- Send individual emails
- Bulk email campaigns
- Get AI recommendations
- View interaction history

## 🤖 AI Capabilities

### Call Analysis
Extracts from transcripts:
- Summary (2-3 sentences)
- Sentiment (positive/neutral/negative)
- Key discussion points
- Recommended next steps
- Budget mentions
- Timeline information

### Lead Scoring Factors
- Company size (larger = higher)
- Industry relevance
- Budget disclosed
- Engagement frequency
- Source quality
- Recent activity

### Email Generation
Personalized based on:
- Company and industry
- Previous interactions
- Current pipeline status
- Lead quality score

## 📁 File Structure

```
backend/src/
├── models/
│   └── SalesLead.ts              # Lead data model
├── services/
│   ├── aiSalesService.ts         # AI analysis & generation
│   ├── emailAutomationService.ts # Email automation
│   └── salesScheduler.ts         # Automated tasks
├── controllers/
│   └── salesController.ts        # API logic
├── routes/
│   └── sales.ts                  # API routes
├── scripts/
│   └── setupSalesSystem.ts       # Setup script
└── utils/
    └── logger.ts                 # Logging

frontend/src/pages/
└── SalesDashboard.tsx            # Dashboard UI
```

## 🔧 Customization

### Email Templates
Edit `emailAutomationService.ts` → `getEmailTemplate()`

### Lead Scoring
Modify `aiSalesService.ts` → `scoreLeadQuality()`

### Scheduler Timing
Update `salesScheduler.ts` cron expressions

### Dashboard UI
Customize `SalesDashboard.tsx` components

## 📝 Usage Examples

### Example 1: Create Lead & Send Email
```javascript
const response = await fetch('/api/sales/leads', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    companyName: 'Tech Startup',
    contactPerson: 'Jane Smith',
    email: 'jane@techstartup.com',
    phone: '+1234567890',
    industry: 'SaaS',
    companySize: '11-50',
    source: 'linkedin',
    sendInitialEmail: true
  })
});
```

### Example 2: Record Call
```javascript
await fetch(`/api/sales/leads/${leadId}/calls`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    transcript: 'Full call transcript...',
    duration: 1800,
    outcome: 'Interested, follow up next week'
  })
});
```

### Example 3: Bulk Email Campaign
```javascript
await fetch('/api/sales/emails/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    leadIds: ['id1', 'id2', 'id3'],
    type: 'follow_up',
    delayBetweenEmails: 3000
  })
});
```

## 🐛 Troubleshooting

**Emails not sending?**
- Check SMTP credentials
- Enable "Less secure app access" or use App Password
- Check logs: `backend/logs/error.log`

**AI not working?**
- Verify OPENAI_API_KEY is set
- Check API quota/billing
- Review logs for errors

**Schedulers not running?**
- Ensure server runs continuously
- Check MongoDB connection
- Review cron logs

## 📚 Full Documentation

See `SALES_AUTOMATION_SYSTEM.md` for complete documentation including:
- Detailed API reference
- Production deployment guide
- Security best practices
- Scaling strategies
- Advanced features

## 🎯 Next Steps

1. ✅ Setup complete - System is ready!
2. 📧 Configure email settings
3. 🔑 Add OpenAI API key
4. 🧪 Test with sample leads
5. 📊 Monitor dashboard
6. 🚀 Start adding real leads

## 💡 Tips

- Start with high-priority leads
- Review AI suggestions before acting
- Monitor email open rates
- Update lead status promptly
- Check dashboard daily
- Trust the AI scoring

## 🆘 Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Review documentation
3. Contact development team

---

**Built with:** Node.js, Express, MongoDB, OpenAI GPT-4, React, TypeScript

**Status:** ✅ Production Ready
