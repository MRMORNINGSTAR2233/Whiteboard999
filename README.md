# AI Whiteboard - Professional Collaboration Platform

🎨 A powerful, AI-enhanced whiteboard application with real-time collaboration, advanced analytics, and enterprise-grade features.

## ✨ Features

### Core Features
- **AI-Powered Diagram Generation** - Create flowcharts, mindmaps, UML diagrams, and more with natural language
- **Professional Drawing Tools** - Built on TLDraw for smooth, responsive canvas experience
- **Real-time Collaboration** - Live cursor tracking, presence indicators, and synchronized editing via Pusher
- **Smart Templates** - 15+ pre-built templates for common use cases
- **Multi-Format Export** - Export to PNG, SVG, PDF, JSON, Markdown, HTML, PowerPoint, and Excalidraw
- **Comment System** - Add comments with replies, resolve threads, and mention collaborators
- **Keyboard Shortcuts** - Full keyboard navigation for power users

### Authentication & Security
- **Clerk Authentication** - Secure OAuth with Google, GitHub, and email/password
- **Role-Based Access** - User and Admin roles with granular permissions
- **Rate Limiting** - Upstash Redis-powered rate limiting for API protection
- **Input Validation** - Zod-based validation for all user inputs
- **Security Headers** - Production-ready security headers (HSTS, CSP, etc.)
- **Error Monitoring** - Sentry integration for production error tracking

### Collaboration Features
- **Share Whiteboards** - Share with VIEW or EDIT permissions
- **Email Notifications** - Resend-powered notifications for shares and comments
- **Presence Tracking** - See who's online and viewing the whiteboard
- **Cursor Sync** - Real-time cursor positions of all collaborators
- **Shape Sync** - Live synchronization of all drawing operations

### Analytics & Admin
- **Usage Analytics** - Track user activity, feature usage, and engagement metrics
- **Admin Dashboard** - User management, system settings, and usage statistics
- **Audit Logs** - Complete audit trail of all admin actions
- **CSV Export** - Export analytics data for external analysis
- **User Onboarding** - Interactive tutorials for new users

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm (included with Node.js)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Whiteboard999
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

4. **Configure required services** in `.env.local`:

#### Database (Required)
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

#### Clerk Authentication (Required)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```
Get keys from [clerk.com](https://clerk.com)

#### Groq AI (Required for AI features)
```env
GROQ_API_KEY=gsk_...
```
Get key from [console.groq.com](https://console.groq.com)

#### Pusher (Required for real-time collaboration)
```env
NEXT_PUBLIC_PUSHER_APP_KEY=...
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
```
Get credentials from [pusher.com](https://pusher.com)

#### Optional Services
```env
# Email notifications
RESEND_API_KEY=re_...

# Rate limiting  
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Error monitoring
NEXT_PUBLIC_SENTRY_DSN=...
```

5. **Set up the database:**
```bash
npm run db:setup
```
This will run migrations and seed initial data.

6. **Start the development server:**
```bash
npm run dev
```

7. **Open your browser:**
Visit [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[Clerk Setup](CLERK_SETUP.md)** - Authentication configuration guide
- **[Email Setup](EMAIL_SETUP.md)** - Email notification configuration
- **[Task 3 Completion](TASK3_CLERK_COMPLETION.md)** - Clerk migration summary

## 🏗️ Architecture

### Tech Stack
- **Framework:** Next.js 14.2.33 with App Router
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk (OAuth + Email/Password)
- **Real-time:** Pusher (WebSocket alternative)
- **Canvas:** TLDraw v2
- **AI:** Groq API (Llama 3.3 70B)
- **Email:** Resend with React Email
- **UI:** Radix UI + Tailwind CSS v4
- **Language:** TypeScript 5
- **Testing:** Jest + React Testing Library
- **Monitoring:** Sentry
- **Rate Limiting:** Upstash Redis

### Project Structure
```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── whiteboard/        # Whiteboard pages
│   └── (auth pages)
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── whiteboard/       # Whiteboard-specific components
│   └── admin/            # Admin dashboard components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Database client
│   ├── clerk-auth.ts     # Authentication helpers
│   ├── rate-limit.ts     # Rate limiting
│   ├── validation.ts     # Input validation
│   └── exporters/        # Export format converters
├── hooks/                 # Custom React hooks
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── __tests__/            # Test files
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## 🔒 Security

This application implements multiple layers of security:

1. **Authentication** - Clerk handles all auth flows with industry best practices
2. **Authorization** - Role-based access control with middleware protection
3. **Rate Limiting** - Configurable rate limits per endpoint type
4. **Input Validation** - Zod schemas validate all user inputs
5. **SQL Injection Protection** - Prisma ORM with parameterized queries
6. **XSS Protection** - Input sanitization and CSP headers
7. **CSRF Protection** - Built into Next.js
8. **Security Headers** - HSTS, X-Frame-Options, CSP, etc.

## 📊 Database Schema

Key models:
- **User** - User accounts with Clerk integration
- **Whiteboard** - Canvas data and metadata
- **WhiteboardShare** - Sharing permissions
- **Comment** - Comments and replies
- **AnalyticsEvent** - Usage tracking
- **AuditLog** - Admin action logs
- **UserOnboarding** - Tutorial progress

See `prisma/schema.prisma` for complete schema.

## 🚀 Deployment

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Environment Variables
Ensure all required environment variables are set in your production environment. See `.env.local` for the complete list.

### Recommended Platforms
- **Vercel** - Optimized for Next.js (recommended)
- **Railway** - Easy PostgreSQL + app hosting
- **Render** - Full-stack hosting
- **AWS/GCP/Azure** - Enterprise deployments

## 🎯 API Reference

### Whiteboard API
- `GET /api/whiteboards` - List user's whiteboards
- `POST /api/whiteboards` - Create new whiteboard
- `GET /api/whiteboards/[id]` - Get whiteboard details
- `PATCH /api/whiteboards/[id]` - Update whiteboard
- `DELETE /api/whiteboards/[id]` - Delete whiteboard
- `POST /api/whiteboards/[id]/share` - Share whiteboard
- `POST /api/whiteboards/[id]/export` - Export whiteboard

### Comment API
- `GET /api/whiteboards/[id]/comments` - List comments
- `POST /api/whiteboards/[id]/comments` - Create comment
- `PATCH /api/whiteboards/[id]/comments/[commentId]` - Update comment
- `DELETE /api/whiteboards/[id]/comments/[commentId]` - Delete comment

### Admin API
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/[id]` - Update user
- `GET /api/admin/audit-logs` - Audit log entries

### Analytics API
- `POST /api/analytics/track` - Track event
- `GET /api/analytics/overview` - Analytics overview
- `GET /api/analytics/export-csv` - Export analytics data

## 🛠️ Development

### Database Commands
```bash
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio
npm run db:generate     # Generate Prisma client
npm run db:reset        # Reset database
npm run db:setup        # Complete setup
```

### Code Quality
```bash
npm run lint            # Run ESLint
npm run build           # Type check + build
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📧 Support

For issues and questions:
- GitHub Issues: [repository issues]
- Documentation: See docs in this repository

---

**Built with ❤️ using Next.js, TLDraw, and Clerk**
