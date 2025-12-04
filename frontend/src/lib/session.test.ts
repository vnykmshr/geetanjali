import { describe, it, expect, beforeEach } from 'vitest'
import { getSessionId, clearSessionId, hasSessionId } from './session'

describe('session management', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
  })

  describe('getSessionId', () => {
    it('should generate a new session ID if none exists', () => {
      const sessionId = getSessionId()

      expect(sessionId).toBeDefined()
      expect(typeof sessionId).toBe('string')
      expect(sessionId.length).toBeGreaterThan(0)
    })

    it('should return the same session ID on subsequent calls', () => {
      const firstId = getSessionId()
      const secondId = getSessionId()

      expect(firstId).toBe(secondId)
    })

    it('should store the session ID in sessionStorage', () => {
      const sessionId = getSessionId()
      const stored = sessionStorage.getItem('geetanjali_session_id')

      expect(stored).toBe(sessionId)
    })

    it('should return existing session ID from storage', () => {
      const existingId = 'existing-session-123'
      sessionStorage.setItem('geetanjali_session_id', existingId)

      const sessionId = getSessionId()

      expect(sessionId).toBe(existingId)
    })
  })

  describe('clearSessionId', () => {
    it('should remove the session ID from storage', () => {
      getSessionId() // Ensure one exists
      expect(hasSessionId()).toBe(true)

      clearSessionId()

      expect(hasSessionId()).toBe(false)
      expect(sessionStorage.getItem('geetanjali_session_id')).toBeNull()
    })

    it('should allow a new session ID to be generated after clearing', () => {
      const firstId = getSessionId()
      clearSessionId()
      const secondId = getSessionId()

      expect(firstId).not.toBe(secondId)
    })
  })

  describe('hasSessionId', () => {
    it('should return false when no session ID exists', () => {
      expect(hasSessionId()).toBe(false)
    })

    it('should return true when session ID exists', () => {
      getSessionId()
      expect(hasSessionId()).toBe(true)
    })

    it('should return false after clearing session', () => {
      getSessionId()
      clearSessionId()
      expect(hasSessionId()).toBe(false)
    })
  })
})
