// ABOUTME: E2E tests for complete authentication flows using data-testid selectors
// ABOUTME: Tests registration, login, logout, password reset workflows with professional UX validation

import { test, expect } from '@playwright/test';

// Test credentials for E2E tests
const testCredentials = {
  email: 'e2etest@example.com',
  password: 'TestPassword123',
  invalidEmail: 'invalid@example.com',
  invalidPassword: 'wrongpassword',
};

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page for each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Registration Flow', () => {
    test('should successfully initiate registration with email verification', async ({
      page,
    }) => {
      // Navigate to registration page
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // Verify we're on the registration page
      await expect(page.getByTestId('register-page')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Create Account' })
      ).toBeVisible();

      // Fill out the registration form
      await page.getByTestId('email-input').fill(testCredentials.email);
      await page.getByTestId('password-input').fill(testCredentials.password);
      await page
        .getByTestId('confirm-password-input')
        .fill(testCredentials.password);
      await page.getByTestId('role-select').selectOption('therapist');

      // Submit the form
      await page.getByTestId('register-button').click();

      // Wait for loading state
      await expect(page.getByTestId('register-button')).toHaveText(
        /Creating account.../
      );

      // Should show email verification message instead of redirecting
      await expect(page.getByTestId('register-success')).toBeVisible();
      await expect(page.getByTestId('register-success')).toContainText(
        /check your email/i
      );

      // Should remain on registration page
      await expect(page).toHaveURL('/register');
    });

    test('should show validation errors for invalid registration data', async ({
      page,
    }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // Try to submit empty form
      await page.getByTestId('register-button').click();

      // Should show validation errors
      await expect(page.getByText('Invalid email')).toBeVisible();
      await expect(
        page.getByText('String must contain at least 6 character(s)')
      ).toBeVisible();

      // Fill mismatched passwords
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('password123');
      await page
        .getByTestId('confirm-password-input')
        .fill('differentpassword');
      await page.getByTestId('register-button').click();

      // Should show password mismatch error
      await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

    test('should navigate between login and register pages', async ({
      page,
    }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // Click "Sign in" link
      await page.getByTestId('login-link').click();
      await expect(page).toHaveURL('/login');
      await expect(page.getByTestId('login-page')).toBeVisible();

      // Click "Sign up" link
      await page.getByTestId('register-link').click();
      await expect(page).toHaveURL('/register');
      await expect(page.getByTestId('register-page')).toBeVisible();
    });
  });

  test.describe('User Login Flow', () => {
    test('should show login form and handle authentication attempts', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Verify we're on the login page
      await expect(page.getByTestId('login-page')).toBeVisible();
      await expect(page.getByText('Welcome Back')).toBeVisible();

      // Fill out the login form with test credentials
      await page.getByTestId('email-input').fill(testCredentials.email);
      await page.getByTestId('password-input').fill(testCredentials.password);

      // Submit the form
      await page.getByTestId('login-button').click();

      // Wait for loading state
      await expect(page.getByTestId('login-button')).toHaveText(
        /Signing in.../
      );

      // Since email verification is required, unverified users will get an error
      // This test focuses on form functionality rather than successful login
      await expect(page.getByTestId('login-error')).toBeVisible();
    });

    test('should show error for invalid login credentials', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Wait for auth store to initialize and form to be ready
      await page.waitForFunction(
        () => {
          const button = document.querySelector('[data-testid="login-button"]');
          const emailInput = document.querySelector(
            '[data-testid="email-input"]'
          );
          return (
            button &&
            !button.hasAttribute('disabled') &&
            emailInput &&
            !emailInput.hasAttribute('disabled')
          );
        },
        { timeout: 10000 }
      );

      // Fill out the login form with invalid credentials
      await page.getByTestId('email-input').fill(testCredentials.invalidEmail);
      await page
        .getByTestId('password-input')
        .fill(testCredentials.invalidPassword);

      // Submit the form
      await page.getByTestId('login-button').click();

      // Should show error message
      await expect(page.getByTestId('login-error')).toBeVisible();
      await expect(page.getByTestId('login-error')).toContainText(
        /Invalid login credentials/i
      );

      // Should remain on login page
      await expect(page).toHaveURL('/login');
    });

    test('should show validation errors for empty login form', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Try to submit empty form
      await page.getByTestId('login-button').click();

      // Should show validation errors
      await expect(page.getByText('Invalid email')).toBeVisible();
      await expect(
        page.getByText('String must contain at least 6 character(s)')
      ).toBeVisible();
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Click "Forgot your password?" link
      await page.getByTestId('forgot-password-link').click();
      await expect(page).toHaveURL('/forgot-password');

      // Should show forgot password form
      await expect(page.getByText('Reset Password')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
    });

    test('should show success message for password reset request', async ({
      page,
    }) => {
      await page.goto('/forgot-password');
      await page.waitForLoadState('networkidle');

      // Fill out email field
      await page.getByTestId('email-input').fill('test@example.com');

      // Submit the form
      await page.getByTestId('reset-button').click();

      // Should show success message
      await expect(page.getByText(/check your email/i)).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user to login from protected route', async ({
      page,
    }) => {
      // Try to access protected dashboard directly
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login page
      await expect(page).toHaveURL('/login');
      await expect(page.getByTestId('login-page')).toBeVisible();
    });

    test('should show protection behavior for dashboard access', async ({
      page,
    }) => {
      // Try to access protected dashboard directly
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login page
      await expect(page).toHaveURL('/login');
      await expect(page.getByTestId('login-page')).toBeVisible();

      // Should show appropriate form for entering credentials
      await expect(page.getByTestId('login-form')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
    });
  });

  test.describe('Professional UX Validation', () => {
    test('should show professional loading states during authentication', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Fill form
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('password123');

      // Start submission and check loading state immediately
      const submitPromise = page.getByTestId('login-button').click();

      // Check loading state appears
      await expect(page.getByTestId('login-button')).toHaveText(
        /Signing in.../
      );
      await expect(page.getByTestId('login-button')).toBeDisabled();

      await submitPromise;
    });

    test('should display professional error messages', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // Submit empty form to trigger validation
      await page.getByTestId('register-button').click();

      // Error messages should be clearly visible and professional
      const errorMessages = page.locator(
        '[data-testid*="error"], .text-destructive'
      );
      await expect(errorMessages.first()).toBeVisible();

      // Check that error styling is applied
      const emailInput = page.getByTestId('email-input');
      await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should maintain form state during validation errors', async ({
      page,
    }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // Fill partial form
      const emailValue = 'partial@email.com';
      await page.getByTestId('email-input').fill(emailValue);
      await page.getByTestId('password-input').fill('short'); // Too short password

      // Submit form
      await page.getByTestId('register-button').click();

      // Email should be preserved, validation error should show for password
      await expect(page.getByTestId('email-input')).toHaveValue(emailValue);
      await expect(
        page.getByText('String must contain at least 6 character(s)')
      ).toBeVisible();
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('authentication forms should work consistently across browsers', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Test basic form interactions
      const emailInput = page.getByTestId('email-input');
      const passwordInput = page.getByTestId('password-input');
      const submitButton = page.getByTestId('login-button');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Test input focus and typing
      await emailInput.focus();
      await expect(emailInput).toBeFocused();

      await emailInput.type('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');

      await passwordInput.focus();
      await expect(passwordInput).toBeFocused();
    });
  });
});
