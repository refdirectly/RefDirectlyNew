# HR Chat Flow - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend Files Created/Modified
- [x] `/backend/src/models/User.ts` - Enhanced
- [x] `/backend/src/models/Referral.ts` - Enhanced
- [x] `/backend/src/models/ReferralChat.ts` - NEW
- [x] `/backend/src/controllers/referralController.ts` - Updated
- [x] `/backend/src/controllers/referralEnhancedController.ts` - NEW
- [x] `/backend/src/routes/referralEnhanced.ts` - NEW
- [x] `/backend/src/sockets/hrChat.ts` - NEW
- [x] `/backend/src/scripts/seedCompanyHRUsers.ts` - NEW
- [x] `/backend/src/server.ts` - Updated

### Frontend Files Created/Modified
- [x] `/frontend/src/pages/CompanyHRDashboard.tsx` - NEW
- [x] `/frontend/src/pages/DashboardPage.tsx` - Updated
- [x] `/frontend/src/App.tsx` - Updated

### Documentation Files
- [x] `HR_CHAT_FLOW_SYSTEM.md` - Complete technical docs
- [x] `HR_CHAT_QUICKSTART.md` - Quick start guide
- [x] `HR_CHAT_FLOW_DIAGRAM.md` - Visual diagrams
- [x] `IMPLEMENTATION_SUMMARY.md` - Implementation summary
- [x] `PROJECT_SUMMARY.md` - Updated
- [x] This checklist

---

## 🚀 Deployment Steps

### Step 1: Backend Deployment

```bash
# 1. Pull latest code
cd /Users/surajrawat/Downloads/ReferAI/backend
git pull origin main

# 2. Install dependencies
npm install

# 3. Compile TypeScript
npm run build

# 4. Seed HR users (PRODUCTION)
npx ts-node src/scripts/seedCompanyHRUsers.ts

# 5. Restart server
pm2 restart backend
# OR
npm start
```

### Step 2: Frontend Deployment

```bash
# 1. Pull latest code
cd /Users/surajrawat/Downloads/ReferAI/frontend
git pull origin main

# 2. Install dependencies
npm install

# 3. Build for production
npm run build

# 4. Deploy dist/ folder to hosting
# (Netlify, Vercel, or your hosting provider)
```

### Step 3: Database Migration

```bash
# Connect to MongoDB
mongo <your-connection-string>

# Add indexes for performance
db.users.createIndex({ role: 1, company: 1, isActive: 1 })
db.referrals.createIndex({ company: 1, status: 1 })
db.referrals.createIndex({ companyHRId: 1 })
db.referralchats.createIndex({ referralId: 1 }, { unique: true })
db.referralchats.createIndex({ hrId: 1, company: 1 })
```

---

## 🧪 Post-Deployment Testing

### Test 1: HR User Login
```bash
# Test HR login
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@google.com",
    "password": "hr123456"
  }'

# Expected: 200 OK with JWT token
```

### Test 2: Referral Acceptance
```bash
# Accept referral (as referrer)
curl -X PATCH https://your-api.com/api/referrals-enhanced/:id/accept \
  -H "Authorization: Bearer <referrer-token>"

# Expected: 200 OK with companyHRId and hrChatEnabled: true
```

### Test 3: HR Dashboard Access
```bash
# Get HR's assigned referrals
curl -X GET https://your-api.com/api/referrals-enhanced/hr \
  -H "Authorization: Bearer <hr-token>"

# Expected: 200 OK with list of referrals
```

### Test 4: Chat Functionality
```bash
# Start HR chat
curl -X POST https://your-api.com/api/referrals-enhanced/hr-chat/start \
  -H "Authorization: Bearer <seeker-token>" \
  -H "Content-Type: application/json" \
  -d '{ "referralId": "..." }'

# Expected: 200 OK with chat object
```

### Test 5: Real-Time Messaging
- Open two browser windows
- Login as seeker in one, HR in another
- Send messages
- Verify real-time delivery

---

## 🔍 Verification Checklist

### Database Verification
- [ ] HR users exist in `users` collection
- [ ] HR users have `role: 'company_hr'`
- [ ] HR users have `isActive: true`
- [ ] Referrals have `companyHRId` field
- [ ] Referrals have `hrChatEnabled` field
- [ ] `referralchats` collection exists

### API Verification
- [ ] `/api/referrals-enhanced/*` routes accessible
- [ ] Authentication middleware working
- [ ] HR auto-assignment working
- [ ] Chat creation working
- [ ] Message sending working

### Frontend Verification
- [ ] `/hr/dashboard` page loads
- [ ] `/referral-hr-chat/:id` page loads
- [ ] "Company HR" button visible on seeker dashboard
- [ ] Real-time messaging works
- [ ] Socket.IO connects successfully

### Security Verification
- [ ] JWT authentication required
- [ ] Role-based access enforced
- [ ] Company validation working
- [ ] Participant verification working
- [ ] No cross-company access possible

---

## 📊 Monitoring Setup

### Logs to Monitor
```bash
# Backend logs
tail -f /path/to/backend/logs/combined.log

# Look for:
# ✅ "Auto-assigned HR <name> to referral <id>"
# ✅ "User <id> joined HR chat room: referral_hr_<id>"
# ❌ "HR assignment error:"
# ❌ "Access denied"
```

### Metrics to Track
- HR assignment success rate
- Average response time
- Active chat sessions
- Message delivery rate
- Socket.IO connection stability

### Alerts to Set Up
- HR assignment failures
- Socket.IO disconnections
- Authentication failures
- Database connection issues

---

## 🐛 Troubleshooting Guide

### Issue: No HR Assigned
**Symptoms:** Referral accepted but `companyHRId` is null

**Debug Steps:**
```bash
# Check if HR exists
db.users.find({ 
  role: 'company_hr', 
  company: 'Google',
  isActive: true 
})

# Check backend logs
grep "HR assignment" /path/to/logs/combined.log
```

**Solution:**
- Run seed script: `npx ts-node src/scripts/seedCompanyHRUsers.ts`
- Or create HR manually

### Issue: Chat Not Loading
**Symptoms:** Chat page shows error or blank

**Debug Steps:**
```bash
# Check if chat exists
db.referralchats.find({ referralId: ObjectId("...") })

# Check Socket.IO connection
# Open browser console, look for Socket.IO errors
```

**Solution:**
- Verify `hrChatEnabled` is true
- Check Socket.IO server is running
- Verify JWT token is valid

### Issue: Access Denied
**Symptoms:** 403 Forbidden error

**Debug Steps:**
```bash
# Verify JWT token
curl -X GET https://your-api.com/api/referrals-enhanced/hr \
  -H "Authorization: Bearer <token>" \
  -v

# Check user role
db.users.findOne({ _id: ObjectId("...") })
```

**Solution:**
- Verify user has correct role
- Check company matches
- Verify user is participant

---

## 🔄 Rollback Plan

If issues occur, rollback steps:

### Backend Rollback
```bash
# 1. Revert to previous commit
git revert HEAD
git push origin main

# 2. Rebuild and restart
npm run build
pm2 restart backend
```

### Frontend Rollback
```bash
# 1. Revert to previous commit
git revert HEAD
git push origin main

# 2. Rebuild and redeploy
npm run build
# Deploy dist/ folder
```

### Database Rollback
```bash
# Remove new fields (if needed)
db.referrals.updateMany({}, { 
  $unset: { companyHRId: "", hrChatEnabled: "" } 
})

# Drop new collection (if needed)
db.referralchats.drop()
```

---

## ✅ Sign-Off Checklist

Before marking deployment complete:

### Technical
- [ ] All tests passing
- [ ] No console errors
- [ ] No backend errors
- [ ] Database indexes created
- [ ] HR users seeded

### Functional
- [ ] HR auto-assignment works
- [ ] Chat creation works
- [ ] Real-time messaging works
- [ ] Security enforced
- [ ] UI responsive

### Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Team notified
- [ ] Deployment notes saved

### Monitoring
- [ ] Logs configured
- [ ] Alerts set up
- [ ] Metrics tracked
- [ ] Dashboard created

---

## 📞 Support Contacts

**Technical Issues:**
- Backend: Check `backend/logs/`
- Frontend: Check browser console
- Database: Check MongoDB logs

**Documentation:**
- `HR_CHAT_FLOW_SYSTEM.md` - Technical details
- `HR_CHAT_QUICKSTART.md` - Quick start
- `HR_CHAT_FLOW_DIAGRAM.md` - Visual guide

---

## 🎉 Deployment Complete!

Once all items are checked:
1. Mark deployment as complete
2. Notify team
3. Monitor for 24 hours
4. Collect user feedback
5. Plan next iteration

**Status:** Ready for Production ✅
**Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________

---

**Good luck with your deployment!** 🚀
