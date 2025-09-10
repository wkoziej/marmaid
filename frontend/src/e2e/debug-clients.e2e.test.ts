// Debug test to check what happens when we navigate to clients
import { test, expect } from '@playwright/test'

const TEST_USER = {
  email: 'therapist@test.com',
  password: 'testpassword123'
}

test('debug client list loading', async ({ page }) => {
  console.log('Starting debug test...')
  
  // Listen to console logs
  page.on('console', (msg) => {
    console.log(`BROWSER: ${msg.type()}: ${msg.text()}`)
  })
  
  // Listen to network requests
  page.on('request', (request) => {
    if (request.url().includes('clients')) {
      console.log(`REQUEST: ${request.method()} ${request.url()}`)
    }
  })
  
  page.on('response', (response) => {
    if (response.url().includes('clients')) {
      console.log(`RESPONSE: ${response.status()} ${response.url()}`)
    }
  })

  await page.goto('/')

  // Login
  await page.getByTestId('email-input').fill(TEST_USER.email)
  await page.getByTestId('password-input').fill(TEST_USER.password)
  await page.getByTestId('login-submit-button').click()

  // Wait for dashboard
  await expect(page.getByTestId('dashboard-heading')).toBeVisible({ timeout: 10000 })
  console.log('✅ Logged in successfully')

  // Navigate to clients
  await page.getByTestId('manage-clients-button').click()

  // Wait a bit for any loading
  await page.waitForTimeout(3000)

  console.log('Current URL:', page.url())
  console.log('Page HTML contains client-management-heading:', await page.locator('[data-testid="client-management-heading"]').count())
  
  // Take screenshot
  await page.screenshot({ path: 'debug-clients-loading.png' })
})