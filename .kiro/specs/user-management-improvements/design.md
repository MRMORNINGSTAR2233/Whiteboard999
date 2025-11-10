# Design Document - User Management Improvements

## Overview

This design implements three key improvements to the user management system:
1. A user profile page at `/profile` for viewing and managing account information
2. A role-based access control (RBAC) system with USER and ADMIN roles
3. Optimized Prisma query logging to reduce console noise in development

The design leverages the existing NextAuth authentication system and Prisma database schema, extending them with minimal changes to support these new features.

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Profile Page (/profile)                                     │
│  - User Info Display                                         │
│  - Statistics Dashboard                                      │
│  - Profile Edit Form                                         │
│                                                              │
│  Admin Dashboard (Enhanced)                                  │
│  - Role-based Navigation                                     │
│  - Admin-only Features                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  /api/user/profile (GET, PATCH)                             │
│  /api/admin/* (Enhanced with role checks)                   │
│                                                              │
│  Middleware: Role-based Authorization                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│  User Model (Enhanced with role field)                      │
│  - id, email, name, image, role                             │
│  - createdAt, updatedAt, lastLoginAt                        │
│                                                              │
│  Prisma Client (Optimized logging)                          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Schema Changes

**User Model Enhancement:**
```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String?
  image         String?
  emailVerified DateTime?
  role          Role         @default(USER)  // NEW FIELD
  lastLoginAt   DateTime?                    // NEW FIELD
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  // ... existing relations
}

enum Role {
  USER
  ADMIN
}
```

**Rationale:** Adding a `role` enum field provides type-safe role management. The `lastLoginAt` field enables tracking user activity for the profile page.

### 2. Authorization Utilities

**lib/auth-utils.ts:**
```typescript
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  
  if (user?.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required")
  }
  
  return session
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  return user?.role === "ADMIN"
}
```

**Rationale:** Centralized authorization functions reduce code duplication and ensure consistent security checks across all admin routes.

### 3. Profile API Routes

**GET /api/user/profile:**
- Returns user profile data including:
  - Basic info (name, email, image, role)
  - Account metadata (createdAt, lastLoginAt)
  - Statistics (whiteboard count, shared whiteboard count, comment count)
- Requires authentication
- Updates lastLoginAt timestamp on each call

**PATCH /api/user/profile:**
- Accepts: `{ name?: string, image?: string }`
- Updates user profile information
- Requires authentication
- Only allows users to update their own profile

### 4. Profile Page Component

**app/profile/page.tsx:**
- Server component that fetches user data
- Displays user information in cards:
  - Account Information Card
  - Activity Statistics Card
  - Recent Whiteboards Card
- Includes edit profile dialog
- Protected by middleware (redirects if not authenticated)

**Components:**
- `ProfileHeader`: Displays avatar, name, email, role badge
- `ProfileStats`: Shows whiteboard count, shares, comments
- `EditProfileDialog`: Form for updating name and image
- `RecentActivity`: List of recent whiteboards and comments

### 5. Admin Route Protection

**Enhanced Middleware:**
Update existing middleware to check admin role for `/admin` routes:

```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Check authentication
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }
  
  // Check admin access for admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/whiteboard/:path*", "/admin/:path*", "/profile"]
}
```

**Admin API Routes:**
All `/api/admin/*` routes will use `requireAdmin()` utility:

```typescript
export async function GET(request: NextRequest) {
  try {
    await requireAdmin() // Throws if not admin
    
    // ... admin logic
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    throw error
  }
}
```

### 6. Prisma Logging Configuration

**lib/prisma.ts Enhancement:**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Determine log level based on environment variable
const getLogLevel = () => {
  if (process.env.PRISMA_LOG_LEVEL === 'debug') {
    return ['query', 'info', 'warn', 'error']
  }
  if (process.env.PRISMA_LOG_LEVEL === 'verbose') {
    return ['query', 'warn', 'error']
  }
  // Default: only warnings and errors
  return process.env.NODE_ENV === 'development' 
    ? ['warn', 'error'] 
    : ['error']
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: getLogLevel(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Environment Variables:**
```env
# .env.local
# Options: 'default' (warn/error only), 'verbose' (includes queries), 'debug' (all logs)
PRISMA_LOG_LEVEL=default
```

**Rationale:** This approach reduces console noise by default while allowing developers to enable detailed logging when debugging database issues.

## Data Models

### User Profile Response
```typescript
interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  role: "USER" | "ADMIN"
  emailVerified: Date | null
  createdAt: Date
  lastLoginAt: Date | null
  stats: {
    whiteboardCount: number
    sharedWhiteboardCount: number
    commentCount: number
  }
}
```

### Profile Update Request
```typescript
interface ProfileUpdateRequest {
  name?: string
  image?: string
}
```

## Error Handling

### Authentication Errors
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User authenticated but lacks required role
- **404 Not Found**: User profile not found

### Validation Errors
- **400 Bad Request**: Invalid profile update data
- Name must be 1-100 characters
- Image must be valid URL

### Error Response Format
```typescript
{
  error: string
  details?: string
}
```

## Testing Strategy

### Unit Tests
1. **Authorization Utilities**
   - Test `requireAuth()` with valid/invalid sessions
   - Test `requireAdmin()` with USER and ADMIN roles
   - Test `isAdmin()` function

2. **Profile API Routes**
   - Test GET /api/user/profile with authenticated user
   - Test GET /api/user/profile without authentication
   - Test PATCH /api/user/profile with valid data
   - Test PATCH /api/user/profile with invalid data

3. **Admin Route Protection**
   - Test admin routes with ADMIN role
   - Test admin routes with USER role
   - Test admin routes without authentication

### Integration Tests
1. **Profile Page Flow**
   - Navigate to /profile as authenticated user
   - View profile information
   - Edit profile and verify changes
   - Verify redirect when not authenticated

2. **Admin Access Flow**
   - Access admin dashboard as ADMIN
   - Verify USER cannot access admin routes
   - Verify admin API endpoints require ADMIN role

3. **Logging Configuration**
   - Verify default logging shows only warnings/errors
   - Verify PRISMA_LOG_LEVEL=verbose shows queries
   - Verify PRISMA_LOG_LEVEL=debug shows all logs

### Manual Testing Checklist
- [ ] Profile page displays correct user information
- [ ] Profile edit form updates user data
- [ ] Admin users can access admin dashboard
- [ ] Non-admin users cannot access admin routes
- [ ] Console shows reduced Prisma logs by default
- [ ] Setting PRISMA_LOG_LEVEL=verbose enables query logs
- [ ] Role badge displays correctly on profile page
- [ ] lastLoginAt updates on profile page visit

## Security Considerations

1. **Role Assignment**: Only allow role changes through direct database access or a separate admin tool, never through user-facing APIs
2. **Session Management**: Verify role on each admin request, don't cache in JWT
3. **Profile Updates**: Users can only update their own profile, validated by session user ID
4. **Admin Enumeration**: Don't expose whether a user is admin in public APIs
5. **Logging**: Ensure query logs don't expose sensitive data in production

## Performance Considerations

1. **Profile Page**: Use single query with includes to fetch user data and stats
2. **Admin Checks**: Cache role checks in middleware for duration of request
3. **Logging**: Reduced logging improves performance in development
4. **Database Indexes**: Existing indexes on User.id sufficient for profile queries

## Migration Strategy

1. Add `role` and `lastLoginAt` fields to User model
2. Run Prisma migration to update database schema
3. Set existing users to USER role by default
4. Manually promote specific users to ADMIN role via database
5. Deploy authorization utilities and updated routes
6. Deploy profile page and admin route protection
7. Update Prisma client configuration for logging
