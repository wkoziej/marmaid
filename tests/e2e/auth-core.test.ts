// ABOUTME: Core E2E authentication tests focusing on essential user flows
// ABOUTME: Simplified tests to validate basic login, registration, and protection functionality

import { test, expect } from '@playwright/test';

test.describe('Core Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load login page correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('should load registration page correctly', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(page.getByText('Create Account')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    await expect(page.getByTestId('role-select')).toBeVisible();
    await expect(page.getByTestId('register-button')).toBeVisible();
  });

  test('should navigate between auth pages', async ({ page }) => {
    // Start at login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/login');

    // Go to register
    await page.getByTestId('register-link').click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByTestId('register-page')).toBeVisible();

    // Go back to login
    await page.getByTestId('login-link').click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByTestId('login-page')).toBeVisible();

    // Go to forgot password
    await page.getByTestId('forgot-password-link').click();
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByText('Reset Password')).toBeVisible();
  });

  test('should redirect from protected route to login', async ({ page }) => {
    // Try to access protected dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByTestId('login-page')).toBeVisible();
  });

  test('should show form validation errors', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Wait for auth store to initialize and form to be ready
    await page.waitForFunction(
      () => {
        const button = document.querySelector('[data-testid="login-button"]');
        return button && !button.hasAttribute('disabled');
      },
      { timeout: 10000 }
    );

    // Click submit without filling form
    await page.getByTestId('login-button').click();

    // Wait for validation errors to appear
    await page.waitForTimeout(1000);

    // Check for validation messages
    await expect(page.locator('text=Invalid email')).toBeVisible();
    await expect(
      page.locator('text=String must contain at least 6 character(s)')
    ).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');

    // Fill email and submit
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('reset-button').click();

    // Should show success message
    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('should maintain professional styling across auth pages', async ({
    page,
  }) => {
    const pages = ['/login', '/register', '/forgot-password'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Check professional card layout exists
      await expect(page.locator('[class*="card"]')).toBeVisible();

      // Check form styling
      await expect(page.locator('form')).toBeVisible();

      // Check input styling
      const inputs = page.locator(
        'input[type="email"], input[type="password"]'
      );
      await expect(inputs.first()).toBeVisible();

      // Check button styling
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    }
  });
});
