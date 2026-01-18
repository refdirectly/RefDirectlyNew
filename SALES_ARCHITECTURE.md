# AI Sales Automation System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + TypeScript)                       │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Sales Dashboard UI                              │   │
│  │  • Statistics Cards  • Lead Table  • Filters  • Quick Actions       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                          │
│                                    │ HTTP/REST API                            │
│                                    ▼                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js + Express)                            │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         API Routes Layer                              │  │
│  │  /api/sales/leads  /api/sales/calls  /api/sales/emails              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Controllers Layer                                │  │
│  │  • salesController.ts - Business logic & request handling            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                    ┌───────────────┼───────────────┐                         │
│                    ▼               ▼               ▼                         │
│  ┌─────────────────────┐  ┌─────────────────┐  ┌──────────────────────┐   │
│  │   AI Services       │  │  Email Service  │  │  Sales Scheduler     │   │
│  │                     │  │                 │  │                      │   │
│  │ • Call Analysis     │  │ • SMTP Sending  │  │ • Follow-ups (1h)    │   │
│  │ • Lead Scoring      │  │ • Tracking      │  │ • Score Update (24h) │   │
│  │ • Email Generation  │  │ • Templates     │  │ • Re-engage (24h)    │   │
│  │ • Next Actions      │  │ • Bulk Send     │  │ • Weekly Report      │   │
│  └─────────────────────┘  └─────────────────┘  └──────────────────────┘   │
│           │                        │                      │                   │
│           ▼                        ▼                      ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Data Models Layer                            │   │
│  │  SalesLead Model - MongoDB Schema with Mongoose                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   MongoDB Database   │  │  OpenAI GPT-4    │  │  SMTP Server     │
│                      │  │                  │  │                  │
│ • Leads Collection   │  │ • AI Analysis    │  │ • Email Delivery │
│ • Indexed Fields     │  │ • Generation     │  │ • Tracking       │
│ • Call History       │  │ • Suggestions    │  │ • Templates      │
│ • Email History      │  │                  │  │                  │
└──────────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Data Flow Diagrams

### 1. Create Lead Flow
```
User Input → API → Controller → AI Scoring → Save to DB → Send Initial Email
                                                              ↓
                                                         Email Service
                                                              ↓
                                                         SMTP Server
                                                              ↓
                                                         Lead's Inbox
```

### 2. Call Recording Flow
```
Call Transcript → API → Controller → AI Analysis (OpenAI)
                                          ↓
                                    Extract Insights
                                    • Summary
                                    • Sentiment
                                    • Key Points
                                    • Next Steps
                                          ↓
                                    Update Lead Record
                                          ↓
                                    Recalculate AI Score
                                          ↓
                                    Suggest Next Action
```

### 3. Email Automation Flow
```
Trigger (Manual/Scheduled) → Email Service → AI Generate Content
                                                    ↓
                                              Personalize
                                                    ↓
                                              Add Tracking
                                                    ↓
                                              Send via SMTP
                                                    ↓
                                              Update History
                                                    ↓
                                              Schedule Follow-up
```

### 4. Automated Scheduler Flow
```
Cron Job Triggers → Check Conditions → Find Matching Leads
                                              ↓
                                        Process Each Lead
                                              ↓
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                              Send Email          Update Status
                                    ▼                   ▼
                              Track Result      Schedule Next
```

---

## Component Interactions

### AI Sales Service
```
┌─────────────────────────────────────────┐
│        AI Sales Service                 │
│                                         │
│  analyzeCallTranscript()                │
│    ↓                                    │
│  OpenAI GPT-4 API                       │
│    ↓                                    │
│  Parse JSON Response                    │
│    ↓                                    │
│  Return: summary, sentiment, keyPoints  │
│                                         │
│  scoreLeadQuality()                     │
│    ↓                                    │
│  Analyze: size, industry, budget,       │
│           engagement, source            │
│    ↓                                    │
│  Return: score (0-100)                  │
│                                         │
│  generateEmail()                        │
│    ↓                                    │
│  Context: company, industry, history    │
│    ↓                                    │
│  OpenAI GPT-4 API                       │
│    ↓                                    │
│  Return: subject, body                  │
│                                         │
│  suggestNextAction()                    │
│    ↓                                    │
│  Analyze: status, last contact, score   │
│    ↓                                    │
│  Return: action, priority, date         │
└─────────────────────────────────────────┘
```

### Email Automation Service
```
┌─────────────────────────────────────────┐
│     Email Automation Service            │
│                                         │
│  sendEmail()                            │
│    ↓                                    │
│  Get/Generate Content                   │
│    ↓                                    │
│  Apply HTML Template                    │
│    ↓                                    │
│  Add Tracking Pixel                     │
│    ↓                                    │
│  Send via Nodemailer                    │
│    ↓                                    │
│  Update Lead History                    │
│                                         │
│  sendBulkEmails()                       │
│    ↓                                    │
│  For Each Lead:                         │
│    • Send Email                         │
│    • Wait (delay)                       │
│    • Track Result                       │
│    ↓                                    │
│  Return: sent count, failed count       │
└─────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    SalesLead                            │
├─────────────────────────────────────────────────────────┤
│ _id: ObjectId (Primary Key)                            │
│ companyName: String                                     │
│ contactPerson: String                                   │
│ email: String (Unique, Indexed)                         │
│ phone: String                                           │
│ industry: String                                        │
│ companySize: Enum                                       │
│ status: Enum (Indexed)                                  │
│ priority: Enum (Indexed)                                │
│ source: Enum                                            │
│ budget: Number                                          │
│ notes: String                                           │
│ lastContactDate: Date                                   │
│ nextFollowUpDate: Date (Indexed)                        │
│ aiScore: Number (Indexed)                               │
│ assignedTo: ObjectId → User                             │
│                                                         │
│ callHistory: [                                          │
│   {                                                     │
│     date: Date                                          │
│     duration: Number                                    │
│     summary: String                                     │
│     sentiment: Enum                                     │
│     aiTranscript: String                                │
│     outcome: String                                     │
│   }                                                     │
│ ]                                                       │
│                                                         │
│ emailHistory: [                                         │
│   {                                                     │
│     date: Date                                          │
│     subject: String                                     │
│     body: String                                        │
│     type: Enum                                          │
│     opened: Boolean                                     │
│     clicked: Boolean                                    │
│   }                                                     │
│ ]                                                       │
│                                                         │
│ createdAt: Date (Auto)                                  │
│ updatedAt: Date (Auto)                                  │
└─────────────────────────────────────────────────────────┘
```

---

## API Request/Response Flow

### Example: Create Lead with AI Scoring

```
1. Client Request
   POST /api/sales/leads
   {
     "companyName": "Acme Corp",
     "email": "john@acme.com",
     ...
   }
        ↓
2. Authentication Middleware
   Verify JWT Token
        ↓
3. Controller (createLead)
   Validate Input
        ↓
4. AI Service (scoreLeadQuality)
   Calculate Initial Score
        ↓
5. Database
   Save Lead Document
        ↓
6. Email Service (if requested)
   Send Initial Email
        ↓
7. Response to Client
   {
     "lead": {
       "_id": "...",
       "aiScore": 75,
       ...
     }
   }
```

---

## Scheduler Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Sales Automation Scheduler                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Follow-up Scheduler (Every Hour)               │  │
│  │  • Find leads with nextFollowUpDate <= now      │  │
│  │  • Get AI suggestion                            │  │
│  │  • Send follow-up email                         │  │
│  │  • Update next follow-up date                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Score Update Scheduler (Daily 2 AM)            │  │
│  │  • Find all active leads                        │  │
│  │  • Recalculate AI score for each               │  │
│  │  • Update database                              │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Stale Lead Scheduler (Daily 10 AM)             │  │
│  │  • Find leads inactive 30+ days                 │  │
│  │  • Filter by score >= 50                        │  │
│  │  • Send re-engagement email                     │  │
│  │  • Schedule new follow-up                       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Weekly Summary (Monday 9 AM)                   │  │
│  │  • Count new leads (last 7 days)                │  │
│  │  • Count closed deals                           │  │
│  │  • Sum calls and emails                         │  │
│  │  • Generate report                              │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Security Stack                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: Rate Limiting                                 │
│  • 500 requests per 15 minutes                          │
│  • Prevents abuse                                       │
│                                                         │
│  Layer 2: Authentication                                │
│  • JWT token verification                               │
│  • Required for all protected routes                    │
│                                                         │
│  Layer 3: Authorization                                 │
│  • Role-based access control                            │
│  • Admin/User permissions                               │
│                                                         │
│  Layer 4: Input Validation                              │
│  • Mongoose schema validation                           │
│  • Type checking (TypeScript)                           │
│                                                         │
│  Layer 5: Environment Variables                         │
│  • Secrets in .env file                                 │
│  • Never committed to git                               │
│                                                         │
│  Layer 6: Error Handling                                │
│  • Try-catch blocks                                     │
│  • Sanitized error messages                             │
│  • Detailed logging                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Logging Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Winston Logger                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Console Transport                                      │
│  • Colored output                                       │
│  • Development debugging                                │
│                                                         │
│  File Transport: error.log                              │
│  • Error level and below                                │
│  • 5MB max size                                         │
│  • 5 file rotation                                      │
│                                                         │
│  File Transport: combined.log                           │
│  • All log levels                                       │
│  • 5MB max size                                         │
│  • 5 file rotation                                      │
│                                                         │
│  File Transport: sales.log                              │
│  • Sales-specific logs                                  │
│  • Activity tracking                                    │
│  • 5MB max size                                         │
│  • 5 file rotation                                      │
│                                                         │
│  Format: JSON                                           │
│  • Timestamp                                            │
│  • Level                                                │
│  • Message                                              │
│  • Metadata                                             │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                   (AWS ALB / Nginx)                     │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  App Server  │ │  App Server  │ │  App Server  │
│   Instance   │ │   Instance   │ │   Instance   │
└──────────────┘ └──────────────┘ └──────────────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
        ┌────────────────────────┐
        │   MongoDB Cluster      │
        │   (Replica Set)        │
        └────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   OpenAI     │ │  SMTP/SES    │ │   Redis      │
│   API        │ │  Service     │ │   Cache      │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

This architecture ensures:
✅ Scalability
✅ Reliability
✅ Maintainability
✅ Security
✅ Performance
