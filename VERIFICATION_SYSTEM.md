# Employee Verification System - Production Level

## Overview
Multi-method employee verification system with auto-approval scoring for companies that don't provide corporate email addresses.

## Verification Methods

### 1. **Work Email Verification** (40 points)
**Best for:** Companies with corporate email domains

**Process:**
- User enters work email (e.g., john@google.com)
- System validates email domain against company
- OTP sent to work email
- User verifies OTP
- Auto-approved if domain matches

**Supported Companies:**
- Google (@google.com, @alphabet.com)
- Microsoft (@microsoft.com)
- Amazon (@amazon.com, @aws.amazon.com)
- Meta (@meta.com, @fb.com, @facebook.com)
- Apple (@apple.com)
- Netflix, Tesla, Adobe, Salesforce, LinkedIn, Uber, Airbnb, Spotify
- TCS, Infosys, Wipro, HCL, Tech Mahindra, Cognizant, Accenture, Capgemini

**API Endpoint:**
```
POST /api/verification/email/send
Body: { workEmail, company }

POST /api/verification/email/verify
Body: { verificationId, otp }
```

---

### 2. **GitHub Verification** (20 points)
**Best for:** Tech companies, startups, developers

**Process:**
- User provides GitHub username
- System fetches public profile via GitHub API
- Checks if company field matches target company
- Auto-approved if company matches

**Example:**
```javascript
// GitHub profile shows: "Company: @google"
// Target company: "Google"
// Result: Auto-approved ✅
```

**API Endpoint:**
```
POST /api/verification/github
Body: { githubUsername, company }
```

**Real GitHub API Integration:**
```javascript
const response = await axios.get(`https://api.github.com/users/${username}`);
// Returns: { company: "@google", email: "john@google.com", ... }
```

---

### 3. **LinkedIn Verification** (30 points)
**Best for:** All professionals with LinkedIn profiles

**Process:**
- User provides LinkedIn profile URL
- System extracts username
- Admin manually verifies current position matches company
- OR integrate LinkedIn API for auto-verification

**API Endpoint:**
```
POST /api/verification/linkedin
Body: { linkedinProfile, company }
```

**Future Enhancement:**
- LinkedIn OAuth integration
- Auto-fetch current position from LinkedIn API
- Match company name automatically

---

### 4. **Document Verification** (10 points)
**Best for:** Companies without email domains, contractors, freelancers

**Documents Accepted:**
- Employee ID Card
- Offer Letter
- Recent Payslip (last 3 months)
- Government ID with company badge

**Process:**
- User uploads documents (max 10MB each)
- Admin reviews within 24-48 hours
- Approved if documents are valid

**API Endpoint:**
```
POST /api/verification/documents
FormData: {
  company,
  employeeId,
  department,
  designation,
  joiningDate,
  files: [employeeIdCard, offerLetter, payslip]
}
```

---

## Auto-Approval Scoring System

### Scoring Logic
```javascript
Email Verified:     40 points
LinkedIn Verified:  30 points
GitHub Verified:    20 points
Documents Uploaded: 10 points
----------------------------
Total:             100 points
```

### Auto-Approval Rules
- **Score >= 70**: Auto-approved ✅
- **Score < 70**: Manual admin review required ⏳

### Examples

**Scenario 1: Tech Employee with GitHub**
```
✅ Work Email Verified: 40 points
✅ GitHub Verified:     20 points
❌ LinkedIn:            0 points
❌ Documents:           0 points
-----------------------------------
Total: 60 points → Manual Review
```

**Scenario 2: Professional with LinkedIn**
```
✅ Work Email Verified: 40 points
✅ LinkedIn Verified:   30 points
❌ GitHub:              0 points
❌ Documents:           0 points
-----------------------------------
Total: 70 points → AUTO-APPROVED ✅
```

**Scenario 3: Contractor without Email**
```
❌ Work Email:          0 points
✅ LinkedIn Verified:   30 points
✅ GitHub Verified:     20 points
✅ Documents Uploaded:  10 points
-----------------------------------
Total: 60 points → Manual Review
```

---

## API Endpoints Summary

### Referrer Endpoints
```
POST   /api/verification/email/send       - Send work email OTP
POST   /api/verification/email/verify     - Verify work email OTP
POST   /api/verification/linkedin         - Submit LinkedIn profile
POST   /api/verification/github           - Verify GitHub profile
POST   /api/verification/documents        - Upload documents
GET    /api/verification/status           - Get verification status
```

### Admin Endpoints
```
GET    /api/verification/pending          - Get pending verifications
PUT    /api/verification/:id/review       - Approve/Reject verification
```

---

## Database Schema

```typescript
interface IEmployeeVerification {
  userId: ObjectId;
  company: string;
  verificationType: 'email' | 'document' | 'linkedin' | 'github' | 'manual';
  status: 'pending' | 'approved' | 'rejected';
  
  // Email verification
  workEmail?: string;
  emailVerified?: boolean;
  
  // Document verification
  documents?: {
    idCard?: string;
    offerLetter?: string;
    payslip?: string;
    employeeIdCard?: string;
  };
  
  // LinkedIn verification
  linkedinProfile?: string;
  linkedinVerified?: boolean;
  linkedinData?: {
    currentPosition?: string;
    currentCompany?: string;
    verified?: boolean;
  };
  
  // GitHub verification
  githubUsername?: string;
  githubVerified?: boolean;
  githubData?: {
    company?: string;
    email?: string;
    verified?: boolean;
  };
  
  // Metadata
  verificationScore: number; // 0-100
  autoVerified: boolean;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: ObjectId;
  rejectionReason?: string;
}
```

---

## Security Features

1. **Email Domain Validation**
   - Checks if email domain matches company
   - Prevents fake emails

2. **Document Upload Security**
   - Max file size: 10MB
   - Allowed formats: JPG, PNG, PDF
   - Secure filename generation with crypto

3. **Rate Limiting**
   - Prevents spam verification requests
   - Max 5 attempts per hour

4. **Admin Review**
   - Manual review for low-score verifications
   - Rejection with reason tracking

---

## Frontend Integration Example

```typescript
// Send work email verification
const sendEmailVerification = async (workEmail: string, company: string) => {
  const response = await fetch('/api/verification/email/send', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ workEmail, company })
  });
  return response.json();
};

// Verify GitHub
const verifyGitHub = async (githubUsername: string, company: string) => {
  const response = await fetch('/api/verification/github', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ githubUsername, company })
  });
  return response.json();
};

// Upload documents
const uploadDocuments = async (formData: FormData) => {
  const response = await fetch('/api/verification/documents', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};
```

---

## Production Deployment Checklist

- [x] Email domain validation
- [x] GitHub API integration
- [x] Auto-approval scoring system
- [x] Document upload with security
- [x] Admin review panel
- [ ] LinkedIn OAuth integration
- [ ] OCR for document verification
- [ ] Webhook notifications
- [ ] Analytics dashboard

---

## Future Enhancements

1. **LinkedIn OAuth**
   - Auto-fetch current employment
   - Verify company match

2. **OCR Document Verification**
   - Extract text from ID cards
   - Validate company name automatically

3. **Video Verification**
   - Live video call with admin
   - Show employee ID on camera

4. **Blockchain Verification**
   - Immutable verification records
   - Decentralized trust system

5. **AI-Powered Fraud Detection**
   - Detect fake documents
   - Flag suspicious patterns

---

## Support

For issues or questions:
- Email: support@refdirectly.com
- Docs: https://docs.refdirectly.com/verification
