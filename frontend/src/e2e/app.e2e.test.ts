// ABOUTME: E2E tests for core application functionality
// ABOUTME: Tests navigation, UI components, and main user flows
import { test, expect } from '@playwright/test'

test.describe('Application Smoke Tests', () => {
  test('should have correct page title and meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle(/Marmaid/i)
    
    // Check viewport meta tag exists (mobile responsiveness)
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewportMeta).toContain('width=device-width')
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Capture page errors
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Filter out known acceptable errors (like 404 for favicons, etc.)
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('robots.txt') &&
      !error.includes('manifest.json') &&
      !error.toLowerCase().includes('net::err_name_not_resolved')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Page should still be usable on mobile
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    
    // Form elements should be properly sized for mobile
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const emailBox = await emailInput.boundingBox()
    
    expect(emailBox?.width).toBeGreaterThan(200) // Should be reasonably wide
    expect(emailBox?.height).toBeGreaterThan(30) // Should be touch-friendly
  })

  test('should handle slow network conditions gracefully', async ({ page }) => {
    // Simulate slow 3G connection
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100) // Add 100ms delay to all requests
    })
    
    await page.goto('/')
    
    // Page should eventually load despite slow connection
    await expect(page.getByRole('heading', { name: /sign in|login|auth/i })).toBeVisible({
      timeout: 15000
    })
  })

  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/')
    
    // Check that form elements have proper labels
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const passwordInput = page.getByLabel(/password/i)
    const submitButton = page.getByRole('button', { name: /sign in|login/i })
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()  
    await expect(submitButton).toBeVisible()
    
    // Check tab navigation works
    await page.keyboard.press('Tab')
    await expect(emailInput).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(passwordInput).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(submitButton).toBeFocused()
  })

  test('should maintain form state during user interaction', async ({ page }) => {
    await page.goto('/')
    
    const testEmail = 'test@example.com'
    const testPassword = 'testpassword123'
    
    // Fill form
    await page.getByRole('textbox', { name: /email/i }).fill(testEmail)
    await page.getByLabel(/password/i).fill(testPassword)
    
    // Verify values are retained
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(testEmail)
    await expect(page.getByLabel(/password/i)).toHaveValue(testPassword)
    
    // Interact with other elements and verify state persists
    await page.click('body') // Click outside
    
    // Values should still be there
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(testEmail)
    await expect(page.getByLabel(/password/i)).toHaveValue(testPassword)
  })
})

test.describe('Performance Tests', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds on normal connection
    expect(loadTime).toBeLessThan(3000)
  })

  test('should not have layout shifts', async ({ page }) => {
    await page.goto('/')
    
    // Wait for initial paint
    await page.waitForLoadState('domcontentloaded')
    
    // Take initial screenshot
    await page.waitForTimeout(1000) // Wait for any lazy loading
    
    // Verify main elements are in expected positions
    const emailInput = await page.getByRole('textbox', { name: /email/i }).boundingBox()
    const passwordInput = await page.getByLabel(/password/i).boundingBox()
    
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    
    // Elements should be reasonably positioned (not overlapping)
    if (emailInput && passwordInput) {
      expect(passwordInput.y).toBeGreaterThan(emailInput.y + emailInput.height - 10)
    }
  })
})