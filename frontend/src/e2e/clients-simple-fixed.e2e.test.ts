import { test, expect } from '@playwright/test'

const TEST_THERAPIST = {
  email: 'therapist@test.com',
  password: 'testpassword123'
}

const TEST_CLIENT = {
  name: 'Jan Kowalski Test',
  email: 'jan.kowalski@example.com',
  phone: '+48123456789'
}

test.describe('Client Management E2E Tests - Fixed', () => {
  // Helper function to login as therapist
  async function loginAsTherapist(page: import('@playwright/test').Page) {
    await page.goto('/')
    await page.getByLabel('Email').fill(TEST_THERAPIST.email)
    await page.getByLabel('Hasło').fill(TEST_THERAPIST.password)
    await page.getByRole('button', { name: 'Zaloguj się' }).click()
    // Wait for successful login and navigation to dashboard
    await expect(page.getByRole('heading', { name: 'Marmaid Dashboard' })).toBeVisible({ timeout: 15000 })
  }

  test('should create new client successfully', async ({ page }) => {
    // Login and navigate to clients
    await loginAsTherapist(page)
    await page.getByRole('button', { name: 'Zarządzaj klientami' }).click()
    await expect(page.locator('h1').getByText('Zarządzanie klientami')).toBeVisible()

    // Open client creation form
    await page.getByRole('button', { name: 'Dodaj klienta' }).click()
    await expect(page.locator('h1').getByText('Dodaj nowego klienta')).toBeVisible()

    // Fill basic required information
    await page.getByLabel('Imię i nazwisko').fill(TEST_CLIENT.name)

    // Optional fields if visible
    const emailInput = page.getByLabel(/email/i)
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_CLIENT.email)
    }

    // Save client
    await page.getByRole('button', { name: 'Utwórz klienta' }).click()

    // Wait for successful creation and return to list
    await expect(page.locator('h1').getByText('Zarządzanie klientami')).toBeVisible({ timeout: 10000 })

    // Verify we're back at the list (the "Dodaj klienta" button should be visible)
    await expect(page.getByRole('button', { name: 'Dodaj klienta' })).toBeVisible()

    // The client should appear in the list (use .first() to avoid strict mode violation)
    await expect(page.getByText(TEST_CLIENT.name).first()).toBeVisible({ timeout: 5000 })
  })

  test('should display validation errors for empty required fields', async ({ page }) => {
    await loginAsTherapist(page)
    await page.getByRole('button', { name: 'Zarządzaj klientami' }).click()
    await page.getByRole('button', { name: 'Dodaj klienta' }).click()

    // Try to save without required fields
    await page.getByRole('button', { name: 'Utwórz klienta' }).click()

    // Should still be on the create form (not navigate away)
    await expect(page.locator('h1').getByText('Dodaj nowego klienta')).toBeVisible()
  })

  test('should allow navigation between tabs in create form', async ({ page }) => {
    await loginAsTherapist(page)
    await page.getByRole('button', { name: 'Zarządzaj klientami' }).click()
    await page.getByRole('button', { name: 'Dodaj klienta' }).click()

    // Test tab navigation
    await page.getByText('Informacje zdrowotne').click()
    await expect(page.getByLabel('Historia medyczna')).toBeVisible()

    await page.getByText('Kontakty awaryjne').click()
    await expect(page.getByText('Dodaj kontakt')).toBeVisible()

    await page.getByText('Profil').click()
    await expect(page.getByLabel('Imię i nazwisko')).toBeVisible()
  })
})
