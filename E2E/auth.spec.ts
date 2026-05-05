import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should show error with invalid credentials', async () => {
    await loginPage.login('wrong@example.com', 'wrongpassword');
    await loginPage.expectError('Invalid login credentials');
  });

  test('should allow switching between Login and Sign up tabs', async () => {
    await loginPage.switchToSignup();
    await expect(loginPage.page.getByRole('button', { name: 'Create account' })).toBeVisible();
    
    await loginPage.switchToLogin();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/auth/);
  });
});
