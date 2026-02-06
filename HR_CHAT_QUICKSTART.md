# HR Chat Flow - Quick Start Guide

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Seed Test HR Users

```bash
cd backend
npx ts-node src/scripts/seedCompanyHRUsers.ts
```

This creates HR users for:
- Google (hr@google.com)
- Amazon (hr@amazon.com)
- Microsoft (hr@microsoft.com)
- Meta (hr@meta.com)
- Apple (hr@apple.com)
- Netflix (hr@netflix.com)
- Tesla (hr@tesla.com)
- Uber (hr@uber.com)
- Airbnb (hr@airbnb.com)
- Spotify (hr@spotify.com)

**Default Password:** `hr123456`

### 3. Start Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🧪 Testing the Flow

### Step 1: Create Test Users

#### Job Seeker
1. Go to `/auth/signup/seeker`
2. Register as job seeker
3. Login

#### Referrer
1. Go to `/auth/referrer/signup`
2. Register with company email (e.g., john@google.com)
3. Set company as "Google"
4. Login

### Step 2: Request Referral

1. **As Job Seeker:**
   - Go to `/find-referrer`
   - Search for "Google"
   - Find a referrer
   - Click "Request Referral"
   - Fill in details
   - Submit request

### Step 3: Accept Referral

1. **As Referrer:**
   - Go to `/referrer/dashboard`
   - See pending request
   - Click "Accept"
   - ✅ System auto-assigns Google HR

### Step 4: Chat with HR

1. **As Job Seeker:**
   - Go to `/dashboard`
   - See "Company HR" button (green)
   - Click button
   - Start chatting with Google HR

2. **As Company HR:**
   - Login with `hr@google.com` / `hr123456`
   - Go to `/hr/dashboard`
   - See assigned candidate
   - Click "Chat with Candidate"
   - Start conversation

---

## 🔍 Verification Checklist

### Backend
- [ ] HR users created in database
- [ ] Referral model has `companyHRId` and `hrChatEnabled` fields
- [ ] User model has `isActive` and `company` fields
- [ ] Socket.IO HR chat handler registered
- [ ] Routes accessible at `/api/referrals-enhanced/*`

### Frontend
- [ ] Company HR Dashboard accessible at `/hr/dashboard`
- [ ] HR Chat page accessible at `/referral-hr-chat/:referralId`
- [ ] Job Seeker dashboard shows "Company HR" button when referral accepted
- [ ] Real-time messaging works

### Security
- [ ] JWT authentication on all endpoints
- [ ] Only participants can access chat
- [ ] HR can only see their company's referrals
- [ ] Cross-company access blocked

---

## 📊 Database Queries for Testing

### Check HR Users
```javascript
db.users.find({ role: 'company_hr' })
```

### Check Referrals with HR
```javascript
db.referrals.find({ 
  hrChatEnabled: true,
  companyHRId: { $exists: true }
})
```

### Check Chat Rooms
```javascript
db.referralchats.find({})
```

---

## 🐛 Common Issues

### Issue: No HR Assigned
**Cause:** No active HR for that company
**Fix:** Run seed script or create HR manually

### Issue: Chat Button Not Showing
**Cause:** `hrChatEnabled` is false
**Fix:** Check if HR was assigned when referral was accepted

### Issue: Socket.IO Not Connecting
**Cause:** CORS or token issue
**Fix:** Check FRONTEND_URL in .env and JWT token

---

## 📱 API Testing with Postman

### 1. Login as HR
```
POST /api/auth/login
{
  "email": "hr@google.com",
  "password": "hr123456"
}
```

### 2. Get Assigned Referrals
```
GET /api/referrals-enhanced/hr
Authorization: Bearer <token>
```

### 3. Get Active Chats
```
GET /api/referrals-enhanced/hr-chat/chats
Authorization: Bearer <token>
```

### 4. Send Message
```
POST /api/referrals-enhanced/hr-chat/message
Authorization: Bearer <token>
{
  "referralId": "...",
  "content": "Hello! How can I help you?"
}
```

---

## 🎯 Success Criteria

✅ HR auto-assigned when referral accepted
✅ Chat room created automatically
✅ Job seeker can chat with assigned HR
✅ HR can see all assigned candidates
✅ Real-time messaging works
✅ Security rules enforced
✅ No cross-company access

---

## 📞 Support

For issues or questions:
1. Check `HR_CHAT_FLOW_SYSTEM.md` for detailed documentation
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify database state with queries above

---

**Ready to test!** 🚀
