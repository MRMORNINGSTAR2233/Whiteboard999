# Clerk Authentication Setup

## Overview
This application uses Clerk for authentication and user management. Clerk provides:
- ✅ Email/Password authentication
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ Email verification
- ✅ Password reset
- ✅ User profile management
- ✅ Session management
- ✅ Webhooks for user sync

## Setup Instructions

### 1. Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy your keys and add them to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### 3. Configure Sign In/Sign Up URLs

In your Clerk dashboard under **Paths**, set:
- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/`
- **After sign-up URL**: `/`

### 4. Configure Webhooks

1. In Clerk dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/clerk`
4. For local development, use ngrok or similar tool
5. Select events to listen for:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
6. Copy the signing secret and add to `.env.local` as `CLERK_WEBHOOK_SECRET`

### 5. Test Local Webhook (Development)

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, expose localhost
ngrok http 3000

# Use the ngrok URL in Clerk webhook configuration
# e.g., https://abc123.ngrok.io/api/webhooks/clerk
```

## OAuth Providers

### Enable Google OAuth

1. In Clerk dashboard, go to **User & Authentication** → **Social Connections**
2. Enable **Google**
3. Clerk handles the OAuth configuration automatically (no need for Google Cloud Console setup)

### Enable GitHub OAuth

1. In Clerk dashboard, go to **User & Authentication** → **Social Connections**
2. Enable **GitHub**
3. Clerk handles the OAuth configuration automatically

### Custom OAuth Providers

For custom OAuth providers, you'll need to:
1. Enable the provider in Clerk dashboard
2. Add client ID and secret in Clerk settings
3. Configure redirect URIs

## How It Works

### Authentication Flow

1. User visits `/sign-in` or `/sign-up`
2. Clerk components handle authentication
3. On successful auth, Clerk creates a session
4. Webhook fires to sync user data to database
5. User is redirected to dashboard

### Database Sync

The webhook endpoint (`/api/webhooks/clerk/route.ts`) syncs:
- User ID (Clerk's user ID is primary key)
- Email
- Name (firstName + lastName)
- Username
- Profile image
- Login timestamp

### Protected Routes

Routes are protected by Clerk middleware (`middleware.ts`):
- Public: `/sign-in`, `/sign-up`, `/api/webhooks`
- Protected: All other routes require authentication
- Admin: `/admin` routes require ADMIN role

## Admin Role Assignment

To make a user admin:

```typescript
// In Clerk dashboard → Users → Select user → Metadata → Public metadata
{
  "role": "ADMIN"
}
```

Or programmatically:

```typescript
import { clerkClient } from '@clerk/nextjs/server'

await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    role: 'ADMIN'
  }
})
```

## API Usage

### Get Current User in API Routes

```typescript
import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
  const user = await currentUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // user.id is the Clerk user ID
  // Use it to query your database
}
```

### Get Current User in Components

```typescript
'use client'
import { useUser } from '@clerk/nextjs'

export function MyComponent() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <Loader />
  if (!user) return <SignIn />
  
  return <div>Hello {user.firstName}!</div>
}
```

## Customization

### Customize Sign-In/Sign-Up Pages

Clerk components are highly customizable. See `app/sign-in/[[...sign-in]]/page.tsx`:

```typescript
<SignIn
  appearance={{
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
      card: 'shadow-xl'
    }
  }}
/>
```

### Theme Customization

In Clerk dashboard → **Customization** → **Theme**, you can:
- Set brand colors
- Upload logo
- Customize button styles
- Match your app's design

## Troubleshooting

### Webhook Not Firing

1. Check webhook URL is correct
2. Verify webhook secret is set
3. Check Clerk dashboard logs
4. For local dev, ensure ngrok is running

### User Not Syncing to Database

1. Check database connection
2. Verify webhook endpoint is accessible
3. Check server logs for errors
4. Ensure Prisma schema is migrated

### "Unauthorized" Errors

1. Check `.env.local` has correct keys
2. Verify middleware configuration
3. Check if route should be public
4. Clear cookies and sign in again

## Migration from NextAuth

We've successfully migrated from NextAuth to Clerk:

✅ Removed NextAuth dependencies
✅ Updated Prisma schema (removed Account, Session, VerificationToken models)
✅ Created Clerk webhook for user sync
✅ Updated all API routes to use Clerk auth
✅ Updated frontend components to use Clerk hooks
✅ Removed old auth pages and endpoints

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Webhook Events](https://clerk.com/docs/users/sync-data)
- [User Metadata](https://clerk.com/docs/users/metadata)
