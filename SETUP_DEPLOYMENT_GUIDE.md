# 🚀 Complete Setup & Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Software
- ✅ Node.js 18+ and npm
- ✅ MongoDB 6.0+
- ✅ Git

### Required Accounts
- ✅ OpenAI API account (for GPT-4)
- ✅ Email service (Gmail/SendGrid/AWS SES)
- ✅ (Optional) Cloud hosting (AWS/Heroku/DigitalOcean)

---

## Local Development Setup

### Step 1: Install Dependencies

```bash
# Navigate to backend
cd backend

# Install packages
npm install

# Verify installation
npm list openai nodemailer winston node-cron
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Use in MONGO_URI

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env
```

**Required Configuration:**
```env
# Database
MONGO_URI=mongodb://localhost:27017/referus

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# OpenAI (REQUIRED for AI features)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Email (REQUIRED for email automation)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Company Info
COMPANY_NAME=Your Company Name

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

### Step 4: Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up / Log in
3. Navigate to API Keys
4. Create new secret key
5. Copy and paste into .env

**Cost Estimate:**
- ~$0.03 per call analysis
- ~$0.02 per email generation
- ~$0.01 per lead scoring
- Budget: $50-100/month for moderate use

### Step 5: Setup Email (Gmail Example)

1. **Enable 2-Factor Authentication**
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - Enable it

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Name it "Sales Automation"
   - Copy the 16-character password
   - Use this in SMTP_PASS (no spaces)

3. **Alternative: SendGrid**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### Step 6: Initialize Database

```bash
# Run setup script
npm run setup-sales
```

**Expected Output:**
```
🚀 Setting up Sales Automation System...
✅ Connected to MongoDB
📝 Creating sample leads...
   ✓ Created: TechCorp Solutions (Sarah Johnson)
   ✓ Created: Global Retail Inc (Michael Chen)
   ...
✅ Sample leads created successfully!
📊 Current Statistics:
   Total Leads: 5
   New: 1
   Contacted: 1
   ...
🎉 Setup complete!
```

### Step 7: Start Development Server

```bash
# Start backend
npm run dev
```

**Expected Output:**
```
Backend server running on port 3001
Scheduler started - checking expired referrals every hour
Connected to MongoDB
Follow-up scheduler started
AI score update scheduler started
Weekly summary scheduler started
Stale lead scheduler started
All sales automation schedulers started
```

### Step 8: Start Frontend

```bash
# In new terminal
cd ../frontend

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

### Step 9: Access Dashboard

Open browser: `http://localhost:5173/admin/sales`

---

## Configuration

### Email Templates Customization

Edit `backend/src/services/emailAutomationService.ts`:

```typescript
private getEmailTemplate(content: string, recipientName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Customize your styles here */
        .header { background: #your-color; }
      </style>
    </head>
    <body>
      <!-- Your custom template -->
    </body>
    </html>
  `;
}
```

### AI Prompts Customization

Edit `backend/src/services/aiSalesService.ts`:

```typescript
// Customize prompts for your industry
const prompt = `Analyze this sales call for [YOUR INDUSTRY]...`;
```

### Scheduler Timing

Edit `backend/src/services/salesScheduler.ts`:

```typescript
// Change cron expressions
cron.schedule('0 * * * *', ...);  // Every hour
cron.schedule('0 2 * * *', ...);  // Daily at 2 AM
cron.schedule('0 10 * * *', ...); // Daily at 10 AM
cron.schedule('0 9 * * 1', ...);  // Monday at 9 AM
```

**Cron Format:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 or 7 is Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

---

## Testing

### 1. Test API with Postman

```bash
# Import collection
File → Import → Sales_Automation_API.postman_collection.json

# Set variables
- baseUrl: http://localhost:3001
- token: your-jwt-token
```

### 2. Test Email Sending

```bash
# Using curl
curl -X POST http://localhost:3001/api/sales/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Corp",
    "contactPerson": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "industry": "Technology",
    "companySize": "11-50",
    "source": "website",
    "sendInitialEmail": true
  }'
```

### 3. Test AI Features

```bash
# Test call analysis
curl -X POST http://localhost:3001/api/sales/leads/LEAD_ID/calls \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Test call transcript...",
    "duration": 1800,
    "outcome": "Test outcome"
  }'
```

### 4. Check Logs

```bash
# Watch logs in real-time
tail -f backend/logs/combined.log
tail -f backend/logs/sales.log
tail -f backend/logs/error.log
```

---

## Production Deployment

### Option 1: AWS Deployment

#### 1. Setup EC2 Instance

```bash
# Launch Ubuntu 22.04 instance
# SSH into instance
ssh -i your-key.pem ubuntu@your-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone repository
git clone your-repo-url
cd ReferAI/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Setup environment
nano .env
# Add production values

# Start with PM2
pm2 start dist/server.js --name sales-automation
pm2 save
pm2 startup
```

#### 3. Setup Nginx

```bash
# Install Nginx
sudo apt-get install nginx

# Configure
sudo nano /etc/nginx/sites-available/sales-automation

# Add configuration
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/sales-automation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Setup SSL

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

### Option 2: Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set OPENAI_API_KEY=your-key
heroku config:set SMTP_USER=your-email
heroku config:set SMTP_PASS=your-password
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Option 3: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MONGO_URI=mongodb://mongo:27017/referus
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Deploy:

```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Monitoring & Maintenance

### 1. Setup Monitoring

**PM2 Monitoring:**
```bash
pm2 monit
pm2 logs sales-automation
```

**Log Monitoring:**
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/sales-automation

/path/to/backend/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

### 2. Database Backups

```bash
# Create backup script
nano backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/referus" --out="/backups/$DATE"
find /backups -type d -mtime +7 -exec rm -rf {} +

# Make executable
chmod +x backup.sh

# Add to crontab
crontab -e
0 2 * * * /path/to/backup.sh
```

### 3. Health Checks

```bash
# Create health check script
nano health-check.sh

#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ $response != "200" ]; then
    echo "Server down! Restarting..."
    pm2 restart sales-automation
fi

# Add to crontab
*/5 * * * * /path/to/health-check.sh
```

### 4. Performance Monitoring

**Setup New Relic:**
```bash
npm install newrelic
# Add to server.ts
require('newrelic');
```

**Setup Datadog:**
```bash
npm install dd-trace
# Add to server.ts
require('dd-trace').init();
```

### 5. Regular Maintenance Tasks

**Weekly:**
- Review error logs
- Check email deliverability
- Monitor AI API usage
- Review lead conversion rates

**Monthly:**
- Update dependencies
- Review and optimize queries
- Analyze scheduler performance
- Update email templates

**Quarterly:**
- Security audit
- Performance optimization
- Feature review
- Cost analysis

---

## Troubleshooting

### Common Issues

**1. Emails not sending**
```bash
# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((error, success) => {
  if (error) console.log(error);
  else console.log('Server is ready');
});
"
```

**2. AI features not working**
```bash
# Test OpenAI connection
node -e "
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: 'your-key' });
openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Test' }]
}).then(r => console.log('Success')).catch(e => console.log(e));
"
```

**3. Database connection issues**
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/referus"
```

**4. Scheduler not running**
```bash
# Check logs
tail -f backend/logs/combined.log | grep "scheduler"

# Verify cron is working
node -e "
const cron = require('node-cron');
cron.schedule('* * * * *', () => {
  console.log('Cron is working!');
});
"
```

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Setup CORS properly
- [ ] Use strong passwords
- [ ] Enable MongoDB authentication
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity

---

## Performance Optimization

### 1. Database Indexing
Already configured in SalesLead model:
- email (unique)
- status
- priority
- nextFollowUpDate
- aiScore

### 2. Caching (Optional)

```bash
# Install Redis
npm install ioredis

# Add to services
const Redis = require('ioredis');
const redis = new Redis();

# Cache lead data
await redis.setex(`lead:${id}`, 3600, JSON.stringify(lead));
```

### 3. Queue System (Optional)

```bash
# Install Bull
npm install bull

# Add queue for emails
const Queue = require('bull');
const emailQueue = new Queue('emails');

emailQueue.process(async (job) => {
  await sendEmail(job.data);
});
```

---

## Support & Resources

**Documentation:**
- Quick Start: `SALES_QUICK_START.md`
- Full Guide: `SALES_AUTOMATION_SYSTEM.md`
- Architecture: `SALES_ARCHITECTURE.md`

**Tools:**
- Postman Collection: `Sales_Automation_API.postman_collection.json`
- Setup Script: `npm run setup-sales`

**Logs:**
- Error: `backend/logs/error.log`
- Sales: `backend/logs/sales.log`
- Combined: `backend/logs/combined.log`

---

**Status:** ✅ Production Ready  
**Last Updated:** 2024  
**Version:** 1.0.0
