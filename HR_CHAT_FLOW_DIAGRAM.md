# Company HR Chat Flow - Visual Diagram

## 🔄 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REFERAI PLATFORM                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  JOB SEEKER  │         │   REFERRER   │         │ COMPANY HR   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ 1. Request Referral    │                        │
       │───────────────────────>│                        │
       │    (Google, SWE)       │                        │
       │                        │                        │
       │                        │ 2. Accept Referral     │
       │                        │────────────────────┐   │
       │                        │                    │   │
       │                        │ 3. System Finds HR │   │
       │                        │    (Google HR)     │   │
       │                        │<───────────────────┘   │
       │                        │                        │
       │                        │ 4. Auto-Assign HR      │
       │                        │───────────────────────>│
       │                        │    companyHRId set     │
       │                        │    hrChatEnabled=true  │
       │                        │                        │
       │ 5. Notification        │                        │
       │<───────────────────────┤                        │
       │ "Referral Accepted!    │                        │
       │  Chat with HR now"     │                        │
       │                        │                        │
       │                        │         6. Notification│
       │                        │         "New Candidate"│
       │                        │<───────────────────────┤
       │                        │                        │
       │ 7. Click "Company HR"  │                        │
       │────────────────────────┼───────────────────────>│
       │                        │                        │
       │ 8. Private Chat Room Created                    │
       │<════════════════════════════════════════════════>│
       │         referral_hr_<referralId>                │
       │                                                  │
       │ 9. Real-Time Messaging                          │
       │<─────────────────────────────────────────────────>
       │              Socket.IO                          │
       │                                                  │
```

---

## 📊 Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE OPERATIONS                         │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Referral Created
┌──────────────────────────────────────┐
│ Referral Collection                  │
├──────────────────────────────────────┤
│ seekerId: ObjectId("seeker123")      │
│ referrerId: ObjectId("referrer456")  │
│ company: "Google"                    │
│ role: "Software Engineer"            │
│ status: "pending"                    │
│ companyHRId: null                    │
│ hrChatEnabled: false                 │
└──────────────────────────────────────┘

STEP 2: Referral Accepted (Auto-Assign HR)
┌──────────────────────────────────────┐
│ Query: Find Active HR                │
├──────────────────────────────────────┤
│ User.findOne({                       │
│   role: "company_hr",                │
│   company: "Google",                 │
│   isActive: true                     │
│ })                                   │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│ Referral Collection (Updated)        │
├──────────────────────────────────────┤
│ status: "accepted"                   │
│ companyHRId: ObjectId("hr789")       │
│ hrChatEnabled: true                  │
│ acceptedAt: Date.now()               │
└──────────────────────────────────────┘

STEP 3: Chat Room Created
┌──────────────────────────────────────┐
│ ReferralChat Collection              │
├──────────────────────────────────────┤
│ referralId: ObjectId("ref123")       │
│ seekerId: ObjectId("seeker123")      │
│ hrId: ObjectId("hr789")              │
│ company: "Google"                    │
│ messages: []                         │
│ lastMessageAt: null                  │
└──────────────────────────────────────┘

STEP 4: Messages Exchanged
┌──────────────────────────────────────┐
│ ReferralChat Collection (Updated)    │
├──────────────────────────────────────┤
│ messages: [                          │
│   {                                  │
│     senderId: ObjectId("seeker123"), │
│     content: "Hello!",               │
│     timestamp: Date.now(),           │
│     read: false                      │
│   },                                 │
│   {                                  │
│     senderId: ObjectId("hr789"),     │
│     content: "Hi! How can I help?",  │
│     timestamp: Date.now(),           │
│     read: false                      │
│   }                                  │
│ ]                                    │
│ lastMessageAt: Date.now()            │
└──────────────────────────────────────┘
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

Layer 1: JWT Authentication
┌──────────────────────────────────────┐
│ Request Headers                      │
├──────────────────────────────────────┤
│ Authorization: Bearer <JWT_TOKEN>    │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│ Middleware: authenticate()           │
├──────────────────────────────────────┤
│ - Verify JWT signature               │
│ - Check expiration                   │
│ - Extract userId & role              │
└──────────────────────────────────────┘

Layer 2: Role-Based Access Control
┌──────────────────────────────────────┐
│ Controller: Check Role               │
├──────────────────────────────────────┤
│ if (user.role !== 'company_hr') {    │
│   return 403 Forbidden               │
│ }                                    │
└──────────────────────────────────────┘

Layer 3: Company Validation
┌──────────────────────────────────────┐
│ Controller: Check Company            │
├──────────────────────────────────────┤
│ if (hr.company !== referral.company) │
│   return 403 Forbidden               │
│ }                                    │
└──────────────────────────────────────┘

Layer 4: Participant Verification
┌──────────────────────────────────────┐
│ Controller: Check Participant        │
├──────────────────────────────────────┤
│ if (chat.seekerId !== userId &&      │
│     chat.hrId !== userId) {          │
│   return 403 Forbidden               │
│ }                                    │
└──────────────────────────────────────┘

✅ Request Allowed
```

---

## 🌐 Socket.IO Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME MESSAGING                           │
└─────────────────────────────────────────────────────────────────┘

Client Connection
┌──────────────────────────────────────┐
│ const socket = io(API_URL, {         │
│   auth: { token: JWT_TOKEN }         │
│ });                                  │
└──────────────────────────────────────┘
                ↓
Server Authentication
┌──────────────────────────────────────┐
│ io.use((socket, next) => {           │
│   const token = socket.handshake     │
│                .auth.token;          │
│   const decoded = jwt.verify(token); │
│   socket.data.userId = decoded.id;   │
│   next();                            │
│ });                                  │
└──────────────────────────────────────┘
                ↓
Join Room
┌──────────────────────────────────────┐
│ socket.emit('join_hr_chat', {        │
│   referralId: 'ref123',              │
│   token: JWT_TOKEN                   │
│ });                                  │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│ Server: Verify & Join                │
├──────────────────────────────────────┤
│ - Verify user is participant         │
│ - Join room: referral_hr_ref123      │
│ - Emit 'user_joined' to room         │
└──────────────────────────────────────┘
                ↓
Send Message
┌──────────────────────────────────────┐
│ socket.emit('hr_chat_message', {     │
│   referralId: 'ref123',              │
│   content: 'Hello!'                  │
│ });                                  │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│ Server: Broadcast to Room            │
├──────────────────────────────────────┤
│ io.to('referral_hr_ref123')          │
│   .emit('hr_chat_message', data);    │
└──────────────────────────────────────┘
                ↓
Receive Message
┌──────────────────────────────────────┐
│ socket.on('hr_chat_message', (data)  │
│   => {                               │
│   setMessages([...messages, data]);  │
│ });                                  │
└──────────────────────────────────────┘
```

---

## 🎯 User Journey

### Job Seeker Journey
```
1. Login → Dashboard
   ↓
2. Click "Find Referrer"
   ↓
3. Search "Google"
   ↓
4. Select Referrer → Request Referral
   ↓
5. Wait for Acceptance
   ↓
6. Notification: "Referral Accepted!"
   ↓
7. Dashboard shows "Company HR" button
   ↓
8. Click "Company HR"
   ↓
9. Chat with Google HR
   ↓
10. Discuss interview process
```

### Company HR Journey
```
1. Login → HR Dashboard
   ↓
2. See "New Candidate Assigned" notification
   ↓
3. View Assigned Candidates tab
   ↓
4. See candidate profile & resume
   ↓
5. Click "Chat with Candidate"
   ↓
6. Chat opens with seeker
   ↓
7. Discuss role, interview, next steps
   ↓
8. Access from "Active Chats" tab anytime
```

### Referrer Journey
```
1. Login → Referrer Dashboard
   ↓
2. See pending referral request
   ↓
3. Review seeker profile
   ↓
4. Click "Accept"
   ↓
5. System auto-assigns HR
   ↓
6. Notification sent to seeker & HR
   ↓
7. Referrer's job done!
```

---

## 📱 UI Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    JOB SEEKER DASHBOARD                          │
├─────────────────────────────────────────────────────────────────┤
│  My Referral Requests                                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🏢 Google - Software Engineer                             │  │
│  │ Status: ✅ Accepted                                        │  │
│  │ [💬 Referrer Chat] [🏢 Company HR] ← NEW BUTTON          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    COMPANY HR DASHBOARD                          │
├─────────────────────────────────────────────────────────────────┤
│  Stats: 5 Assigned | 3 Active Chats | 2 Pending                │
│                                                                  │
│  Assigned Candidates                                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 👤 Jane Seeker                                            │  │
│  │ 📧 jane@example.com                                       │  │
│  │ 💼 Software Engineer                                      │  │
│  │ 🏷️ React, Node.js, TypeScript                            │  │
│  │ [💬 Chat with Candidate] [📄 View Resume]                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       HR CHAT PAGE                               │
├─────────────────────────────────────────────────────────────────┤
│  ← Google HR | Software Engineer | ✅ Accepted                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  👤 Jane: Hello! When can we schedule the interview?            │
│  🕐 2:30 PM                                                      │
│                                                                  │
│                    🏢 HR: Hi Jane! Let me check availability.   │
│                    How about next Tuesday at 10 AM?             │
│                    🕐 2:32 PM                                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  [Type your message...                              ] [Send →]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Transitions

```
Referral Status Flow:
pending → accepted → completed
   ↓         ↓
rejected   expired

HR Chat Enabled:
false (pending) → true (accepted) → true (completed)

Chat Room:
null (pending) → created (accepted) → active (completed)
```

---

**This visual guide complements the technical documentation and provides a clear understanding of the system flow.**
