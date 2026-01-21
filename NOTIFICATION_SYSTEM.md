# Real-Time Notification System

## 🚀 Quick Start

### Backend Setup

1. **Install dependencies**
```bash
npm install socket.io jsonwebtoken
```

2. **Update server.ts**
```typescript
import { setupSocket } from './config/socket';
import notificationRoutes from './routes/notificationRoutes';

// Add routes
app.use('/api/notifications', notificationRoutes);

// Setup socket after creating HTTP server
const httpServer = createServer(app);
setupSocket(httpServer);

httpServer.listen(PORT);
```

3. **Environment variables**
```
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend Setup

1. **Install dependencies**
```bash
npm install socket.io-client framer-motion lucide-react
```

2. **Add NotificationBell to Header**
```tsx
import NotificationBell from './components/NotificationBell';

<Header>
  <NotificationBell />
</Header>
```

## 📡 Socket Events

### Server → Client
- `new_notification` - New notification received
- `unread_count` - Updated unread count
- `broadcast_notification` - Admin broadcast

### Client → Server
- Auto-authenticated via JWT in handshake

## 🔒 Security Features

✅ JWT authentication on socket connection
✅ Role-based room isolation
✅ User-specific notification filtering
✅ Database-level access control

## 🎯 Usage Examples

### Trigger notification from any backend service:
```typescript
import notificationService from './services/notificationService';

await notificationService.create({
  recipientUserId: userId,
  recipientRole: 'seeker',
  title: 'Application Submitted',
  message: 'Your application has been received',
  type: 'application',
  entityId: applicationId
});
```

## 📊 Database Indexes

Optimized for fast queries:
- `recipientUserId + isRead + createdAt`
- Individual indexes on role, read status

## 🔄 Fallback Strategy

If socket disconnects:
1. Auto-reconnect (5 attempts)
2. REST polling every 30s
3. Fetch on page focus

## 🎨 UI Features

✅ LinkedIn-style dropdown
✅ Unread badge count
✅ Mark as read on click
✅ Mark all as read
✅ Real-time updates
✅ Smooth animations
✅ Mobile responsive
✅ Click outside to close

## 📈 Performance

- Indexed queries < 10ms
- Socket rooms for targeted delivery
- Pagination support (20 per page)
- Lazy loading on scroll

## 🔧 Customization

### Add new notification type:
1. Update Notification model enum
2. Add icon in `getIcon()` function
3. Create trigger function in examples

### Add sound notification:
Place `notification.mp3` in `/public` folder
