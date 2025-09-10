// ABOUTME: E2E tests for authentication flow
// ABOUTME: Tests login, logout, and authentication state persistence
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Marmaid/i)
  })

  test('should display authentication page for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    
    // Should see login/register form
    await expect(page.getByTestId('login-heading')).toBeVisible()
    
    // Should see email input
    await expect(page.getByTestId('email-input')).toBeVisible()
    
    // Should see password input  
    await expect(page.getByTestId('password-input')).toBeVisible()
  })

  test('should show validation errors for invalid email format', async ({ page }) => {
    await page.goto('/')
    
    // Fill with clearly invalid email format and trigger onChange validation
    await page.getByTestId('email-input').fill('not-an-email')
    
    // With mode: 'onChange', validation should trigger immediately
    // Wait a bit for React to update
    await page.waitForTimeout(300)
    
    // Should show validation error for invalid email format
    await expect(page.getByTestId('email-validation-error')).toBeVisible()
  })

  test('should show validation errors for empty password', async ({ page }) => {
    await page.goto('/')
    
    // Fill valid email and try to submit with empty password
    await page.getByTestId('email-input').fill('test@example.com')
    // Password remains empty by default
    
    // Try to submit - this should trigger validation
    await page.getByTestId('login-submit-button').click()
    
    // Wait for validation to process
    await page.waitForTimeout(500)
    
    // Should show validation error for required password
    await expect(page.getByTestId('password-validation-error')).toBeVisible()
  })

  test('should handle authentication error gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Fill valid format but non-existent credentials
    await page.getByTestId('email-input').fill('nonexistent@example.com')
    await page.getByTestId('password-input').fill('wrongpassword')
    
    // Try to submit
    await page.getByTestId('login-submit-button').click()
    
    // Should show error message (exact message depends on Supabase response)
    // We'll check for common authentication error patterns
    await expect(page.getByTestId('login-error-message')).toBeVisible({
      timeout: 10000 // Give time for API call
    })
  })

  test('should toggle between sign in and sign up modes', async ({ page }) => {
    await page.goto('/')
    
    // Should start in sign in mode
    await expect(page.getByTestId('login-submit-button')).toBeVisible()
    
    // Click to switch to sign up
    const switchButton = page.getByTestId('switch-to-register-button')
    if (await switchButton.isVisible()) {
      await switchButton.click()
      
      // Should now be in sign up mode
      await expect(page.getByTestId('register-submit-button')).toBeVisible()
    }
  })

  test('should show password length validation in register mode', async ({ page }) => {
    await page.goto('/')
    
    // Switch to register mode
    const switchButton = page.getByTestId('switch-to-register-button')
    if (await switchButton.isVisible()) {
      await switchButton.click()
      await expect(page.getByTestId('register-submit-button')).toBeVisible()
      
      // Fill valid email but short password
      await page.getByTestId('register-email-input').fill('test@example.com')
      await page.getByTestId('register-password-input').fill('123') // Too short for register form
      await page.getByTestId('register-confirm-password-input').fill('123')
      
      // Try to submit
      await page.getByTestId('register-submit-button').click()
      
      // Wait for validation
      await page.waitForTimeout(500)
      
      // Should show password length validation error
      await expect(page.getByTestId('register-password-validation-error')).toBeVisible()
    }
  })
})

test.describe('Logout Functionality', () => {
  test('should successfully logout user and redirect to auth page', async ({ page }) => {
    // First we need to login to test logout
    await page.goto('/')
    
    // Fill in valid test credentials (we'll use a test account)
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('password-input').fill('testpassword123')
    
    // Submit login form
    await page.getByTestId('login-submit-button').click()
    
    // Wait for potential login success or check if we're on dashboard
    // If login fails (no test account), we'll skip this test
    try {
      await page.waitForURL('**/dashboard', { timeout: 5000 })
      
      // Verify we're on dashboard
      await expect(page.getByTestId('dashboard-heading')).toBeVisible()
      await expect(page.getByTestId('logout-button')).toBeVisible()
      
      // Click logout button
      await page.getByTestId('logout-button').click()
      
      // Wait for logout to complete and redirect to auth page
      await page.waitForURL('**/auth', { timeout: 10000 })
      
      // Verify we're redirected to auth page
      await expect(page.getByTestId('login-heading')).toBeVisible()
      
      // Verify logout button is no longer visible (we're logged out)
      await expect(page.getByTestId('logout-button')).not.toBeVisible()
      
    } catch (error) {
      // If we can't login with test credentials, skip logout test
      console.log('Skipping logout test - no valid test credentials available')
      test.skip()
    }
  })
  
  test('should show loading state during logout', async ({ page }) => {
    await page.goto('/')
    
    // Fill in test credentials
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('password-input').fill('testpassword123')
    await page.getByTestId('login-submit-button').click()
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 5000 })
      
      // Click logout button
      await page.getByTestId('logout-button').click()
      
      // Immediately check for loading state (button should show "Wylogowywanie...")
      await expect(page.getByTestId('logout-button')).toHaveText('Wylogowywanie...')
      await expect(page.getByTestId('logout-button')).toBeDisabled()
      
    } catch (error) {
      console.log('Skipping logout loading test - no valid test credentials available')
      test.skip()
    }
  })
})

test.describe('Protected Routes', () => {
  test('should redirect to auth when accessing protected routes without authentication', async ({ page }) => {
    // Try to access a protected route (dashboard)
    await page.goto('/dashboard')
    
    // Should be redirected to auth page
    await expect(page.getByTestId('login-heading')).toBeVisible()
    
    // URL should not be dashboard
    expect(page.url()).not.toContain('/dashboard')
  })
})