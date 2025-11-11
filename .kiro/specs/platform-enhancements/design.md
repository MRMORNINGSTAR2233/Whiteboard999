# Design Document - Platform Enhancements

## Overview

This design implements four major enhancements to the AI Whiteboard platform:
1. Advanced admin management features for user and system control
2. Comprehensive analytics tracking system for data-driven insights
3. Additional export formats for better content portability
4. Interactive onboarding tutorials for improved user experience

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Admin Management UI                                         │
│  - User Management Table                                     │
│  - System Settings Panel                                     │
│  - Audit Log Viewer                                          │
│                                                              │
│  Analytics Dashboard                                         │
│  - Charts & Graphs                                           │
│  - Metrics Display                                           │
│  - Export Controls                                           │
│                                                              │
│  Onboarding System                                           │
│  - Tutorial Overlays                                         │
│  - Progress Tracking                                         │
│  - Help Center                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  /api/admin/users/[id] (PATCH, DELETE)                      │
│  /api/admin/whiteboards (GET, DELETE)                       │
│  /api/admin/settings (GET, PATCH)                           │
│  /api/admin/audit-logs (GET)                                │
│  /api/analytics/* (GET)                                     │
│  /api/whiteboards/[id]/export (POST - enhanced)             │
│  /api/user/onboarding (GET, PATCH)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│  New Models:                                                 │
│  - AnalyticsEvent                                            │
│  - AuditLog                                                  │
│  - SystemSettings                                            │
│  - UserOnboarding                                            │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Schema Extensions

```prisma
model User {
  // ... existing fields
  status        UserStatus   @default(ACTIVE)
  suspendedAt   DateTime?
  suspendedBy   String?
  onboarding    UserOnboarding?
  analyticsEvents AnalyticsEvent[]
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

model AnalyticsEvent {
  id          String    @id @default(cuid())
  userId      String?
  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  eventType   String    // login, whiteboard_create, ai_generate, export, etc.
  eventData   Json      // Additional event-specific data
  metadata    Json?     // Browser, location, etc.
  createdAt   DateTime  @default(now())
  
  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
}

model AuditLog {
  id          String    @id @default(cuid())
  actorId     String
  actor       User      @relation(fields: [actorId], references: [id])
  action      String    // suspend_user, change_role, delete_whiteboard, etc.
  targetType  String    // user, whiteboard, system
  targetId    String?
  changes     Json      // Before/after values
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
  
  @@index([actorId])
  @@index([createdAt])
}

model SystemSettings {
  id          String    @id @default(cuid())
  key         String    @unique
  value       Json
  updatedBy   String
  updatedAt   DateTime  @updatedAt
}

model UserOnboarding {
  id                    String    @id @default(cuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  welcomeCompleted      Boolean   @default(false)
  createWhiteboardCompleted Boolean @default(false)
  aiFeaturesCompleted   Boolean   @default(false)
  collaborationCompleted Boolean  @default(false)
  sharingCompleted      Boolean   @default(false)
  completedAt           DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### 2. Admin Management APIs

**PATCH /api/admin/users/[id]:**
- Update user status (suspend/activate)
- Change user role
- Update user details
- Requires admin authentication

**DELETE /api/admin/users/[id]:**
- Soft delete user account
- Cascade delete or anonymize user data
- Create audit log entry

**GET /api/admin/whiteboards:**
- List all whiteboards across platform
- Support filtering and pagination
- Include owner information

**DELETE /api/admin/whiteboards/[id]:**
- Delete any whiteboard
- Create audit log entry

**GET /api/admin/audit-logs:**
- Retrieve audit log entries
- Support filtering by actor, action, date range
- Paginated results

### 3. Analytics System

**Analytics Event Tracking:**
```typescript
interface AnalyticsEvent {
  eventType: 
    | 'user_login'
    | 'user_signup'
    | 'whiteboard_create'
    | 'whiteboard_update'
    | 'whiteboard_delete'
    | 'whiteboard_export'
    | 'ai_diagram_generate'
    | 'ai_content_generate'
    | 'ai_suggestions'
    | 'collaboration_join'
    | 'collaboration_leave'
    | 'comment_create'
    | 'share_create'
  eventData: Record<string, any>
  metadata?: {
    browser?: string
    os?: string
    location?: string
    sessionId?: string
  }
}
```

**Analytics API Endpoints:**
- GET /api/analytics/overview - Dashboard metrics
- GET /api/analytics/users - User activity metrics
- GET /api/analytics/whiteboards - Whiteboard usage metrics
- GET /api/analytics/ai-usage - AI feature usage
- GET /api/analytics/exports - Export statistics
- GET /api/analytics/collaboration - Collaboration metrics
- GET /api/analytics/export-csv - Export analytics data

**Metrics Calculated:**
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- User retention rates
- Feature adoption rates
- Average session duration
- Most active users
- Most popular features
- Export format preferences
- AI feature usage trends

### 4. Enhanced Export System

**Export Formats:**

1. **Markdown (.md)**
   - Convert shapes to markdown syntax
   - Embed images as base64 or links
   - Preserve text formatting

2. **HTML (.html)**
   - Standalone HTML file
   - Embedded CSS and JavaScript
   - Interactive elements preserved

3. **PowerPoint (.pptx)**
   - Use pptxgenjs library
   - Each shape as PowerPoint object
   - Preserve positioning and styling

4. **Excalidraw (.excalidraw)**
   - Convert TLDraw format to Excalidraw format
   - Maintain compatibility
   - Preserve drawing style

5. **Batch Export**
   - Export multiple whiteboards as ZIP
   - Support format selection per whiteboard
   - Progress indicator

**Export API Enhancement:**
```typescript
POST /api/whiteboards/[id]/export
Body: {
  format: 'png' | 'svg' | 'pdf' | 'json' | 'markdown' | 'html' | 'pptx' | 'excalidraw'
  options?: {
    quality?: number
    includeBackground?: boolean
    scale?: number
  }
}

POST /api/whiteboards/batch-export
Body: {
  whiteboardIds: string[]
  format: string
}
```

### 5. Onboarding Tutorial System

**Tutorial Steps:**

1. **Welcome Tutorial**
   - Platform overview
   - Key features introduction
   - Navigation guide

2. **Create Whiteboard Tutorial**
   - Click "New Whiteboard"
   - Name your whiteboard
   - Basic drawing tools

3. **AI Features Tutorial**
   - Generate diagram
   - AI content suggestions
   - Smart layout

4. **Collaboration Tutorial**
   - Share whiteboard
   - Real-time collaboration
   - Comments and feedback

5. **Sharing Tutorial**
   - Permission levels
   - Share links
   - Manage access

**Tutorial Implementation:**
```typescript
interface TutorialStep {
  id: string
  title: string
  description: string
  target: string // CSS selector
  placement: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'hover' | 'input'
  nextCondition?: () => boolean
}

interface Tutorial {
  id: string
  name: string
  steps: TutorialStep[]
  skippable: boolean
  autoStart: boolean
}
```

**Onboarding Components:**
- TutorialOverlay - Highlights target elements
- TutorialTooltip - Shows step instructions
- TutorialProgress - Shows completion status
- HelpCenter - Searchable documentation
- ContextualHelp - Tooltips on hover

## Data Models

### Analytics Dashboard Response
```typescript
interface AnalyticsDashboard {
  overview: {
    totalUsers: number
    activeUsers: {
      daily: number
      weekly: number
      monthly: number
    }
    totalWhiteboards: number
    totalCollaborations: number
  }
  trends: {
    userGrowth: TimeSeriesData[]
    whiteboardCreation: TimeSeriesData[]
    aiUsage: TimeSeriesData[]
  }
  topFeatures: {
    feature: string
    usageCount: number
  }[]
  exportStats: {
    format: string
    count: number
  }[]
}
```

### Audit Log Entry
```typescript
interface AuditLogEntry {
  id: string
  actor: {
    id: string
    name: string
    email: string
  }
  action: string
  targetType: string
  targetId?: string
  changes: Record<string, any>
  timestamp: Date
  ipAddress?: string
}
```

## Error Handling

- **403 Forbidden**: Non-admin attempting admin actions
- **404 Not Found**: User or resource not found
- **409 Conflict**: Cannot perform action (e.g., delete own admin account)
- **429 Too Many Requests**: Rate limiting on analytics exports
- **500 Internal Server Error**: Export generation failure

## Testing Strategy

### Unit Tests
- Analytics event tracking
- Export format converters
- Tutorial step validation
- Admin permission checks

### Integration Tests
- User suspension flow
- Analytics data aggregation
- Batch export process
- Onboarding completion tracking

### E2E Tests
- Complete onboarding flow
- Admin user management
- Export in all formats
- Analytics dashboard loading

## Performance Considerations

1. **Analytics**: Use database indexes, cache aggregated metrics
2. **Exports**: Queue large exports, use background jobs
3. **Onboarding**: Lazy load tutorial assets
4. **Admin Dashboard**: Paginate large datasets

## Security Considerations

1. **Admin Actions**: Require re-authentication for sensitive operations
2. **Audit Logs**: Immutable, cannot be deleted
3. **Analytics**: Anonymize PII in exports
4. **User Deletion**: Comply with GDPR right to be forgotten
