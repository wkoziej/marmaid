import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { auditService } from '../audit'
import { supabase } from '../supabase'
import type { AuditEvent, AuditEventType, AuditSeverity } from '../audit'

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => {
        const queryChain = {
          eq: vi.fn(() => queryChain),
          in: vi.fn(() => queryChain),
          gte: vi.fn(() => queryChain),
          lte: vi.fn(() => queryChain),
          order: vi.fn(() => queryChain),
          range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        }
        // Default resolved value for terminal operations
        Object.assign(queryChain, {
          then: vi.fn((resolve) => resolve({ data: [], error: null }))
        })
        return queryChain
      })
    }))
  }
}))

// Mock window and navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)'
  },
  writable: true
})

const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  app_metadata: { provider: 'email' }
}

const mockSession = {
  user: mockUser,
  access_token: 'mock-access-token-1234567890abcdef'
}

describe('Audit Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset service state completely
    auditService.reset()
    
    // Mock successful session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with current session', async () => {
      await auditService.initialize()
      
      expect(supabase.auth.getSession).toHaveBeenCalled()
      expect(auditService.getCurrentUser()).toBeTruthy()
    })

    it('should handle missing session gracefully', async () => {
      // Reset and mock no session
      auditService.reset()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      })

      await auditService.initialize()
      
      expect(auditService.getCurrentUser()).toBeNull()
    })

    it('should handle session errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      vi.mocked(supabase.auth.getSession).mockRejectedValue(new Error('Session error'))

      await auditService.initialize()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize audit service:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Basic Event Logging', () => {
    beforeEach(async () => {
      await auditService.initialize()
    })

    it('should log audit events successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await auditService.logEvent(
        'data_modify',
        'create',
        'therapy_note',
        'medium',
        { client_id: 'test-client' },
        'note-123'
      )

      expect(result).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'data_modify',
          action: 'create',
          resource_type: 'therapy_note',
          resource_id: 'note-123',
          user_id: mockUser.id,
          user_email: mockUser.email,
          severity: 'medium',
          details: { client_id: 'test-client' }
        })
      )
    })

    it('should require authenticated user for logging', async () => {
      // Reset service and set no session
      auditService.reset()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      })
      
      await auditService.initialize()

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await auditService.logEvent(
        'security',
        'failed_access',
        'system'
      )

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Audit logging attempted without authenticated user'
      )

      consoleSpy.mockRestore()
    })

    it('should handle database errors gracefully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ 
        error: new Error('Database error') 
      })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await auditService.logEvent(
        'data_access',
        'read',
        'therapy_note'
      )

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to log audit event:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should log critical events to console', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await auditService.logEvent(
        'security',
        'data_breach_attempt',
        'system',
        'critical',
        { ip: '192.168.1.100' }
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'CRITICAL AUDIT EVENT:',
        expect.objectContaining({
          type: 'security',
          action: 'data_breach_attempt',
          userId: mockUser.id,
          timestamp: expect.any(String)
        })
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Specific Event Type Logging', () => {
    beforeEach(async () => {
      await auditService.initialize()
    })

    it('should log authentication events', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await auditService.logAuth('login', true, { provider: 'email' })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'auth',
          action: 'login',
          resource_type: 'user_session',
          severity: 'medium',
          details: { success: true, provider: 'email' }
        })
      )
    })

    it('should use high severity for failed auth', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await auditService.logAuth('login', false, { error: 'Invalid password' })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'high',
          details: { success: false, error: 'Invalid password' }
        })
      )
    })

    it('should log data access events', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await auditService.logDataAccess(
        'read',
        'therapy_note',
        'note-123',
        { encrypted: true }
      )

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'data_access',
          action: 'read',
          resource_type: 'therapy_note',
          resource_id: 'note-123',
          severity: 'low',
          details: { encrypted: true }
        })
      )
    })

    it('should log data modification events', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await auditService.logDataModify(
        'update',
        'therapy_note',
        'note-123',
        { fields: ['notes', 'recommendations'] }
      )

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'data_modify',
          action: 'update',
          severity: 'medium'
        })
      )
    })

    it('should use high severity for delete operations', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await auditService.logDataModify('delete', 'therapy_note', 'note-123')

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'high'
        })
      )
    })

    it('should log security events', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await auditService.logSecurity(
        'session_timeout',
        'medium',
        { session_duration: 3600 }
      )

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'security',
          action: 'session_timeout',
          resource_type: 'security_system',
          severity: 'medium'
        })
      )
    })

    it('should log administrative actions', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await auditService.logAdmin(
        'user_role_change',
        'user_account',
        { new_role: 'admin' },
        'user-456'
      )

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'admin',
          action: 'user_role_change',
          resource_type: 'user_account',
          resource_id: 'user-456',
          severity: 'high'
        })
      )
    })
  })

  describe('Query and Reporting', () => {
    beforeEach(async () => {
      await auditService.initialize()
    })

    it('should query logs with filters', async () => {
      const mockData = [
        {
          id: '1',
          event_type: 'auth',
          action: 'login',
          severity: 'medium',
          timestamp: new Date().toISOString()
        }
      ]

      // Mock specific query chain for this test
      const mockSelect = vi.fn(() => {
        const queryChain = {
          in: vi.fn(() => queryChain),
          order: vi.fn(() => queryChain),
          range: vi.fn().mockResolvedValue({ 
            data: mockData, 
            error: null, 
            count: 1 
          })
        }
        return queryChain
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any)

      const result = await auditService.queryLogs({
        event_type: ['auth'],
        severity: ['medium'],
        limit: 10
      })

      expect(result.events).toEqual(mockData)
      expect(result.total).toBe(1)
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' })
    })

    it('should get audit summary', async () => {
      const mockEvents = [
        { event_type: 'auth', severity: 'medium' },
        { event_type: 'data_access', severity: 'low' },
        { event_type: 'security', severity: 'high' }
      ]

      const mockOrder = vi.fn().mockResolvedValue({ 
        data: mockEvents, 
        error: null 
      })
      const mockGte = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ gte: mockGte })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any)

      const summary = await auditService.getSummary(7)

      expect(summary.total_events).toBe(3)
      expect(summary.events_by_type.auth).toBe(1)
      expect(summary.events_by_type.data_access).toBe(1)
      expect(summary.events_by_type.security).toBe(1)
      expect(summary.events_by_severity.low).toBe(1)
      expect(summary.events_by_severity.medium).toBe(1)
      expect(summary.events_by_severity.high).toBe(1)
    })

    it('should get security alerts', async () => {
      const mockAlerts = [
        {
          id: '1',
          event_type: 'security',
          action: 'breach_attempt',
          severity: 'critical',
          timestamp: new Date().toISOString()
        }
      ]

      const mockOrder = vi.fn().mockResolvedValue({ 
        data: mockAlerts, 
        error: null 
      })
      const mockGte = vi.fn().mockReturnValue({ order: mockOrder })
      const mockIn = vi.fn().mockReturnValue({ gte: mockGte })
      const mockEq = vi.fn().mockReturnValue({ in: mockIn })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any)

      const alerts = await auditService.getSecurityAlerts(24)

      expect(alerts).toEqual(mockAlerts)
      expect(mockEq).toHaveBeenCalledWith('event_type', 'security')
      expect(mockIn).toHaveBeenCalledWith('severity', ['high', 'critical'])
    })

    it('should handle query errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({ 
            data: null, 
            error: new Error('Query failed'), 
            count: 0 
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any)

      const result = await auditService.queryLogs({})

      expect(result.events).toEqual([])
      expect(result.total).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to query audit logs:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Export and Compliance', () => {
    beforeEach(async () => {
      await auditService.initialize()
    })

    it('should export logs as JSON', async () => {
      const mockEvents = [
        {
          id: '1',
          event_type: 'auth',
          action: 'login',
          timestamp: '2025-01-12T12:00:00Z'
        }
      ]

      // Mock queryLogs method
      vi.spyOn(auditService, 'queryLogs').mockResolvedValue({
        events: mockEvents as any[],
        total: 1
      })

      const exported = await auditService.exportLogs({}, 'json')

      expect(exported).toBe(JSON.stringify(mockEvents, null, 2))
    })

    it('should export logs as CSV', async () => {
      const mockEvents = [
        {
          id: '1',
          event_type: 'auth',
          action: 'login',
          resource_type: 'user_session',
          resource_id: '',
          user_id: 'user-123',
          user_email: 'test@example.com',
          ip_address: '127.0.0.1',
          severity: 'medium',
          timestamp: '2025-01-12T12:00:00Z',
          details: { success: true }
        }
      ]

      vi.spyOn(auditService, 'queryLogs').mockResolvedValue({
        events: mockEvents as any[],
        total: 1
      })

      const exported = await auditService.exportLogs({}, 'csv')

      expect(exported).toContain('ID,Event Type,Action,Resource Type')
      expect(exported).toContain('"1","auth","login","user_session"')
      expect(exported).toContain('{"success":true}')
    })

    it('should return empty CSV for no events', async () => {
      vi.spyOn(auditService, 'queryLogs').mockResolvedValue({
        events: [],
        total: 0
      })

      const exported = await auditService.exportLogs({}, 'csv')

      expect(exported).toBe('')
    })

    it('should handle export errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(auditService, 'queryLogs').mockRejectedValue(new Error('Export failed'))

      const exported = await auditService.exportLogs({})

      expect(exported).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Audit export error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Session Management', () => {
    beforeEach(async () => {
      await auditService.initialize()
    })

    it('should update session data', () => {
      auditService.updateSession({
        ipAddress: '192.168.1.100',
        userAgent: 'Custom User Agent'
      })

      // Test by triggering a log event and checking the data
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      auditService.logEvent('auth', 'test', 'session')

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          ip_address: '192.168.1.100',
          user_agent: 'Custom User Agent'
        })
      )
    })

    it('should return current user', () => {
      const user = auditService.getCurrentUser()
      expect(user).toEqual(mockUser)
    })
  })
}) 