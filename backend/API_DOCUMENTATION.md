# Company Referrer & HR API Documentation

## Base URL
`/api/company`

---

## Endpoints

### 1. Search Referrers by Company
**GET** `/referrers/search`

Search for verified referrers working at a specific company with optional filters.

**Query Parameters:**
- `company` (required): Company name
- `skills` (optional): Comma-separated skills (e.g., "JavaScript,React,Node.js")
- `minExperience` (optional): Minimum years of experience
- `maxExperience` (optional): Maximum years of experience

**Response:**
```json
{
  "success": true,
  "count": 5,
  "referrers": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "companies": [
        {
          "name": "Google",
          "verified": true,
          "roles": ["Software Engineer"]
        }
      ],
      "pricePerReferral": 5000,
      "rating": 4.8,
      "experience": 5,
      "skills": ["JavaScript", "React", "Node.js"],
      "currentTitle": "Senior Software Engineer"
    }
  ]
}
```

---

### 2. Search HRs by Company
**GET** `/hrs/search`

Find HRs assigned to a specific company.

**Query Parameters:**
- `company` (required): Company name

**Response:**
```json
{
  "success": true,
  "count": 2,
  "hrs": [
    {
      "_id": "...",
      "name": "Jane Smith",
      "email": "jane@company.com",
      "currentCompany": "Google",
      "pricePerSession": 2000,
      "rating": 4.9,
      "isActive": true
    }
  ]
}
```

---

### 3. Get Companies with Stats
**GET** `/companies/stats`

Get all companies with referrer and HR counts.

**Response:**
```json
{
  "success": true,
  "companies": [
    {
      "company": "Google",
      "referrerCount": 15,
      "hrCount": 3
    },
    {
      "company": "Amazon",
      "referrerCount": 12,
      "hrCount": 2
    }
  ]
}
```

---

### 4. Add Referrer to Company
**POST** `/referrers/add` 🔒 (Authenticated)

Add a referrer to a company.

**Request Body:**
```json
{
  "userId": "user_id",
  "company": "Google",
  "roles": ["Software Engineer", "Tech Lead"],
  "verified": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referrer added to company",
  "user": { ... }
}
```

---

### 5. Add HR to Company
**POST** `/hrs/add` 🔒 (Authenticated)

Assign an HR to a company.

**Request Body:**
```json
{
  "hrId": "hr_user_id",
  "company": "Google"
}
```

**Response:**
```json
{
  "success": true,
  "message": "HR added to company",
  "companyHR": { ... }
}
```

---

### 6. Verify Referrer for Company
**POST** `/referrers/verify` 🔒 (Authenticated)

Verify a referrer's association with a company.

**Request Body:**
```json
{
  "userId": "user_id",
  "company": "Google"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referrer verified for company",
  "user": { ... }
}
```

---

## Smart Matching API

### Base URL
`/api/matching`

### 1. Get Matched Referrers
**GET** `/referrers`

Get smart-matched referrers based on job requirements.

**Query Parameters:**
- `company` (required): Company name
- `skills` (optional): Comma-separated skills
- `experience` (optional): Required years of experience
- `limit` (optional): Max results (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "matches": [
    {
      "referrer": { ... },
      "matchScore": 85,
      "skillMatch": 80,
      "experienceMatch": true,
      "companyMatch": true
    }
  ]
}
```

**Match Score Calculation:**
- 60% weight on skill similarity
- 30% weight on experience match
- 10% weight on referrer rating

---

### 2. Check Referrer Availability
**GET** `/referrers/:referrerId/availability`

Check if a referrer is available to take new referrals.

**Response:**
```json
{
  "success": true,
  "available": true,
  "activeReferrals": 3,
  "maxCapacity": 10
}
```

---

### 3. Get Best Referrer
**POST** `/best-referrer`

Find the single best-matched referrer for specific criteria.

**Request Body:**
```json
{
  "company": "Google",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": 5
}
```

**Response:**
```json
{
  "success": true,
  "referrer": { ... },
  "matchScore": 92,
  "skillMatch": 90,
  "experienceMatch": true
}
```

---

## Usage Examples

### Example 1: Find Referrers at Google with React Skills
```bash
GET /api/company/referrers/search?company=Google&skills=React,JavaScript&minExperience=3
```

### Example 2: Get Top 5 Matched Referrers
```bash
GET /api/matching/referrers?company=Amazon&skills=Python,AWS&experience=5&limit=5
```

### Example 3: Add Referrer to Company
```bash
POST /api/company/referrers/add
Authorization: Bearer <token>

{
  "userId": "60d5ec49f1b2c8b1f8e4e1a1",
  "company": "Microsoft",
  "roles": ["Software Engineer"],
  "verified": false
}
```

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `400`: Bad Request (missing required parameters)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `500`: Internal Server Error
