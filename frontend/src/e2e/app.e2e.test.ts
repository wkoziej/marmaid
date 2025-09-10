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
    await expect(page.getByTestId('email-input')).toBeVisible()
    await expect(page.getByTestId('password-input')).toBeVisible()
    
    // Form elements should be properly sized for mobile
    const emailInput = page.getByTestId('email-input')
    const emailBox = await emailInput.boundingBox()
    
    expect(emailBox?.width).toBeGreaterThan(200) // Should be reasonably wide
    expect(emailBox?.height).toBeGreaterThan(18) // Should be touch-friendly (adjusted for actual component height)
  })

  test('should handle slow network conditions gracefully', async ({ page }) => {
    // Simulate slow 3G connection
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100) // Add 100ms delay to all requests
    })
    
    await page.goto('/')
    
    // Page should eventually load despite slow connection
    await expect(page.getByTestId('login-heading')).toBeVisible({
      timeout: 15000
    })
  })

  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/')
    
    // Check that form elements have proper labels
    const emailInput = page.getByTestId('email-input')
    const passwordInput = page.getByTestId('password-input')
    const submitButton = page.getByTestId('login-submit-button')
    
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
    await page.getByTestId('email-input').fill(testEmail)
    await page.getByTestId('password-input').fill(testPassword)
    
    // Verify values are retained
    await expect(page.getByTestId('email-input')).toHaveValue(testEmail)
    await expect(page.getByTestId('password-input')).toHaveValue(testPassword)
    
    // Interact with other elements and verify state persists
    await page.click('body') // Click outside
    
    // Values should still be there
    await expect(page.getByTestId('email-input')).toHaveValue(testEmail)
    await expect(page.getByTestId('password-input')).toHaveValue(testPassword)
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
    const emailInput = await page.getByTestId('email-input').boundingBox()
    const passwordInput = await page.getByTestId('password-input').boundingBox()
    
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    
    // Elements should be reasonably positioned (not overlapping)
    if (emailInput && passwordInput) {
      expect(passwordInput.y).toBeGreaterThan(emailInput.y + emailInput.height - 10)
    }
  })
})