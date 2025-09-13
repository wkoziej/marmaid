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

  test('Supabase connection test shows success', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find the Supabase connection test component
    const connectionTest = page.getByTestId('supabase-connection-test');
    await expect(connectionTest).toBeVisible();

    // Wait for connection test to complete (max 10 seconds)
    await page.waitForFunction(
      () => {
        const testElement = document.querySelector(
          '[data-testid="supabase-connection-test"]'
        );
        if (!testElement) return false;

        // Check if test is still in "testing" state
        const testingText = testElement.textContent?.includes(
          'Testing connection...'
        );
        return !testingText; // Return true when testing is done
      },
      { timeout: 10000 }
    );

    // Verify connection was successful
    const successElement = page.getByTestId('supabase-success');
    const errorElement = page.getByTestId('supabase-error');

    // Should show success message
    await expect(successElement).toBeVisible();
    await expect(successElement).toContainText(
      'Successfully connected to Supabase'
    );

    // Should not show error message
    await expect(errorElement).not.toBeVisible();
  });

  test('environment configuration is correct', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click dev info header to expand details
    const devInfoHeader = page.getByTestId('dev-info-compact-header');
    await devInfoHeader.click();

    // Wait for detailed view to appear
    const detailedView = page.getByTestId('dev-info-detailed-view');
    await expect(detailedView).toBeVisible();

    // Check database environment is correctly detected
    const databaseDisplay = page.getByTestId('database-display');
    await expect(databaseDisplay).toBeVisible();
    await expect(databaseDisplay).toContainText(
      /Local Development|Test Database|Production Database/
    );

    // Check database URL is shown
    const databaseUrl = page.getByTestId('database-url-display');
    await expect(databaseUrl).toBeVisible();

    // URL should contain either localhost or supabase domain
    await expect(databaseUrl).toContainText(/127\.0\.0\.1|localhost|supabase/);
  });
});
