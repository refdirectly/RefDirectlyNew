# AI Verification & Payment System - Complete Documentation

## Overview
Automated AI-powered verification system for referrals with intelligent fraud detection, evidence analysis, and automated payment processing with platform fee deduction.

---

## 🎯 Key Features

### 1. AI-Powered Verification
- **Evidence Analysis**: AI analyzes submitted documents (screenshots, offer letters, etc.)
- **Confidence Scoring**: 0-100 score indicating verification confidence
- **Fraud Detection**: Identifies suspicious patterns and red flags
- **Auto-Verification**: High-confidence cases verified automatically
- **Quality Assessment**: Evaluates evidence quality (poor/fair/good/excellent)

### 2. Payment Processing
- **Automatic Calculation**: Platform fee (10%) deducted automatically
- **Payment Breakdown**: Clear display of total, fees, and referrer amount
- **Transaction Tracking**: Unique transaction IDs for all payments
- **Status Management**: Pending → Processing → Completed workflow
- **Refund Support**: Admin can refund payments if needed

### 3. Real-Time Notifications
- **Socket.IO Integration**: Instant notifications to users
- **Email Notifications**: Professional HTML emails for all events
- **Stage Updates**: Notify on verification progress
- **Payment Alerts**: Instant notification when payment processed
- **Action Required**: Alert users when action needed

### 4. Verification Stages
1. **Referral Sent**: Initial stage after referral submission
2. **Interview Scheduled**: Candidate got interview
3. **Offer Received**: Job offer received
4. **Joined**: Candidate joined company
5. **Completed**: Verification complete, payment processed

---

## 📁 Files Created

### Backend (7 files)

1. **`models/ReferralVerification.ts`**
   - Complete verification data model
   - Evidence tracking
   - AI analysis results
   - Payment details
   - Timeline tracking
   - Dispute handling

2. **`services/aiVerificationService.ts`**
   - Evidence analysis with GPT-4
   - Fraud detection algorithms
   - Referral completion verification
   - Notification message generation

3. **`services/paymentProcessingService.ts`**
   - Payment calculation (10% platform fee)
   - Payment processing workflow
   - Refund handling
   - Payment statistics

4. **`services/notificationService.ts`**
   - Socket.IO notifications
   - Email notifications
   - Professional HTML templates
   - Stage-specific messages

5. **`controllers/verificationController.ts`**
   - Create verification
   - Submit evidence
   - Update stages
   - Process payments
   - Handle disputes
   - Admin manual review

6. **`routes/verification.ts`**
   - All API endpoints
   - Authentication middleware
   - Admin-only routes

7. **`server.ts`** (Updated)
   - Added verification routes

### Frontend (2 files)

8. **`pages/VerificationDashboard.tsx`**
   - Complete verification UI
   - Evidence upload
   - AI analysis display
   - Payment breakdown
   - Timeline tracking
   - Real-time updates

9. **`App.tsx`** (Updated)
   - Added verification routes for seekers and referrers

---

## 🔄 Verification Workflow

### Step 1: Create Verification
```
Referral Created → Verification Record Created
- Payment breakdown calculated
- Initial timeline entry
- Status: pending
```

### Step 2: Submit Evidence
```
User Uploads Evidence → AI Analysis
- Document type recorded
- AI analyzes quality and authenticity
- Confidence score calculated
- Fraud risk assessed
- Recommendations generated
```

### Step 3: Auto-Verification (if applicable)
```
High Confidence (≥85%) + Low Fraud Risk
→ Auto-Verified
→ Ready for Payment
```

### Step 4: Manual Review (if needed)
```
Low Confidence or High Fraud Risk
→ Manual Review Required
→ Admin Approval Needed
```

### Step 5: Payment Processing
```
Verified → Calculate Payment
→ Deduct Platform Fee (10%)
→ Process Payment
→ Send Notifications
→ Update Status: Completed
```

---

## 💰 Payment Calculation

### Formula
```
Total Amount: $1000 (example)
Platform Fee: $1000 × 10% = $100
Referrer Receives: $1000 - $100 = $900
```

### Example Breakdown
```javascript
{
  totalAmount: 1000,
  platformFee: 100,
  platformFeePercentage: 10,
  referrerAmount: 900
}
```

---

## 🤖 AI Analysis Details

### Evidence Analysis
AI evaluates:
- Number of documents submitted
- Types of evidence (offer letter > screenshot)
- Who uploaded (both parties = better)
- Document quality indicators
- Timeline consistency

### Confidence Score Ranges
- **85-100**: Auto-verify, high confidence
- **70-84**: Good, may auto-verify
- **50-69**: Medium, manual review recommended
- **0-49**: Low, manual review required

### Fraud Risk Levels
- **Low**: Safe to proceed
- **Medium**: Additional verification recommended
- **High**: Manual review required, potential fraud

---

## 📡 API Endpoints

### Create Verification
```http
POST /api/verification/create
Authorization: Bearer {token}

{
  "referralId": "referral_id_here"
}
```

### Submit Evidence
```http
POST /api/verification/:verificationId/evidence
Authorization: Bearer {token}

{
  "type": "offer_letter",
  "url": "https://...",
  "uploadedBy": "seeker"
}
```

### Update Stage
```http
PUT /api/verification/:verificationId/stage
Authorization: Bearer {token}

{
  "stage": "offer_received",
  "notes": "Received offer from company"
}
```

### Verify and Process Payment
```http
POST /api/verification/:verificationId/verify-and-pay
Authorization: Bearer {token}
```

### Get Verification
```http
GET /api/verification/:verificationId
Authorization: Bearer {token}
```

### Get User Verifications
```http
GET /api/verification/user/all?role=seeker
Authorization: Bearer {token}
```

### Raise Dispute
```http
POST /api/verification/:verificationId/dispute
Authorization: Bearer {token}

{
  "reason": "Evidence not accepted"
}
```

### Admin: Manual Review
```http
POST /api/verification/:verificationId/manual-review
Authorization: Bearer {token}

{
  "approved": true,
  "notes": "Verified manually"
}
```

### Admin: Get Statistics
```http
GET /api/verification/admin/stats
Authorization: Bearer {token}
```

---

## 🔔 Notification Types

### 1. Evidence Submitted
**Trigger**: User uploads evidence  
**Recipients**: Other party  
**Message**: "New evidence has been uploaded"

### 2. Verification Stage Update
**Trigger**: Stage changes  
**Recipients**: Both parties  
**Message**: Stage-specific message

### 3. Payment Processed
**Trigger**: Payment completed  
**Recipients**: Both parties  
**Message**: "Payment of $X processed!"

### 4. Action Required
**Trigger**: Manual review needed, dispute raised  
**Recipients**: Relevant party  
**Message**: Specific action needed

### 5. Auto-Verified
**Trigger**: AI auto-verification  
**Recipients**: Both parties  
**Message**: "Referral verified automatically!"

---

## 🎨 Frontend Features

### Verification Cards
- Status badges (color-coded)
- AI confidence display
- Evidence count
- Payment amount
- Auto-verified indicator
- Manual review warning

### Detailed View
- AI Analysis section with confidence, fraud risk, quality
- Payment breakdown with platform fee
- Evidence list with upload history
- Timeline of all events
- Action buttons (upload, update, pay)

### Evidence Upload Modal
- Select evidence type
- Enter document URL
- Submit with loading state
- Real-time AI analysis

---

## 🔒 Security Features

### Authentication
- JWT token required for all endpoints
- User verification (must be part of referral)
- Admin-only routes protected

### Fraud Prevention
- AI fraud detection
- Pattern analysis
- Manual review for suspicious cases
- Dispute mechanism

### Payment Security
- Transaction IDs for tracking
- Status validation before processing
- Refund capability
- Audit trail in timeline

---

## 📊 Statistics & Analytics

### Verification Stats
- Total verifications by status
- Total by stage
- Auto-verified count
- Manual review count
- Average AI confidence

### Payment Stats
- Total processed
- Total platform fees collected
- Total referrer payments
- Pending payments count
- Completed payments count

---

## 🚀 Setup Instructions

### 1. Environment Variables
Already configured in `.env.example`:
```env
OPENAI_API_KEY=your-key
SMTP_USER=your-email
SMTP_PASS=your-password
```

### 2. Start Server
```bash
cd backend
npm run dev
```

### 3. Access Dashboard
- Seeker: `http://localhost:5173/seeker/verification`
- Referrer: `http://localhost:5173/referrer/verification`

---

## 💡 Usage Examples

### Example 1: Complete Verification Flow

```javascript
// 1. Create verification
POST /api/verification/create
{ "referralId": "ref123" }

// 2. Seeker uploads offer letter
POST /api/verification/ver123/evidence
{
  "type": "offer_letter",
  "url": "https://...",
  "uploadedBy": "seeker"
}

// 3. Referrer uploads confirmation
POST /api/verification/ver123/evidence
{
  "type": "screenshot",
  "url": "https://...",
  "uploadedBy": "referrer"
}

// 4. Update to joined stage
PUT /api/verification/ver123/stage
{
  "stage": "joined",
  "notes": "Started on Monday"
}

// 5. Process payment
POST /api/verification/ver123/verify-and-pay
// AI verifies and processes payment automatically
```

### Example 2: Handle Dispute

```javascript
// Raise dispute
POST /api/verification/ver123/dispute
{
  "reason": "Candidate did not actually join"
}

// Admin reviews
POST /api/verification/ver123/manual-review
{
  "approved": false,
  "notes": "Evidence insufficient, refunding"
}
```

---

## 🎯 Best Practices

### For Users
1. Upload clear, high-quality evidence
2. Submit multiple types of documents
3. Update stages promptly
4. Both parties should upload evidence
5. Communicate through platform

### For Admins
1. Review high-risk cases carefully
2. Check evidence quality
3. Verify timeline consistency
4. Document decisions in notes
5. Handle disputes fairly

---

## 🐛 Troubleshooting

### AI Analysis Not Working
- Check OPENAI_API_KEY is set
- Verify API quota
- Check logs for errors

### Notifications Not Received
- Verify Socket.IO connection
- Check email SMTP settings
- Ensure user is authenticated

### Payment Not Processing
- Verify verification is in 'verified' status
- Check payment status is 'pending'
- Review AI confidence score
- Check logs for errors

---

## 📈 Future Enhancements

- [ ] Stripe/PayPal integration
- [ ] Document OCR for automatic verification
- [ ] Video evidence support
- [ ] Multi-currency support
- [ ] Escrow system
- [ ] Automated reminders
- [ ] Mobile app notifications
- [ ] Blockchain verification

---

## 📞 Support

**Access Points:**
- Seeker Dashboard: `/seeker/verification`
- Referrer Dashboard: `/referrer/verification`
- Admin Panel: `/admin/dashboard`

**Logs:**
- `backend/logs/combined.log`
- `backend/logs/error.log`

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**AI Model:** GPT-4  
**Platform Fee:** 10%
