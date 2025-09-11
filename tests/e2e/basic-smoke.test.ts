import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if the page loaded successfully
    expect(page).toHaveURL('/');

    // Check for basic page elements
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();
  });

  test('application has correct title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/Marmaid/i);
  });

  test('React app renders without crashes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if React app root element exists
    const rootElement = page.locator('#root');
    await expect(rootElement).toBeVisible();
  });
});
