# Email Notifications Setup Guide

## Overview
Email notifications have been integrated using Resend for the following features:
- ✅ Whiteboard share notifications
- ✅ Comment notifications
- ✅ Email verification on signup
- ✅ Password reset emails

## Setup Instructions

### 1. Get Resend API Key
1. Sign up at [https://resend.com](https://resend.com)
2. Get your API key from [https://resend.com/api-keys](https://resend.com/api-keys)
3. Copy the API key (starts with `re_`)

### 2. Configure Environment Variables
Add to your `.env.local`:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Whiteboard <noreply@yourdomain.com>
```

**Note:** If `RESEND_API_KEY` is not set, emails will be skipped with console logs (for development).

### 3. Domain Verification (Production)
For production use with a custom domain:
1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add the provided DNS records to your domain
4. Update `EMAIL_FROM` with your domain email

## Features Implemented

### 📧 Email Templates Created

#### 1. Whiteboard Share Email
**Triggers:** When a user shares a whiteboard with another user
**Recipients:** The user being granted access
**Content:**
- Who shared the whiteboard
- Whiteboard name
- Permission level (VIEW/EDIT/ADMIN)
- Direct link to open whiteboard

#### 2. Comment Notification Email
**Triggers:** When someone comments on a whiteboard
**Recipients:** Whiteboard owner and all collaborators (except commenter)
**Content:**
- Who commented
- Comment text
- Whiteboard name
- Link to view comment

#### 3. Email Verification Email
**Triggers:** On user signup
**Recipients:** New user
**Content:**
- Welcome message
- Verification link (24-hour expiry)
- What benefits email verification provides

#### 4. Password Reset Email
**Triggers:** When user requests password reset
**Recipients:** User requesting reset
**Content:**
- Reset password link (1-hour expiry)
- Security warning
- Instructions

## API Endpoints Created

### Email Verification
- **GET** `/api/auth/verify-email?token=xxx` - Verify email with token
- **POST** `/api/auth/resend-verification` - Resend verification email

### Password Reset
- **POST** `/api/auth/reset-password` - Request reset or reset with token
  - Body for request: `{ "email": "user@example.com" }`
  - Body for reset: `{ "token": "xxx", "password": "newpassword" }`

### Updated Endpoints
- **POST** `/api/whiteboards/[id]/share` - Now sends email notifications
- **POST** `/api/whiteboards/[id]/comments` - Now sends email notifications
- **POST** `/api/auth/register` - Now sends verification email

## Email Service Library

### `lib/email.ts`
Core email sending functions:
- `sendEmail()` - Base email sender
- `sendWhiteboardShareEmail()` - Share notifications
- `sendVerificationEmail()` - Email verification
- `sendPasswordResetEmail()` - Password resets
- `sendCommentNotificationEmail()` - Comment notifications

### `lib/verification.ts`
Token management:
- `generateVerificationToken()` - Create 24-hour verification tokens
- `verifyEmailToken()` - Verify and mark email as verified
- `generatePasswordResetToken()` - Create 1-hour reset tokens
- `verifyPasswordResetToken()` - Validate reset tokens
- `deletePasswordResetToken()` - Clean up used tokens

## Email Settings Page

A new settings page has been created at `/settings/email` where users can:
- View verification status
- Resend verification email
- See email notification preferences
- View setup instructions (for admins)

## Testing

### Development Testing (No API Key)
Without `RESEND_API_KEY` configured:
- Emails will be logged to console
- Shows what email would be sent
- No actual emails sent

### With API Key
1. Add valid `RESEND_API_KEY` to `.env.local`
2. Test flows:
   - Sign up a new user → Check for verification email
   - Share a whiteboard → Check recipient's email
   - Comment on whiteboard → Check collaborators' emails
   - Request password reset → Check email

### Test Email Flow
```bash
# 1. Sign up
POST /api/auth/register
{ "email": "test@example.com", "name": "Test User", "password": "password123" }

# 2. Check email for verification link
# 3. Click verification link or:
GET /api/auth/verify-email?token=<token>

# 4. Test password reset
POST /api/auth/reset-password
{ "email": "test@example.com" }

# 5. Check email for reset link
```

## Email Design

All emails feature:
- ✅ Responsive HTML design
- ✅ Plain text fallback
- ✅ Professional branding with emoji icons
- ✅ Clear call-to-action buttons
- ✅ Security notices where appropriate
- ✅ Dark mode friendly colors
- ✅ Copy-paste URL fallback

## Security Features

- ✅ Verification tokens expire after 24 hours
- ✅ Reset tokens expire after 1 hour
- ✅ Tokens deleted after use
- ✅ No user enumeration (same response for existing/non-existing users)
- ✅ Bcrypt password hashing
- ✅ Secure token generation using crypto.randomBytes

## Database Requirements

The system uses the existing `VerificationToken` model from Prisma:
```prisma
model VerificationToken {
  identifier String   // Email address
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}
```

No additional migrations needed - this model is part of NextAuth setup.

## Error Handling

- Failed email sends are logged but don't block operations
- User receives success message even if email fails (security)
- Console warnings when API key is missing
- Graceful fallback to no-email mode

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add to environment variables
3. ✅ Test signup flow
4. ✅ Test share notifications
5. ⏭️ (Optional) Add email preferences to user settings
6. ⏭️ (Optional) Add email templates customization
7. ⏭️ (Optional) Add digest emails for multiple notifications

## Support

For issues:
- Check console logs for email errors
- Verify `RESEND_API_KEY` is correct
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- Check Resend dashboard for delivery status
