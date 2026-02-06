# HR Chat System - Quick Reference Card

## 🎯 System Overview
Auto-assign company HR when referral is accepted → Enable private chat between seeker and HR

---

## 👥 Test Accounts Created

### Company HR Users (10 companies)
```
Email: hr@google.com      | Password: hr123456
Email: hr@amazon.com      | Password: hr123456
Email: hr@microsoft.com   | Password: hr123456
Email: hr@meta.com        | Password: hr123456
Email: hr@apple.com       | Password: hr123456
Email: hr@netflix.com     | Password: hr123456
Email: hr@tesla.com       | Password: hr123456
Email: hr@uber.com        | Password: hr123456
Email: hr@airbnb.com      | Password: hr123456
Email: hr@spotify.com     | Password: hr123456
```

---

## 🔄 Quick Test Flow

### 1. Job Seeker
```
1. Register at /auth/signup/seeker
2. Login
3. Go to /find-referrer
4. Request referral for "Google"
5. Wait for acceptance
```

### 2. Referrer
```
1. Register at /auth/referrer/signup (use @google.com email)
2. Login
3. Go to /referrer/dashboard
4. Accept the referral
   → System auto-assigns Google HR
```

### 3. Job Seeker (Chat)
```
1. Go to /dashboard
2. See "Company HR" button (green)
3. Click → Opens chat with Google HR
4. Send message
```

### 4. Company HR
```
1. Login with hr@google.com / hr123456
2. Go to /hr/dashboard
3. See assigned candidate
4. Click "Chat with Candidate"
5. Reply to message
```

---

## 📡 API Quick Reference

### Accept Referral (Auto-assigns HR)
```bash
PATCH /api/referrals/:id/accept
Authorization: Bearer <referrer-token>

# Response includes:
{
  companyHRId: "...",
  hrChatEnabled: true
}
```

### Start HR Chat
```bash
POST /api/referrals-enhanced/hr-chat/start
Authorization: Bearer <seeker-token>
Body: { "referralId": "..." }
```

### Send Message
```bash
POST /api/referrals-enhanced/hr-chat/message
Authorization: Bearer <token>
Body: {
  "referralId": "...",
  "content": "Hello!"
}
```

### Get HR's Referrals
```bash
GET /api/referrals-enhanced/hr
Authorization: Bearer <hr-token>
```

---

## 🔍 Database Queries

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

| Issue | Solution |
|-------|----------|
| No HR assigned | Run: `npx ts-node src/scripts/seedCompanyHRUsers.ts` |
| Chat button not showing | Check `hrChatEnabled` is true in referral |
| Socket.IO not connecting | Verify JWT token and CORS settings |
| Access denied | Verify user role and company match |

---

## 📂 Key Files

### Backend
- `models/ReferralChat.ts` - Chat model
- `controllers/referralEnhancedController.ts` - Main logic
- `sockets/hrChat.ts` - Real-time handler
- `scripts/seedCompanyHRUsers.ts` - Seed script

### Frontend
- `pages/CompanyHRDashboard.tsx` - HR dashboard
- `pages/ReferralHRChatPage.tsx` - Chat page
- `pages/DashboardPage.tsx` - Seeker dashboard

---

## 🚀 Routes

| Route | Description |
|-------|-------------|
| `/hr/dashboard` | Company HR dashboard |
| `/referral-hr-chat/:referralId` | HR chat page |
| `/dashboard` | Job seeker dashboard |

---

## ✅ Success Checklist

- [x] TypeScript errors fixed
- [x] HR users seeded (10 companies)
- [x] Auto-assign logic implemented
- [x] Chat rooms created automatically
- [x] Real-time messaging works
- [x] Security enforced
- [x] Documentation complete

---

## 📞 Quick Help

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Seed HR Users:**
```bash
cd backend
npx ts-node src/scripts/seedCompanyHRUsers.ts
```

---

## 🎉 Status: READY TO TEST!

All systems operational. Start testing with the flow above.

**Documentation:** See `HR_CHAT_QUICKSTART.md` for detailed guide.
