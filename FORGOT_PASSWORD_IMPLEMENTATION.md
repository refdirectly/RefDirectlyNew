# Forgot Password Implementation

## Overview
Added complete forgot password functionality for all user roles (SDE/Job Seekers, HR Experts, and Referrers).

## Backend Changes

### 1. Auth Controller (`backend/src/controllers/authController.ts`)
- Added `forgotPassword` function: Generates secure reset token and sends email
- Added `resetPassword` function: Validates token and updates password
- Uses crypto for secure token generation (SHA-256 hashing)
- Token expires after 1 hour

### 2. Email Service (`backend/src/services/emailService.ts`)
- Added `sendPasswordResetEmail` function
- Sends professional HTML email with reset link
- Includes development mode console logging fallback
- Reset URL format: `${FRONTEND_URL}/reset-password?token=${resetToken}`

### 3. Routes (`backend/src/routes/auth.ts`)
- Added `POST /api/auth/forgot-password` - Request password reset
- Added `POST /api/auth/reset-password` - Reset password with token

### 4. User Model (`backend/src/models/User.ts`)
- Already includes `resetPasswordToken` and `resetPasswordExpires` fields

## Frontend Changes

### 1. Forgot Password Page (`frontend/src/pages/ForgotPassword.tsx`)
- Simplified to single-step email submission
- Sends request to `/api/auth/forgot-password`
- Shows success message without revealing if email exists (security best practice)
- Includes "Back to Login" link

### 2. Reset Password Page (`frontend/src/pages/ResetPassword.tsx`)
- Updated to use query parameters (`?token=...`)
- Validates token on page load
- Requires password confirmation
- Minimum 6 characters password validation
- Auto-redirects to login after successful reset

### 3. Login Pages
- **Seeker Login** (`frontend/src/components/Login.tsx`) - Already has forgot password link ✓
- **Referrer Login** (`frontend/src/pages/ReferrerLoginPage.tsx`) - Already has forgot password link ✓
- **HR Login** (`frontend/src/pages/HRLoginPage.tsx`) - Added forgot password link ✓

### 4. App Routing (`frontend/src/App.tsx`)
- Updated route from `/reset-password/:token` to `/reset-password` (uses query params)

## API Endpoints

### Request Password Reset
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "If the email exists, a reset link has been sent" }
```

### Reset Password
```
POST /api/auth/reset-password
Body: { "token": "reset_token_here", "password": "newpassword123" }
Response: { "success": true, "message": "Password reset successful" }
```

## Security Features

1. **Token Security**
   - Cryptographically secure random tokens (32 bytes)
   - SHA-256 hashing before storage
   - 1-hour expiration
   - Single-use tokens (deleted after use)

2. **Email Privacy**
   - Generic success message (doesn't reveal if email exists)
   - Prevents user enumeration attacks

3. **Password Requirements**
   - Minimum 6 characters
   - Bcrypt hashing with salt rounds of 12

4. **Rate Limiting**
   - Consider adding rate limiting to prevent abuse (future enhancement)

## User Flow

1. User clicks "Forgot password?" on any login page
2. User enters email address
3. System sends reset email (if account exists)
4. User clicks link in email → redirects to `/reset-password?token=...`
5. User enters new password (with confirmation)
6. Password is reset, user redirected to login
7. User logs in with new password

## Email Template

Professional gradient-styled email includes:
- RefDirectly branding
- Clear "Reset Password" button
- Expiration warning (1 hour)
- Fallback text link
- Security notice

## Testing

### Development Mode
- If email service not configured, reset links are logged to console
- Format: `Reset URL: ${FRONTEND_URL}/reset-password?token=${token}`

### Production
- Requires EMAIL_USER and EMAIL_PASSWORD environment variables
- Uses Gmail SMTP service

## Environment Variables Required

```env
FRONTEND_URL=https://your-frontend-url.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
JWT_SECRET=your-jwt-secret
```

## Future Enhancements

1. Add rate limiting to prevent abuse
2. Add password strength meter on reset page
3. Send confirmation email after successful password reset
4. Add "Remember this device" functionality
5. Implement 2FA for additional security
