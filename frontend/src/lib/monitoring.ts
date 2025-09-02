// ABOUTME: Monitoring and error tracking service for application health
// ABOUTME: Handles error logging, performance metrics, and user analytics
interface ErrorEvent {
  message: string
  stack?: string
  url: string
  userId?: string
  timestamp: number
  environment: string
  buildVersion?: string
}

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url: string
  environment: string
}

class MonitoringService {
  private isEnabled: boolean
  private environment: string
  private buildVersion: string

  constructor() {
    this.environment = import.meta.env.MODE || 'development'
    this.isEnabled = this.environment !== 'development'
    this.buildVersion = import.meta.env.VITE_BUILD_VERSION || 'unknown'
    
    // Initialize error tracking
    if (this.isEnabled) {
      this.setupGlobalErrorHandling()
      this.setupPerformanceMonitoring()
    }
  }

  private setupGlobalErrorHandling() {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        timestamp: Date.now(),
        environment: this.environment,
        buildVersion: this.buildVersion,
      })
    })

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled promise rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        environment: this.environment,
        buildVersion: this.buildVersion,
      })
    })
  }

  private setupPerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          this.logPerformance({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            timestamp: Date.now(),
            url: window.location.href,
            environment: this.environment,
          })

          this.logPerformance({
            name: 'dom_content_loaded',
            value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            timestamp: Date.now(),
            url: window.location.href,
            environment: this.environment,
          })
        }, 0)
      })
    }
  }

  logError(error: Partial<ErrorEvent>) {
    if (!this.isEnabled) {
      console.warn('Error:', error)
      return
    }

    const errorEvent: ErrorEvent = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      timestamp: error.timestamp || Date.now(),
      environment: this.environment,
      buildVersion: this.buildVersion,
      userId: error.userId,
    }

    // In a real implementation, you'd send this to an error tracking service
    // like Sentry, LogRocket, or Rollbar
    console.error('Logged error:', errorEvent)
    
    // For now, store in localStorage for debugging
    this.storeEvent('errors', errorEvent)
  }

  logPerformance(metric: PerformanceMetric) {
    if (!this.isEnabled) {
      console.log('Performance:', metric)
      return
    }

    // Store performance metrics
    console.info('Performance metric:', metric)
    this.storeEvent('performance', metric)
  }

  logUserAction(action: string, details?: Record<string, any>) {
    if (!this.isEnabled) {
      console.log('User action:', action, details)
      return
    }

    const event = {
      action,
      details,
      timestamp: Date.now(),
      url: window.location.href,
      environment: this.environment,
    }

    console.info('User action:', event)
    this.storeEvent('user_actions', event)
  }

  private storeEvent(type: string, event: any) {
    try {
      const stored = JSON.parse(localStorage.getItem(`monitoring_${type}`) || '[]')
      stored.push(event)
      
      // Keep only last 100 events to prevent storage overflow
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100)
      }
      
      localStorage.setItem(`monitoring_${type}`, JSON.stringify(stored))
    } catch (e) {
      console.warn('Failed to store monitoring event:', e)
    }
  }

  // Method to retrieve stored events for debugging
  getStoredEvents(type: string): any[] {
    try {
      return JSON.parse(localStorage.getItem(`monitoring_${type}`) || '[]')
    } catch (e) {
      console.warn('Failed to retrieve stored events:', e)
      return []
    }
  }

  // Clear stored events
  clearStoredEvents(type?: string) {
    if (type) {
      localStorage.removeItem(`monitoring_${type}`)
    } else {
      // Clear all monitoring data
      ['errors', 'performance', 'user_actions'].forEach(t => {
        localStorage.removeItem(`monitoring_${t}`)
      })
    }
  }

  // Health check method for monitoring system itself
  healthCheck(): boolean {
    try {
      // Test localStorage access
      const testKey = 'monitoring_health_test'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      
      // Test basic functionality
      this.logUserAction('health_check', { success: true })
      
      return true
    } catch (e) {
      console.warn('Monitoring system health check failed:', e)
      return false
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringService()

// Export types for external use
export type { ErrorEvent, PerformanceMetric }