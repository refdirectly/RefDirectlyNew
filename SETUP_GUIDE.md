# Quick Setup & Testing Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Ensure your `.env` file has:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Start Server
```bash
npm run dev
```

---

## 🧪 Testing the New Features

### Test 1: Search Referrers by Company
```bash
# Search for Google referrers with React skills
curl "http://localhost:3001/api/company/referrers/search?company=Google&skills=React,JavaScript"

# Expected Response:
{
  "success": true,
  "count": 5,
  "referrers": [...]
}
```

### Test 2: Get Company Statistics
```bash
curl "http://localhost:3001/api/company/companies/stats"

# Expected Response:
{
  "success": true,
  "companies": [
    {
      "company": "Google",
      "referrerCount": 15,
      "hrCount": 3
    }
  ]
}
```

### Test 3: Smart Matching
```bash
# Get matched referrers for a job
curl "http://localhost:3001/api/matching/referrers?company=Amazon&skills=Python,AWS,Docker&experience=5&limit=10"

# Expected Response:
{
  "success": true,
  "count": 10,
  "matches": [
    {
      "referrer": {...},
      "matchScore": 85,
      "skillMatch": 80,
      "experienceMatch": true,
      "companyMatch": true
    }
  ]
}
```

### Test 4: Check Referrer Availability
```bash
# Replace {referrerId} with actual ID
curl "http://localhost:3001/api/matching/referrers/{referrerId}/availability"

# Expected Response:
{
  "success": true,
  "available": true,
  "activeReferrals": 3,
  "maxCapacity": 10
}
```

### Test 5: Add Referrer to Company (Authenticated)
```bash
# First, login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Use the token to add referrer
curl -X POST http://localhost:3001/api/company/referrers/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "company": "Microsoft",
    "roles": ["Software Engineer"],
    "verified": false
  }'
```

### Test 6: Search HRs by Company
```bash
curl "http://localhost:3001/api/company/hrs/search?company=Google"

# Expected Response:
{
  "success": true,
  "count": 2,
  "hrs": [...]
}
```

---

## 📊 Database Seeding (Optional)

### Create Test Referrers
```javascript
// Run in MongoDB shell or create a script
db.users.insertMany([
  {
    role: "referrer",
    name: "John Doe",
    email: "john@example.com",
    passwordHash: "hashed_password",
    verified: true,
    companies: [
      {
        name: "Google",
        verified: true,
        roles: ["Software Engineer", "Senior Engineer"]
      }
    ],
    skills: ["JavaScript", "React", "Node.js", "Python"],
    experience: 5,
    pricePerReferral: 5000,
    rating: 4.8
  },
  {
    role: "referrer",
    name: "Jane Smith",
    email: "jane@example.com",
    passwordHash: "hashed_password",
    verified: true,
    companies: [
      {
        name: "Amazon",
        verified: true,
        roles: ["SDE II"]
      }
    ],
    skills: ["Python", "AWS", "Docker", "Kubernetes"],
    experience: 7,
    pricePerReferral: 7000,
    rating: 4.9
  }
]);
```

---

## 🔍 Debugging Tips

### Check Server Logs
```bash
# Watch logs in real-time
tail -f server.log

# Or use nodemon output
npm run dev
```

### Common Issues

1. **"Company name required" error**
   - Ensure `company` query parameter is provided
   - Check URL encoding for company names with spaces

2. **Empty referrers array**
   - Verify referrers exist in database
   - Check if referrers are verified
   - Ensure company name matches exactly (case-insensitive)

3. **Authentication errors**
   - Verify JWT token is valid
   - Check Authorization header format: `Bearer <token>`
   - Ensure user has appropriate role

4. **Match score is 0**
   - Check if skills array is populated
   - Verify experience field exists
   - Ensure company association is verified

---

## 📈 Performance Testing

### Load Test with Apache Bench
```bash
# Test search endpoint
ab -n 1000 -c 10 "http://localhost:3001/api/company/referrers/search?company=Google"

# Test matching endpoint
ab -n 500 -c 5 "http://localhost:3001/api/matching/referrers?company=Amazon&skills=Python"
```

### Expected Performance
- Search queries: < 100ms
- Matching queries: < 200ms
- Database queries: < 50ms

---

## 🎯 Integration with Frontend

### Example React Hook
```typescript
// useReferrerSearch.ts
import { useState, useEffect } from 'react';

export const useReferrerSearch = (company: string, skills: string[]) => {
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReferrers = async () => {
      setLoading(true);
      try {
        const skillsParam = skills.join(',');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/company/referrers/search?company=${company}&skills=${skillsParam}`
        );
        const data = await response.json();
        setReferrers(data.referrers);
      } catch (error) {
        console.error('Failed to fetch referrers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (company) {
      fetchReferrers();
    }
  }, [company, skills]);

  return { referrers, loading };
};
```

### Example Usage in Component
```typescript
function JobDetails({ job }) {
  const { referrers, loading } = useReferrerSearch(
    job.company,
    job.requiredSkills
  );

  return (
    <div>
      <h2>{job.title} at {job.company}</h2>
      <h3>Available Referrers ({referrers.length})</h3>
      {loading ? (
        <p>Loading referrers...</p>
      ) : (
        <ul>
          {referrers.map(ref => (
            <li key={ref._id}>
              {ref.name} - Rating: {ref.rating} - ₹{ref.pricePerReferral}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection (sanitize inputs)
- [ ] HTTPS in production
- [ ] Environment variables secured

---

## 📝 API Response Examples

### Successful Search
```json
{
  "success": true,
  "count": 3,
  "referrers": [
    {
      "_id": "60d5ec49f1b2c8b1f8e4e1a1",
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

### Error Response
```json
{
  "success": false,
  "message": "Company name required"
}
```

### Match Response
```json
{
  "success": true,
  "count": 5,
  "matches": [
    {
      "referrer": {
        "_id": "...",
        "name": "Jane Smith",
        "rating": 4.9
      },
      "matchScore": 92,
      "skillMatch": 90,
      "experienceMatch": true,
      "companyMatch": true
    }
  ]
}
```

---

## 🎓 Learning Resources

### Understanding the Matching Algorithm
1. Skill similarity uses Jaccard index
2. Experience matching allows ±2 years flexibility
3. Weighted scoring prioritizes skills (60%)

### Database Queries
- Uses MongoDB aggregation for statistics
- Regex for case-insensitive company search
- Indexed fields for performance

### Best Practices
- Always validate input parameters
- Use pagination for large result sets
- Cache frequently accessed data
- Log errors for debugging
- Return consistent response format

---

## 🚨 Troubleshooting

### Server won't start
```bash
# Check if port is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Check MongoDB connection
mongosh $MONGO_URI
```

### Database connection issues
```bash
# Test MongoDB connection
mongosh "your_mongodb_uri"

# Check network access
ping your_mongodb_host
```

### API returns 500 errors
```bash
# Check server logs
tail -f logs/error.log

# Enable debug mode
DEBUG=* npm run dev
```

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] All routes registered
- [ ] Search endpoints return data
- [ ] Matching algorithm works
- [ ] Authentication works
- [ ] Error handling works

---

## 📞 Next Steps

1. Test all endpoints with Postman/curl
2. Integrate with frontend
3. Add more test data
4. Monitor performance
5. Set up production environment
6. Configure Redis caching
7. Add PostgreSQL (if needed)
8. Set up scheduled jobs

---

**Happy Testing! 🎉**
