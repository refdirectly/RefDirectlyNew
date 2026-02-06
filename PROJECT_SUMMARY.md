# RefDirectly - Professional Referral Network Platform

## 🎯 Project Overview
RefDirectly is a production-ready, full-stack job referral platform that connects job seekers with verified employees at top companies. The platform features AI-powered matching, real-time notifications, secure escrow payments, and role-based dashboards.

**Live API**: https://refdirectly-1.onrender.com

---

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript + MongoDB + Socket.IO
- **Authentication**: JWT + OAuth (Google, LinkedIn)
- **Payments**: Razorpay Integration
- **Real-time**: Socket.IO with WebSocket
- **Deployment**: Render (Backend) + Vercel/Netlify (Frontend)

### **Key Technologies**
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router v6
- **API Calls**: Fetch API with async/await
- **Validation**: Custom validation utilities
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: Controlled components with real-time validation

---

## 👥 User Roles

### 1. **Job Seeker**
- Search and find referrers by company and role
- Request referrals with secure payment
- Real-time chat with referrers
- Track referral status
- AI-powered job applications
- Resume builder
- Wallet management

### 2. **Referrer**
- Receive referral requests
- Accept/reject requests
- Chat with job seekers
- Track earnings
- Withdraw payments
- Performance analytics

### 3. **Admin**
- User management
- Verification dashboard
- Payment processing
- Analytics and insights
- Platform monitoring

---

## 🚀 Core Features

### **Authentication & Authorization**
- ✅ Multi-role signup/login (Seeker, Referrer, Admin)
- ✅ Email OTP verification
- ✅ Organization email validation for referrers
- ✅ OAuth integration (Google, LinkedIn)
- ✅ JWT-based authentication
- ✅ Password validation (8+ chars, uppercase, lowercase, number)
- ✅ Show/hide password toggle
- ✅ Form validation with real-time error display
- ✅ Redirect URL support after login

### **Real-Time Notification System**
- ✅ Socket.IO integration with JWT authentication
- ✅ Role-based notification rooms (user:${userId}, role:${role})
- ✅ Real-time notification delivery
- ✅ Notification types: referral_request, referral_accepted, referral_rejected, referral_completed, chat_message, welcome
- ✅ Unread count badge
- ✅ Mark as read/Mark all as read
- ✅ Dedicated notifications page
- ✅ Auto-refresh on new notifications

### **Referral System**
- ✅ Smart company search with autocomplete
- ✅ Real-time referrer listing with live stats
- ✅ Online status indicators (green pulse)
- ✅ Response time display
- ✅ Rating and review system
- ✅ Triple filtering (name, company, role)
- ✅ Request referral with payment
- ✅ Referral status tracking (pending, accepted, rejected, completed)
- ✅ Escrow payment protection
- ✅ **Auto-assign company HR on acceptance** ✨ NEW
- ✅ **HR chat enabled after acceptance** ✨ NEW

### **Chat System**
- ✅ Real-time messaging with Socket.IO
- ✅ One-on-one chat between seeker and referrer
- ✅ **Company-specific HR chat flow**
- ✅ **Auto-assign HR on referral acceptance**
- ✅ **Private chat between seeker and company HR**
- ✅ Message history persistence
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Unread message counts
- ✅ Chat notifications
- ✅ **HR dashboard with assigned candidates**
- ✅ **Real-time HR-seeker communication**

### **Payment Integration**
- ✅ Razorpay payment gateway
- ✅ Secure escrow system
- ✅ Payment verification
- ✅ Wallet management
- ✅ Earnings tracking
- ✅ Withdrawal system
- ✅ Transaction history

### **Dashboard Features**

#### Job Seeker Dashboard
- Active applications count
- Referrals received
- AI applications
- Success rate
- Recent activity feed
- Quick actions (Find Referrer, Browse Jobs, AI Apply, Wallet, Messages)
- Referral request cards with status
- Profile completion tracker

#### Referrer Dashboard
- Pending requests
- Completed referrals
- Total earnings
- Success rate
- Active chats
- Recent activity
- Performance metrics (total referrals, avg response time, rating, balance)
- Quick actions (View Requests, Wallet, Earnings)

### **Resume Builder**
- ✅ Fully responsive design
- ✅ Mobile-friendly interface
- ✅ Adaptive text sizes and spacing
- ✅ Touch-friendly buttons
- ✅ Professional templates
- ✅ PDF export functionality

### **UI/UX Enhancements**
- ✅ Fully responsive design (mobile-first)
- ✅ Modern gradient backgrounds
- ✅ Smooth animations with Framer Motion
- ✅ Loading states and skeletons
- ✅ Error handling with user-friendly messages
- ✅ Toast notifications
- ✅ Professional welcome popup
- ✅ Accessibility compliance (WCAG)
- ✅ Dark mode support (partial)

---

## 📁 Project Structure

```
ReferAI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ReferralPayment.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── Login.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ReferrerDashboard.tsx
│   │   │   ├── FindReferrerPage.tsx
│   │   │   ├── ReferrersPage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── ResumeBuilder.tsx
│   │   │   ├── SeekerSignupPage.tsx
│   │   │   ├── ReferrerSignupPage.tsx
│   │   │   ├── ReferrerLoginPage.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── useSocket.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   └── validation.ts
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── referralController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── notificationController.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── notificationService.ts
│   │   │   ├── paymentProcessingService.ts
│   │   │   └── ...
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Referral.ts
│   │   │   ├── Notification.ts
│   │   │   ├── Chat.ts
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── referrals.ts
│   │   │   ├── notifications.ts
│   │   │   └── ...
│   │   ├── config/
│   │   │   └── socket.ts
│   │   └── server.ts
│   └── package.json
└── PROJECT_SUMMARY.md
```

---

## 🔐 Security Features

- ✅ JWT authentication with httpOnly cookies
- ✅ Password hashing with bcrypt
- ✅ Email OTP verification
- ✅ Organization email validation
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Secure payment processing
- ✅ Escrow protection

---

## 📱 Responsive Design

### Mobile Optimizations
- Adaptive layouts (flex-col on mobile, flex-row on desktop)
- Responsive text sizes (text-sm → sm:text-base → md:text-lg)
- Touch-friendly buttons (min 44x44px)
- Compact spacing (p-3 → sm:p-5 → md:p-8)
- Hamburger menu for navigation
- Bottom navigation for mobile
- Swipeable cards
- Optimized images and assets

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## 🎨 Design System

### Colors
- **Primary**: Purple (#8B5CF6)
- **Secondary**: Magenta (#EC4899)
- **Accent**: Teal (#14B8A6)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

### Typography
- **Font Family**: Inter (body), Poppins (display)
- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl

### Components
- Rounded corners (rounded-xl, rounded-2xl)
- Shadows (shadow-sm, shadow-lg, shadow-xl)
- Gradients (gradient-primary, gradient-to-br)
- Hover effects (hover:scale-105, hover:shadow-xl)
- Transitions (transition-all duration-200)

---

## 🔄 Real-Time Features

### Socket.IO Implementation
```typescript
// Client-side
const socket = io(API_URL, {
  auth: { token: localStorage.getItem('token') }
});

socket.on('notification', (data) => {
  // Handle notification
});

// Server-side
io.on('connection', (socket) => {
  socket.join(`user:${userId}`);
  socket.join(`role:${role}`);
});
```

### Events
- `notification` - New notification received
- `message` - New chat message
- `referral_update` - Referral status changed
- `online_status` - User online/offline
- `typing` - User typing indicator

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/linkedin` - LinkedIn OAuth

### Referrals
- `GET /api/referrals/seeker` - Get seeker referrals
- `GET /api/referrals/referrer` - Get referrer referrals
- `POST /api/referrals` - Create referral request
- `PATCH /api/referrals/:id/accept` - Accept referral
- `PATCH /api/referrals/:id/reject` - Reject referral
- `PATCH /api/referrals/:id/complete` - Complete referral

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Chat
- `GET /api/chat/chats` - Get user chats
- `GET /api/chat/:chatId/messages` - Get chat messages
- `POST /api/chat/message` - Send message

### Users
- `GET /api/users/referrers` - Get all referrers
- `GET /api/users/referrers/count` - Get referrer count

---

## 🧪 Testing

### Manual Testing Completed
- ✅ User registration and login flows
- ✅ Email OTP verification
- ✅ Referral request creation
- ✅ Real-time notifications
- ✅ Chat functionality
- ✅ Payment processing
- ✅ Responsive design on multiple devices
- ✅ Cross-browser compatibility

---

## 🚀 Deployment

### Backend (Render)
- **URL**: https://refdirectly-1.onrender.com
- **Environment**: Node.js 18
- **Database**: MongoDB Atlas
- **Auto-deploy**: Enabled on main branch

### Frontend
- **Build Command**: `npm run build`
- **Output**: `dist/`
- **Environment Variables**: `VITE_API_URL`

---

## 📈 Performance Optimizations

- ✅ Code splitting with dynamic imports
- ✅ Lazy loading of components
- ✅ Image optimization
- ✅ Debounced search inputs
- ✅ Memoized components
- ✅ Efficient re-renders
- ✅ API response caching
- ✅ WebSocket connection pooling

---

## 🐛 Known Issues & Future Enhancements

### To Be Implemented
- [ ] Password strength indicator
- [ ] Forgot password functionality
- [ ] Two-factor authentication
- [ ] Advanced search filters
- [ ] Video call integration
- [ ] AI-powered resume analysis
- [ ] Job recommendation engine
- [ ] Email notifications
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Referral leaderboard
- [ ] Testimonials management
- [ ] Blog/Resources section

---

## 📝 Recent Updates

### Latest Session (Current)
1. ✅ Form validation with show/hide password
2. ✅ Responsive welcome popup
3. ✅ Modern dashboard header
4. ✅ Real-time referrer data integration
5. ✅ Authentication flow for Find Referrer
6. ✅ Production-ready UI enhancements

### Previous Sessions
1. ✅ Notification system implementation
2. ✅ Resume builder responsive design
3. ✅ Accessibility fixes across all pages
4. ✅ TypeScript error resolution
5. ✅ Git repository setup and deployment

---

## 🎓 Key Learnings

1. **Real-time Architecture**: Implemented Socket.IO with JWT authentication and role-based rooms
2. **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
3. **Form Validation**: Client-side validation with real-time error feedback
4. **State Management**: Efficient use of React hooks for complex state
5. **API Integration**: RESTful API design with proper error handling
6. **Security**: JWT authentication, password hashing, input validation
7. **UX Design**: Loading states, error messages, success feedback
8. **TypeScript**: Type-safe development with interfaces and enums

---

## 👨‍💻 Developer Notes

### Environment Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

### Environment Variables
```env
# Frontend (.env)
VITE_API_URL=https://refdirectly-1.onrender.com

# Backend (.env)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

---

## 📞 Support & Contact

For issues, questions, or contributions, please contact the development team.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready ✅


---

## 🏢 Company HR Chat Flow System (NEW)

### Overview
When a referrer accepts a referral request, the system automatically:
1. Finds an active HR from the SAME company
2. Assigns that HR to the referral
3. Enables a PRIVATE CHAT between job seeker and company HR
4. Creates a dedicated chat room for communication

### Key Features
- ✅ **Auto-Assignment**: HR automatically assigned on referral acceptance
- ✅ **Company-Specific**: HR must belong to same company as referral
- ✅ **One HR Per Referral**: Single HR assigned to each referral
- ✅ **Chat After Acceptance**: HR chat only enabled after referral accepted
- ✅ **Secure Access**: Only seeker and assigned HR can access chat
- ✅ **Real-Time**: Socket.IO powered instant messaging
- ✅ **HR Dashboard**: Dedicated dashboard for HR to manage candidates

### User Roles
1. **job_seeker / seeker** - Requests referrals, chats with HR
2. **referrer** - Accepts referrals, triggers HR assignment
3. **company_hr** - Assigned to referrals, chats with seekers ⭐ NEW
4. **admin** - System administration

### Database Models

#### User Model (Enhanced)
```typescript
{
  role: 'seeker' | 'referrer' | 'company_hr' | 'admin',
  company: string,        // For company_hr
  isActive: boolean,      // HR availability
  // ... other fields
}
```

#### Referral Model (Enhanced)
```typescript
{
  companyHRId: ObjectId,     // Auto-assigned
  hrChatEnabled: boolean,    // Enabled after HR assignment
  acceptedAt: Date,
  // ... other fields
}
```

#### ReferralChat Model (New)
```typescript
{
  referralId: ObjectId,      // One chat per referral
  seekerId: ObjectId,
  hrId: ObjectId,
  company: string,
  messages: Array<Message>,
  lastMessageAt: Date
}
```

### API Endpoints

#### Enhanced Referral APIs
```
POST   /api/referrals-enhanced/
PATCH  /api/referrals-enhanced/:id/accept
GET    /api/referrals-enhanced/seeker
GET    /api/referrals-enhanced/hr
```

#### HR Chat APIs
```
POST   /api/referrals-enhanced/hr-chat/start
POST   /api/referrals-enhanced/hr-chat/message
GET    /api/referrals-enhanced/hr-chat/:referralId/messages
GET    /api/referrals-enhanced/hr-chat/chats
```

### Frontend Pages

#### Company HR Dashboard
- **Route**: `/hr/dashboard`
- **Features**:
  - View assigned candidates
  - Active chats list
  - Stats dashboard
  - Quick access to resumes
  - One-click chat initiation

#### HR Chat Page
- **Route**: `/referral-hr-chat/:referralId`
- **Features**:
  - Real-time messaging
  - Typing indicators
  - Message history
  - Referral context display

#### Job Seeker Dashboard (Enhanced)
- **Route**: `/dashboard`
- **New Features**:
  - "Company HR" button (visible after acceptance)
  - Direct access to HR chat
  - Visual indicators for chat availability

### Socket.IO Events
```typescript
// HR Chat Events
join_hr_chat          // Join referral-specific room
leave_hr_chat         // Leave room
hr_chat_typing        // Typing indicator
hr_chat_message       // New message broadcast
mark_hr_chat_read     // Mark messages as read
```

### Security Features
- ✅ JWT authentication on all endpoints
- ✅ Role-based access control (RBAC)
- ✅ Company validation (HR can only access their company)
- ✅ Participant verification (only seeker and assigned HR)
- ✅ No cross-company access
- ✅ Secure Socket.IO connections

### Business Rules
1. HR must belong to SAME company as referral
2. Only ONE HR per referral
3. Chat only after referral acceptance
4. No cross-company access allowed
5. HR must be active (`isActive: true`)

### Setup & Testing

#### Seed Test HR Users
```bash
cd backend
npx ts-node src/scripts/seedCompanyHRUsers.ts
```

Creates HR users for: Google, Amazon, Microsoft, Meta, Apple, Netflix, Tesla, Uber, Airbnb, Spotify

**Default Credentials**: `hr@[company].com` / `hr123456`

#### Test Flow
1. Job Seeker requests referral for Google
2. Referrer accepts referral
3. System auto-assigns Google HR
4. Job Seeker sees "Company HR" button
5. Both can chat in real-time

### Documentation
- 📄 **HR_CHAT_FLOW_SYSTEM.md** - Complete technical documentation
- 📄 **HR_CHAT_QUICKSTART.md** - Quick start guide
- 📄 **seedCompanyHRUsers.ts** - HR user seeding script

### Performance
- Indexed queries for fast HR lookup
- Efficient Socket.IO room management
- Optimized message retrieval
- Real-time updates without polling

---

## 📝 Recent Updates

### Latest Session (HR Chat System)
1. ✅ Enhanced User model with `isActive` and `company` fields
2. ✅ Enhanced Referral model with `companyHRId` and `hrChatEnabled`
3. ✅ Created ReferralChat model with validation
4. ✅ Implemented auto-assign HR on referral acceptance
5. ✅ Created enhanced referral controller
6. ✅ Built Socket.IO HR chat handler
7. ✅ Created Company HR Dashboard page
8. ✅ Updated Job Seeker Dashboard with HR chat button
9. ✅ Added real-time messaging functionality
10. ✅ Implemented security and access controls
11. ✅ Created comprehensive documentation
12. ✅ Built HR user seeding script

