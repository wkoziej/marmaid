import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { securityService } from '../services/securityService'
import { securityHeaders } from '../../../lib/security-headers'
import { supabase } from '../../../lib/supabase'

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
    }
  }
}))

// Mock window functions
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://localhost:3000'
  },
  writable: true
})

describe('Security Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful session response
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'test-user', email: 'test@example.com', created_at: new Date().toISOString() },
          access_token: 'test-token-12345678',
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        } as any
      },
      error: null
    })

    // Mock auth state change subscription
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn()
        }
      }
    } as any)
  })

  afterEach(() => {
    // Cleanup
    securityService.cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  describe('Security Service Initialization', () => {
    it('should initialize security service with configuration', async () => {
      await securityService.initializeSecurity({
        sessionTimeoutMinutes: 60,
        maxInactiveMinutes: 30,
        refreshThresholdMinutes: 5,
        enableSessionMonitoring: true,
        enableSecurityHeaders: true,
      })

      // Should not throw error
      expect(true).toBe(true)
    })

    it('should handle security service initialization errors gracefully', async () => {
      // Mock auth state change error
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(() => {
        throw new Error('Auth state error')
      })

      // Should handle error gracefully
      await expect(securityService.initializeSecurity()).resolves.not.toThrow()
    })
  })

  describe('Session Management', () => {
    it('should validate session correctly', async () => {
      const isValid = await securityService.isSessionValid()
      expect(typeof isValid).toBe('boolean')
    })

    it('should handle session refresh', async () => {
      // Mock successful refresh
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user', email: 'test@example.com' },
            access_token: 'new-token-87654321',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          } as any,
          user: { id: 'test-user', email: 'test@example.com' } as any
        },
        error: null
      })

      const result = await securityService.forceRefresh()
      expect(typeof result).toBe('boolean')
    })

    it('should handle expired sessions', async () => {
      // Mock expired session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user', email: 'test@example.com', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
            access_token: 'expired-token',
            expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          } as any
        },
        error: null
      })

      const isValid = await securityService.isSessionValid()
      expect(isValid).toBe(false)
    })

    it('should get session status', async () => {
      const status = await securityService.getSessionStatus()
      
      expect(status).toHaveProperty('isValid')
      expect(status).toHaveProperty('timeRemaining')
      expect(status).toHaveProperty('inactiveTime')
      expect(status).toHaveProperty('lastActivity')
      
      expect(typeof status.isValid).toBe('boolean')
      expect(typeof status.timeRemaining).toBe('number')
      expect(typeof status.inactiveTime).toBe('number')
      expect(typeof status.lastActivity).toBe('string')
    })
  })

  describe('Security Headers', () => {
    it('should generate correct CSP directive', () => {
      const csp = securityHeaders.generateCSP()
      
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("object-src 'none'")
      expect(csp).toContain("https://*.supabase.co")
    })

    it('should get security headers object', () => {
      const headers = securityHeaders.getSecurityHeaders()
      
      expect(headers).toHaveProperty('contentSecurityPolicy')
      expect(headers).toHaveProperty('xFrameOptions')
      expect(headers).toHaveProperty('xContentTypeOptions')
      expect(headers).toHaveProperty('referrerPolicy')
      expect(headers).toHaveProperty('permissionsPolicy')
      
      expect(headers.xFrameOptions).toBe('DENY')
      expect(headers.xContentTypeOptions).toBe('nosniff')
    })

    it('should validate CSP compliance for URLs', () => {
      // Same origin should be allowed
      expect(securityHeaders.validateCSPCompliance('https://localhost:3000/api', 'connectSrc')).toBe(true)
      
      // Supabase URLs should be allowed
      expect(securityHeaders.validateCSPCompliance('https://test.supabase.co/rest/v1', 'connectSrc')).toBe(true)
      
      // Random external URLs should not be allowed for default policy
      expect(securityHeaders.validateCSPCompliance('https://malicious.com/api', 'connectSrc')).toBe(false)
    })

    it('should handle security violations reporting', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      securityHeaders.reportViolation({
        type: 'csp',
        message: 'Test violation',
        source: 'test-source',
        timestamp: new Date().toISOString()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Security Policy Violation:', expect.any(Object))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Session Monitoring', () => {
    it('should track session monitoring data', () => {
      const monitoringData = {
        userId: 'test-user',
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        sessionId: 'test-session',
        userAgent: 'test-agent'
      }

      localStorage.setItem('session_monitoring', JSON.stringify(monitoringData))
      
      const retrieved = securityService.getSessionMonitoringData()
      expect(retrieved).toEqual(monitoringData)
    })

    it('should return null when no monitoring data exists', () => {
      localStorage.removeItem('session_monitoring')
      
      const retrieved = securityService.getSessionMonitoringData()
      expect(retrieved).toBe(null)
    })

    it('should get security alerts', () => {
      const alerts = securityService.getSecurityAlerts()
      expect(Array.isArray(alerts)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle session refresh errors', async () => {
      // Mock refresh error
      vi.mocked(supabase.auth.refreshSession).mockRejectedValue(new Error('Refresh error'))

      const result = await securityService.forceRefresh()
      expect(result).toBe(false)
    })

    it('should handle getSession errors', async () => {
      // Mock getSession error
      vi.mocked(supabase.auth.getSession).mockRejectedValue(new Error('Session error'))

      // Should handle error gracefully and not throw
      await expect(securityService.isSessionValid()).resolves.toBe(false)
    })

    it('should handle invalid session data', async () => {
      // Mock no session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      })

      const isValid = await securityService.isSessionValid()
      expect(isValid).toBe(false)
      
      const status = await securityService.getSessionStatus()
      expect(status.isValid).toBe(false)
      expect(status.timeRemaining).toBe(0)
    })
  })

  describe('Security Service Lifecycle', () => {
    it('should cleanup properly', () => {
      // Initialize monitoring
      securityService.initializeSecurity()
      
      // Cleanup should not throw
      expect(() => securityService.cleanup()).not.toThrow()
      
      // Alerts should be cleared
      const alerts = securityService.getSecurityAlerts()
      expect(alerts).toHaveLength(0)
    })
  })
}) 