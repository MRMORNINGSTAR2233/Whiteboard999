import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { getCurrentUser, requireAuth } from '@/lib/clerk-auth'

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}))

describe('Clerk Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return null if not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server')
      auth.mockResolvedValue({ userId: null })

      const result = await getCurrentUser()
      expect(result).toBeNull()
    })

    it('should return user data if authenticated', async () => {
      const { auth, currentUser } = require('@clerk/nextjs/server')
      auth.mockResolvedValue({ userId: 'user_123' })
      currentUser.mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
      })

      const result = await getCurrentUser()
      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      })
    })
  })

  describe('requireAuth', () => {
    it('should throw error if not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server')
      auth.mockResolvedValue({ userId: null })

      await expect(requireAuth()).rejects.toThrow('Unauthorized')
    })

    it('should return user data if authenticated', async () => {
      const { auth, currentUser } = require('@clerk/nextjs/server')
      auth.mockResolvedValue({ userId: 'user_123' })
      currentUser.mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Jane',
        lastName: 'Smith',
        imageUrl: null,
      })

      const result = await requireAuth()
      expect(result.id).toBe('user_123')
      expect(result.email).toBe('test@example.com')
    })
  })
})
