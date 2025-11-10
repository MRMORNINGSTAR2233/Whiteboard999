# Design Document - Complete AI Whiteboard Backend

## Overview

This design document outlines the architecture and implementation approach for completing the AI Whiteboard application. The solution focuses on fixing critical bugs first, then implementing backend services for data persistence, authentication, and real-time collaboration.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Home Page  │  │  Whiteboard  │  │    Admin     │     │
│  │   (List)     │  │   (TLDraw)   │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Whiteboard  │  │      AI      │  │     Auth     │     │
│  │     CRUD     │  │   Generate   │  │   (NextAuth) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Prisma)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │   WebSocket  │  │    Redis     │     │
│  │   Database   │  │   (Pusher)   │  │   (Cache)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TLDraw (Canvas)
- React 18
- TypeScript

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Database)
- NextAuth.js (Authentication)
- Pusher (Real-time) or Socket.io alternative

**AI:**
- Groq API (Llama 3.3)
- Vercel AI SDK

## Components and Interfaces

### 1. Bug Fixes

#### 1.1 TLDraw CSS Import
**Issue:** Broken dynamic CSS import  
**Solution:** Remove the unused TldrawCSS import

#### 1.2 ExportPanel Props
**Issue:** Missing 'elements' prop  
**Solution:** Pass editor instance or elements to ExportPanel

#### 1.3 Type Annotations
**Issue:** Implicit 'any' types in AI routes  
**Solution:** Add explicit type annotations

### 2. Database Schema (Prisma)

```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  whiteboards   Whiteboard[]
  comments      Comment[]
  shares        WhiteboardShare[]
}

model Whiteboard {
  id          String    @id @default(cuid())
  name        String
  icon        String    @default("🔶")
  data        Json      // TLDraw snapshot
  ownerId     String
  owner       User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  isArchived  Boolean   @default(false)
  isStarred   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  shares      WhiteboardShare[]
  comments    Comment[]
}

model WhiteboardShare {
  id            String      @id @default(cuid())
  whiteboardId  String
  whiteboard    Whiteboard  @relation(fields: [whiteboardId], references: [id], onDelete: Cascade)
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission    Permission  @default(VIEW)
  createdAt     DateTime    @default(now())
  
  @@unique([whiteboardId, userId])
}

model Comment {
  id            String      @id @default(cuid())
  whiteboardId  String
  whiteboard    Whiteboard  @relation(fields: [whiteboardId], references: [id], onDelete: Cascade)
  authorId      String
  author        User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  content       String
  x             Float
  y             Float
  resolved      Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  replies       CommentReply[]
}

model CommentReply {
  id          String    @id @default(cuid())
  commentId   String
  comment     Comment   @relation(fields: [commentId], references: [id], onDelete: Cascade)
  authorId    String
  content     String
  createdAt   DateTime  @default(now())
}

enum Permission {
  VIEW
  EDIT
  ADMIN
}

// NextAuth models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### 3. API Routes Structure

```
app/api/
├── auth/
│   └── [...nextauth]/route.ts    # NextAuth configuration
├── whiteboards/
│   ├── route.ts                  # GET (list), POST (create)
│   ├── [id]/route.ts             # GET, PATCH, DELETE
│   ├── [id]/share/route.ts       # POST (share), DELETE (unshare)
│   └── [id]/comments/route.ts    # GET, POST comments
├── ai/
│   ├── generate-diagram/route.ts # (existing, fix types)
│   ├── generate-content/route.ts # (existing, fix types)
│   └── smart-suggestions/route.ts # (existing, fix types)
└── admin/
    ├── stats/route.ts            # GET analytics
    └── users/route.ts            # GET, PATCH users
```

### 4. Real-time Collaboration

**Approach:** Use Pusher (managed service) for simplicity

**Channels:**
- `presence-whiteboard-{id}` - User presence
- `private-whiteboard-{id}` - Shape updates

**Events:**
- `cursor-move` - Cursor position updates
- `shape-create` - New shape added
- `shape-update` - Shape modified
- `shape-delete` - Shape removed
- `user-join` - User joined
- `user-leave` - User left

## Data Models

### Whiteboard Data Structure

```typescript
interface WhiteboardData {
  id: string
  name: string
  icon: string
  snapshot: TLDrawSnapshot  // TLDraw's native format
  ownerId: string
  isArchived: boolean
  isStarred: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Real-time Event Structure

```typescript
interface CursorEvent {
  userId: string
  userName: string
  userAvatar: string
  x: number
  y: number
  color: string
}

interface ShapeEvent {
  action: 'create' | 'update' | 'delete'
  shapeId: string
  shapeData?: any
  userId: string
}
```

## Error Handling

### API Error Responses

```typescript
interface APIError {
  error: string
  code: string
  details?: any
  timestamp: Date
}
```

**Error Codes:**
- `AUTH_REQUIRED` - User not authenticated
- `PERMISSION_DENIED` - User lacks permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `API_KEY_MISSING` - Groq API key not configured
- `RATE_LIMIT` - Too many requests

### Client-side Error Handling

- Display toast notifications for errors
- Retry failed requests (max 3 attempts)
- Fallback to localStorage if backend unavailable
- Show connection status indicator

## Testing Strategy

### Unit Tests
- API route handlers
- Database queries
- Utility functions
- Type validations

### Integration Tests
- Authentication flow
- Whiteboard CRUD operations
- Real-time synchronization
- Export functionality

### E2E Tests
- User registration and login
- Create and edit whiteboard
- Share whiteboard with another user
- AI diagram generation
- Export whiteboard

## Implementation Phases

### Phase 1: Critical Bug Fixes (30 minutes)
- Fix TypeScript errors
- Fix ExportPanel props
- Test compilation

### Phase 2: Database Setup (1 hour)
- Install Prisma
- Create schema
- Set up PostgreSQL
- Run migrations

### Phase 3: Authentication (2 hours)
- Install NextAuth.js
- Configure providers
- Protect routes
- Update UI for auth

### Phase 4: Backend API (3 hours)
- Implement whiteboard CRUD
- Implement sharing
- Implement comments
- Update frontend to use APIs

### Phase 5: Real-time Collaboration (3 hours)
- Set up Pusher
- Implement presence
- Implement cursor sync
- Implement shape sync

### Phase 6: Admin Dashboard (2 hours)
- Implement analytics
- User management
- Usage metrics

### Phase 7: Testing & Polish (2 hours)
- Test all features
- Fix remaining bugs
- Performance optimization
- Documentation

**Total Estimated Time:** 13-15 hours
