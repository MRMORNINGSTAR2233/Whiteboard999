# Implementation Plan - User Management Improvements

- [ ] 1. Update database schema with role and lastLoginAt fields
  - Add `role` enum field to User model with values USER and ADMIN
  - Add `lastLoginAt` DateTime field to User model
  - Create and run Prisma migration
  - Update Prisma client types
  - _Requirements: 2.1, 2.2_

- [ ] 2. Create authorization utility functions
  - [ ] 2.1 Implement requireAuth() function
    - Create lib/auth-utils.ts file
    - Write requireAuth() to check session and throw if unauthorized
    - Return session object for authenticated users
    - _Requirements: 1.4, 2.3_
  
  - [ ] 2.2 Implement requireAdmin() function
    - Write requireAdmin() to check user role from database
    - Throw error if user is not ADMIN
    - Return session object for admin users
    - _Requirements: 2.3, 2.4, 2.5_
  
  - [ ] 2.3 Implement isAdmin() helper function
    - Write isAdmin(userId) to check if user has ADMIN role
    - Return boolean result
    - _Requirements: 2.6_

- [ ] 3. Optimize Prisma logging configuration
  - [ ] 3.1 Update Prisma client initialization
    - Modify lib/prisma.ts to use environment-based log levels
    - Create getLogLevel() function to determine log configuration
    - Set default to ['warn', 'error'] for development
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 3.2 Add PRISMA_LOG_LEVEL environment variable
    - Update .env.local with PRISMA_LOG_LEVEL=default
    - Add .env.example with logging options documented
    - Support 'default', 'verbose', and 'debug' values
    - _Requirements: 3.2, 3.5_

- [ ] 4. Implement profile API routes
  - [ ] 4.1 Create GET /api/user/profile route
    - Create app/api/user/profile/route.ts file
    - Use requireAuth() to verify authentication
    - Fetch user data with whiteboard, share, and comment counts
    - Update lastLoginAt timestamp on each request
    - Return UserProfile response object
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 4.2 Create PATCH /api/user/profile route
    - Add PATCH handler to profile route file
    - Use requireAuth() to verify authentication
    - Validate name (1-100 chars) and image (valid URL) inputs
    - Update user record with new name and/or image
    - Return updated user profile
    - _Requirements: 1.5_

- [ ] 5. Build profile page UI
  - [ ] 5.1 Create profile page component
    - Create app/profile/page.tsx as server component
    - Fetch user profile data from API
    - Handle loading and error states
    - Redirect to login if not authenticated
    - _Requirements: 1.1, 1.4_
  
  - [ ] 5.2 Create ProfileHeader component
    - Create components/profile/profile-header.tsx
    - Display user avatar, name, and email
    - Show role badge (USER or ADMIN)
    - Add edit profile button
    - _Requirements: 1.2, 2.7_
  
  - [ ] 5.3 Create ProfileStats component
    - Create components/profile/profile-stats.tsx
    - Display whiteboard count, shared count, comment count
    - Show account creation date and last login
    - Use card layout with icons
    - _Requirements: 1.3_
  
  - [ ] 5.4 Create EditProfileDialog component
    - Create components/profile/edit-profile-dialog.tsx
    - Build form with name and image URL inputs
    - Add validation for inputs
    - Call PATCH /api/user/profile on submit
    - Show success/error messages
    - _Requirements: 1.5_

- [ ] 6. Implement admin route protection
  - [ ] 6.1 Update middleware for admin routes
    - Modify middleware.ts to check role for /admin paths
    - Use prisma to fetch user role
    - Redirect non-admin users to home page
    - Add /profile to protected routes
    - _Requirements: 2.3, 2.4_
  
  - [ ] 6.2 Update admin API routes with role checks
    - Modify app/api/admin/stats/route.ts to use requireAdmin()
    - Modify app/api/admin/users/route.ts to use requireAdmin()
    - Return 403 Forbidden for non-admin users
    - Handle authorization errors consistently
    - _Requirements: 2.5_
  
  - [ ] 6.3 Update admin navigation visibility
    - Modify components/admin/admin-sidebar.tsx or navigation
    - Check user role before showing admin links
    - Hide admin menu items for non-admin users
    - _Requirements: 2.7_

- [ ] 7. Add database seed for admin user
  - Update scripts/seed-database.ts to create admin user
  - Set role to ADMIN for seed admin account
  - Document how to manually promote users to admin
  - _Requirements: 2.2_

- [ ] 8. Update NextAuth callbacks for lastLoginAt
  - Modify lib/auth.ts signIn callback
  - Update lastLoginAt timestamp on successful login
  - Handle both OAuth and credentials providers
  - _Requirements: 1.3_

- [ ] 9. Add error handling and validation
  - Add try-catch blocks to all new API routes
  - Validate profile update inputs (name length, image URL format)
  - Return consistent error response format
  - Log errors for debugging
  - _Requirements: All_

- [ ] 10. Update TypeScript types
  - Create types/profile.ts with UserProfile interface
  - Create ProfileUpdateRequest interface
  - Export Role enum type
  - Update session type to include role if needed
  - _Requirements: All_
