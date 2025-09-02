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
    await expect(page.getByRole('heading', { name: /sign in|login|auth/i })).toBeVisible()
    
    // Should see email input
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    
    // Should see password input  
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/')
    
    // Fill invalid email
    await page.getByRole('textbox', { name: /email/i }).fill('invalid-email')
    await page.getByLabel(/password/i).fill('password123')
    
    // Try to submit
    await page.getByRole('button', { name: /sign in|login/i }).click()
    
    // Should show validation error
    await expect(page.getByText(/invalid email|email.*valid/i)).toBeVisible()
  })

  test('should show validation errors for short password', async ({ page }) => {
    await page.goto('/')
    
    // Fill valid email but short password
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com')
    await page.getByLabel(/password/i).fill('123')
    
    // Try to submit
    await page.getByRole('button', { name: /sign in|login/i }).click()
    
    // Should show validation error for password length
    await expect(page.getByText(/password.*6.*characters|password.*short/i)).toBeVisible()
  })

  test('should handle authentication error gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Fill valid format but non-existent credentials
    await page.getByRole('textbox', { name: /email/i }).fill('nonexistent@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    
    // Try to submit
    await page.getByRole('button', { name: /sign in|login/i }).click()
    
    // Should show error message (exact message depends on Supabase response)
    // We'll check for common authentication error patterns
    await expect(page.getByText(/invalid.*credentials|sign.*failed|error.*signing/i)).toBeVisible({
      timeout: 10000 // Give time for API call
    })
  })

  test('should toggle between sign in and sign up modes', async ({ page }) => {
    await page.goto('/')
    
    // Should start in sign in mode
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible()
    
    // Click to switch to sign up
    const switchButton = page.getByText(/don't have.*account|sign up|create.*account/i)
    if (await switchButton.isVisible()) {
      await switchButton.click()
      
      // Should now be in sign up mode
      await expect(page.getByRole('button', { name: /sign up|create.*account|register/i })).toBeVisible()
    }
  })
})

test.describe('Protected Routes', () => {
  test('should redirect to auth when accessing protected routes without authentication', async ({ page }) => {
    // Try to access a protected route (dashboard)
    await page.goto('/dashboard')
    
    // Should be redirected to auth page
    await expect(page.getByRole('heading', { name: /sign in|login|auth/i })).toBeVisible()
    
    // URL should not be dashboard
    expect(page.url()).not.toContain('/dashboard')
  })
})