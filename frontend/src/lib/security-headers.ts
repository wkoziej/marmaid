export interface SecurityHeaders {
  contentSecurityPolicy: string
  xFrameOptions: string
  xContentTypeOptions: string
  referrerPolicy: string
  permissionsPolicy: string
}

export interface CSPDirectives {
  defaultSrc: string[]
  scriptSrc: string[]
  styleSrc: string[]
  imgSrc: string[]
  connectSrc: string[]
  fontSrc: string[]
  objectSrc: string[]
  mediaSrc: string[]
  frameSrc: string[]
}

class SecurityHeadersManager {
  private defaultCSPDirectives: CSPDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite dev
    styleSrc: ["'self'", "'unsafe-inline'"], // Needed for CSS-in-JS
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: [
      "'self'",
      "https://*.supabase.co", // Supabase API
      "wss://*.supabase.co", // Supabase WebSockets
    ],
    fontSrc: ["'self'", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  }

  /**
   * Generate Content Security Policy header value
   */
  generateCSP(customDirectives?: Partial<CSPDirectives>): string {
    const directives = { ...this.defaultCSPDirectives, ...customDirectives }
    
    const cspParts: string[] = []
    
    for (const [directive, sources] of Object.entries(directives)) {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase()
      cspParts.push(`${kebabDirective} ${sources.join(' ')}`)
    }
    
    return cspParts.join('; ')
  }

  /**
   * Get all security headers
   */
  getSecurityHeaders(customCSP?: Partial<CSPDirectives>): SecurityHeaders {
    return {
      contentSecurityPolicy: this.generateCSP(customCSP),
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
      ].join(', '),
    }
  }

  /**
   * Apply security headers to document head (for SPA)
   */
  applySecurityHeaders(customCSP?: Partial<CSPDirectives>): void {
    const headers = this.getSecurityHeaders(customCSP)
    
    // Remove existing security meta tags
    this.removeExistingSecurityMetas()
    
    // Add CSP meta tag
    this.addMetaTag('http-equiv', 'Content-Security-Policy', headers.contentSecurityPolicy)
    
    // Add X-Content-Type-Options
    this.addMetaTag('http-equiv', 'X-Content-Type-Options', headers.xContentTypeOptions)
    
    // Add Referrer Policy
    this.addMetaTag('name', 'referrer', headers.referrerPolicy)
    
    // Add Permissions Policy
    this.addMetaTag('http-equiv', 'Permissions-Policy', headers.permissionsPolicy)
    
    console.log('Security headers applied:', headers)
  }

  /**
   * Remove existing security meta tags
   */
  private removeExistingSecurityMetas(): void {
    const selectors = [
      'meta[http-equiv="Content-Security-Policy"]',
      'meta[http-equiv="X-Content-Type-Options"]',
      'meta[name="referrer"]',
      'meta[http-equiv="Permissions-Policy"]',
    ]
    
    selectors.forEach(selector => {
      const existingMeta = document.querySelector(selector)
      if (existingMeta) {
        existingMeta.remove()
      }
    })
  }

  /**
   * Add meta tag to document head
   */
  private addMetaTag(
    attributeType: 'http-equiv' | 'name',
    attributeValue: string,
    content: string
  ): void {
    const meta = document.createElement('meta')
    meta.setAttribute(attributeType, attributeValue)
    meta.setAttribute('content', content)
    document.head.appendChild(meta)
  }

  /**
   * Validate CSP compliance for a URL
   */
  validateCSPCompliance(url: string, directive: keyof CSPDirectives): boolean {
    const directives = this.defaultCSPDirectives
    const allowedSources = directives[directive]
    
    // Check if URL matches any allowed source
    for (const source of allowedSources) {
      if (source === "'self'" && this.isSameOrigin(url)) {
        return true
      }
      
      if (source === "'unsafe-inline'" || source === "'unsafe-eval'") {
        continue // These are special keywords
      }
      
      if (source === "data:" && url.startsWith('data:')) {
        return true
      }
      
      if (source === "https:" && url.startsWith('https:')) {
        return true
      }
      
      // Check for pattern match
      if (this.matchesPattern(url, source)) {
        return true
      }
    }
    
    return false
  }

  /**
   * Check if URL is same origin
   */
  private isSameOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin)
      return urlObj.origin === window.location.origin
    } catch {
      return false
    }
  }

  /**
   * Check if URL matches CSP pattern
   */
  private matchesPattern(url: string, pattern: string): boolean {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      return regex.test(url)
    }
    return url.includes(pattern)
  }

  /**
   * Get security header violations from console
   */
  getSecurityViolations(): SecurityViolation[] {
    // This would collect CSP violations reported to console
    // In production, violations should be reported to a security endpoint
    return []
  }

  /**
   * Report security violation
   */
  reportViolation(violation: SecurityViolation): void {
    console.warn('Security Policy Violation:', violation)
    
    // In production, send to security monitoring service
    // fetch('/api/security/violations', {
    //   method: 'POST',
    //   body: JSON.stringify(violation)
    // })
  }
}

export interface SecurityViolation {
  type: 'csp' | 'cors' | 'mixed-content'
  message: string
  source: string
  timestamp: string
}

// Export singleton instance
export const securityHeaders = new SecurityHeadersManager()

// Initialize security headers on module load
if (typeof window !== 'undefined') {
  securityHeaders.applySecurityHeaders()
} 