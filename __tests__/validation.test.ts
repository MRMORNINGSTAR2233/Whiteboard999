import { describe, it, expect } from '@jest/globals'
import { validateEmail, sanitizeInput, isValidUUID } from '@/lib/validation'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe('test@example.com')
      expect(validateEmail('user.name@domain.co.uk')).toBe('user.name@domain.co.uk')
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBeNull()
      expect(validateEmail('test@')).toBeNull()
      expect(validateEmail('@example.com')).toBeNull()
    })

    it('should normalize email addresses', () => {
      expect(validateEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")')
    })

    it('should remove event handlers', () => {
      expect(sanitizeInput('onclick="alert()"')).toBe('')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello')
    })
  })

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('invalid')).toBe(false)
      expect(isValidUUID('123-456')).toBe(false)
      expect(isValidUUID('')).toBe(false)
    })
  })
})
