# Instagram-Style Real-Time Notification System

## Overview
Production-ready real-time notification system with instant delivery, toast notifications, dropdown panel, badge counts, and smart UX rules.

## Features Implemented

### ✅ Backend Enhancements
1. **Enhanced Notification Model** (`backend/src/models/Notification.ts`)
   - Added `senderId` field for sender tracking
   - Added `avatarUrl` for sender avatar
   - Added `mention` and `referral` notification types
   - Support for `company_hr` role

2. **Enhanced Notification Service** (`backend/src/services/notificationService.ts`)
   - Emits `notification:new` with full notification data
   - Emits `notification:count` for real-time badge updates
   - Auto-updates count when marking as read
   - Supports sender information in notifications

3. **Socket.IO Events** (`backend/src/config/socket.ts`)
   - `notification:new` - New notification received
   - `notification:count` - Unread count update
   - `notification:read` - Mark notification as read
   - JWT authentication on socket connection

### ✅ Frontend Components

1. **NotificationDropdown** (`frontend/src/components/NotificationDropdown.tsx`)
   - Instagram-style dropdown panel
   - Grouped by time (Today, Yesterday, Older)
   - Animated badge with pulse effect
   - Mark all as read functionality
   - Click to navigate to related content
   - Sound notification on new message
   - Browser notification support
   - Smooth animations with Framer Motion

2. **NotificationToast** (`frontend/src/components/NotificationToast.tsx`)
   - Auto-dismiss after 5 seconds
   - Appears at top-right
   - Click to navigate
   - Smooth enter/exit animations
   - Avatar/icon display

3. **NotificationContext** (`frontend/src/contexts/NotificationContext.tsx`)
   - Global notification state management
   - Smart toast suppression logic
   - Prevents duplicate notifications
   - Manages toast queue

### ✅ Smart UX Rules

1. **Toast Suppression**
   - Don't show message toast if user is in that chat
   - Don't show referral toast if user is on dashboard
   - Prevents notification spam

2. **Real-Time Updates**
   - Badge count updates instantly
   - Notifications appear without refresh
   - Syncs across multiple tabs via Socket.IO

3. **Visual Feedback**
   - Unread notifications highlighted with purple background
   - Purple dot indicator for unread items
   - Animated badge with bounce effect
   - Pulse animation on bell icon

4. **Sound & Browser Notifications**
   - Plays sound only when app is visible
   - Browser notifications when permission granted
   - Respects user's notification preferences

## Socket.IO Events

### Server → Client
```typescript
socket.emit('notification:new', {
  id: string,
  senderId?: string,
  title: string,
  message: string,
  type: string,
  entityId?: string,
  avatarUrl?: string,
  isRead: boolean,
  createdAt: Date
});

socket.emit('notification:count', number);
```

### Client → Server
```typescript
socket.emit('notification:read', notificationId);
```

## API Endpoints

### Existing (Enhanced)
- `GET /api/notifications` - Get user notifications (paginated)
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read

## Usage

### 1. Wrap App with NotificationProvider
```tsx
import { NotificationProvider } from './contexts/NotificationContext';

<NotificationProvider>
  <App />
</NotificationProvider>
```

### 2. Use NotificationDropdown in Header
```tsx
import NotificationDropdown from './components/NotificationDropdown';

<NotificationDropdown />
```

### 3. Send Notifications from Backend
```typescript
await notificationService.create({
  senderId: userId,
  recipientUserId: recipientId,
  recipientRole: 'seeker',
  title: 'New Message',
  message: 'You have a new message from John',
  type: 'message',
  entityId: chatId,
  avatarUrl: senderAvatar
});
```

## Installation

### Backend
No additional packages needed - uses existing Socket.IO setup

### Frontend
```bash
cd frontend
npm install date-fns  # For time formatting
```

## Configuration

### Request Browser Notification Permission
Add to your app initialization:
```typescript
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
```

## Performance Optimizations

1. **Indexed Database Queries**
   - Compound index on `recipientUserId`, `isRead`, `createdAt`
   - Fast unread count queries

2. **Socket.IO Rooms**
   - User-specific rooms (`user:${userId}`)
   - Role-specific rooms (`role:${role}`)
   - Efficient message delivery

3. **Smart Toast Queue**
   - Prevents notification spam
   - Context-aware suppression
   - Auto-cleanup after dismiss

## Security

1. **JWT Authentication**
   - Socket connections authenticated via JWT
   - User-specific rooms prevent unauthorized access

2. **Authorization**
   - Users can only read their own notifications
   - Mark as read requires ownership verification

## Testing

### Test Notification Flow
1. Login as two different users
2. Send a message from User A to User B
3. User B should see:
   - Badge count increase
   - Toast notification (if not in chat)
   - Notification in dropdown
   - Browser notification (if permitted)

### Test Smart Suppression
1. Open chat with User A
2. Send message from User A
3. Toast should NOT appear (user is in chat)
4. Badge count should still update

## Future Enhancements

- [ ] Notification preferences (mute, DND)
- [ ] Push notifications for mobile
- [ ] Email digest for missed notifications
- [ ] Notification categories/filters
- [ ] Bulk actions (delete, archive)
- [ ] Notification history cleanup (cron job)

## Files Modified/Created

### Backend
- ✅ `backend/src/models/Notification.ts` - Enhanced model
- ✅ `backend/src/services/notificationService.ts` - Enhanced service
- ✅ `backend/src/config/socket.ts` - Added notification:read handler

### Frontend
- ✅ `frontend/src/components/NotificationDropdown.tsx` - NEW
- ✅ `frontend/src/components/NotificationToast.tsx` - NEW
- ✅ `frontend/src/contexts/NotificationContext.tsx` - NEW
- ✅ `frontend/src/components/Header.tsx` - Updated to use NotificationDropdown

## Notes

- Notifications persist in database even when user is offline
- Socket.IO handles reconnection automatically
- Toast notifications respect document visibility
- Browser notifications require user permission
- Sound plays only when app is in foreground
