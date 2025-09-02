import { supabase } from '../../../lib/supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export interface SecurityConfig {
  sessionTimeoutMinutes: number
  refreshThresholdMinutes: number
  maxInactiveMinutes: number
  enableSecurityHeaders: boolean
  enableSessionMonitoring: boolean
}

export interface SessionMonitoringData {
  userId: string
  loginTime: string
  lastActivity: string
  ipAddress?: string
  userAgent?: string
  sessionId: string
}

export interface SecurityAlert {
  type: 'session_timeout' | 'invalid_session' | 'security_warning'
  message: string
  timestamp: string
  userId?: string
}

class SecurityService {
  private config: SecurityConfig = {
    sessionTimeoutMinutes: 60, // 1 hour default
    refreshThresholdMinutes: 5, // Refresh when 5 min left
    maxInactiveMinutes: 30, // 30 min inactivity timeout
    enableSecurityHeaders: true,
    enableSessionMonitoring: true,
  }

  private sessionMonitoringInterval?: NodeJS.Timeout
  private securityAlerts: SecurityAlert[] = []
  private lastActivity: Date = new Date()

  /**
   * Initialize enhanced security configuration for Supabase Auth
   */
  async initializeSecurity(customConfig?: Partial<SecurityConfig>): Promise<void> {
    this.config = { ...this.config, ...customConfig }
    
    // Configure Supabase Auth settings
    await this.configureSupabaseAuth()
    
    // Start session monitoring if enabled
    if (this.config.enableSessionMonitoring) {
      this.startSessionMonitoring()
    }

    // Set up activity tracking
    this.setupActivityTracking()
  }

  /**
   * Configure Supabase Auth with enhanced security settings
   */
  private async configureSupabaseAuth(): Promise<void> {
    try {
      // Note: These settings would typically be configured in Supabase dashboard
      // For runtime configuration, we'll handle session management manually
      
      // Configure session refresh
      supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          this.handleSessionStart(session)
        } else if (event === 'SIGNED_OUT') {
          this.handleSessionEnd()
        } else if (event === 'TOKEN_REFRESHED' && session) {
          this.handleTokenRefresh(session)
        }
      })

    } catch (error) {
      console.error('Failed to configure Supabase Auth security:', error)
      this.addSecurityAlert('security_warning', 'Failed to configure auth security settings')
    }
  }

  /**
   * Handle session start with security monitoring
   */
  private handleSessionStart(session: Session): void {
    const monitoringData: SessionMonitoringData = {
      userId: session.user.id,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessionId: session.access_token.substring(0, 8), // First 8 chars as ID
      userAgent: navigator.userAgent,
    }

    // Store monitoring data (in production, this would go to audit logs)
    localStorage.setItem('session_monitoring', JSON.stringify(monitoringData))
    
    this.lastActivity = new Date()
    // Security: Don't log full monitoring data to console in production
    console.log('Session started with security monitoring for user:', session.user.id)
  }

  /**
   * Handle session end cleanup
   */
  private handleSessionEnd(): void {
    this.stopSessionMonitoring()
    localStorage.removeItem('session_monitoring')
    this.lastActivity = new Date()
    console.log('Session ended, security monitoring stopped')
  }

  /**
   * Handle token refresh events
   */
  private handleTokenRefresh(session: Session): void {
    this.updateLastActivity()
    console.log('Token refreshed, session extended')
  }

  /**
   * Start session monitoring for timeout and security
   */
  private startSessionMonitoring(): void {
    // Check session status every minute
    this.sessionMonitoringInterval = setInterval(() => {
      this.checkSessionSecurity()
    }, 60 * 1000) // 60 seconds
  }

  /**
   * Stop session monitoring
   */
  private stopSessionMonitoring(): void {
    if (this.sessionMonitoringInterval) {
      clearInterval(this.sessionMonitoringInterval)
      this.sessionMonitoringInterval = undefined
    }
  }

  /**
   * Check session security status and handle timeouts
   */
  private async checkSessionSecurity(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return // No active session
    }

    const now = new Date()
    const sessionAge = now.getTime() - new Date(session.user.created_at).getTime()
    const inactiveTime = now.getTime() - this.lastActivity.getTime()

    // Check for session timeout
    if (sessionAge > this.config.sessionTimeoutMinutes * 60 * 1000) {
      await this.handleSessionTimeout('Session expired due to maximum duration')
      return
    }

    // Check for inactivity timeout
    if (inactiveTime > this.config.maxInactiveMinutes * 60 * 1000) {
      await this.handleSessionTimeout('Session expired due to inactivity')
      return
    }

    // Check if token needs refresh
    const expiresAt = new Date(session.expires_at! * 1000)
    const timeToExpiry = expiresAt.getTime() - now.getTime()
    
    if (timeToExpiry < this.config.refreshThresholdMinutes * 60 * 1000) {
      await this.refreshSession()
    }
  }

  /**
   * Handle session timeout
   */
  private async handleSessionTimeout(reason: string): Promise<void> {
    this.addSecurityAlert('session_timeout', reason)
    
    // Sign out user
    await supabase.auth.signOut()
    
    // Redirect to login (would be handled by auth state change)
    console.log('Session timed out:', reason)
  }

  /**
   * Refresh session token
   */
  private async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Failed to refresh session:', error)
        return false
      }

      if (data.session) {
        this.updateLastActivity()
        console.log('Session refreshed successfully')
        return true
      }

      return false
    } catch (error) {
      console.error('Session refresh error:', error)
      return false
    }
  }

  /**
   * Set up activity tracking for user interactions
   */
  private setupActivityTracking(): void {
    // Track user activity events
    const events = ['click', 'keydown', 'scroll', 'mousemove']
    
    const updateActivity = () => {
      this.updateLastActivity()
    }

    // Throttle activity updates to once per minute
    let lastUpdate = 0
    const throttledUpdate = () => {
      const now = Date.now()
      if (now - lastUpdate > 60000) { // 1 minute
        updateActivity()
        lastUpdate = now
      }
    }

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, { passive: true })
    })
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    this.lastActivity = new Date()
    
    // Update monitoring data if exists
    const monitoringData = localStorage.getItem('session_monitoring')
    if (monitoringData) {
      const data = JSON.parse(monitoringData)
      data.lastActivity = this.lastActivity.toISOString()
      localStorage.setItem('session_monitoring', JSON.stringify(data))
    }
  }

  /**
   * Add security alert
   */
  private addSecurityAlert(type: SecurityAlert['type'], message: string): void {
    const alert: SecurityAlert = {
      type,
      message,
      timestamp: new Date().toISOString(),
    }

    this.securityAlerts.push(alert)
    
    // Keep only last 10 alerts
    if (this.securityAlerts.length > 10) {
      this.securityAlerts = this.securityAlerts.slice(-10)
    }

    console.warn(`Security Alert [${type}]:`, message)
  }

  /**
   * Get current session monitoring data
   */
  getSessionMonitoringData(): SessionMonitoringData | null {
    const data = localStorage.getItem('session_monitoring')
    return data ? JSON.parse(data) : null
  }

  /**
   * Get security alerts
   */
  getSecurityAlerts(): SecurityAlert[] {
    return [...this.securityAlerts]
  }

  /**
   * Check if session is valid and not expired
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return false
      }

      const now = new Date()
      const expiresAt = new Date(session.expires_at! * 1000)
      
      return now < expiresAt
    } catch (error) {
      console.error('Error checking session validity:', error)
      return false
    }
  }

  /**
   * Force session refresh
   */
  async forceRefresh(): Promise<boolean> {
    return this.refreshSession()
  }

  /**
   * Get session security status
   */
  async getSessionStatus(): Promise<{
    isValid: boolean
    timeRemaining: number
    inactiveTime: number
    lastActivity: string
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          isValid: false,
          timeRemaining: 0,
          inactiveTime: 0,
          lastActivity: this.lastActivity.toISOString()
        }
      }

      const now = new Date()
      const expiresAt = new Date(session.expires_at! * 1000)
      const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime())
      const inactiveTime = now.getTime() - this.lastActivity.getTime()

      return {
        isValid: timeRemaining > 0,
        timeRemaining,
        inactiveTime,
        lastActivity: this.lastActivity.toISOString()
      }
    } catch (error) {
      console.error('Error getting session status:', error)
      return {
        isValid: false,
        timeRemaining: 0,
        inactiveTime: 0,
        lastActivity: this.lastActivity.toISOString()
      }
    }
  }

  /**
   * Cleanup security service
   */
  cleanup(): void {
    this.stopSessionMonitoring()
    this.securityAlerts = []
  }
}

// Export singleton instance
export const securityService = new SecurityService() 