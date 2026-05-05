import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signupTab: Locator;
  readonly loginTab: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('you@example.com');
    this.passwordInput = page.getByPlaceholder('••••••••');
    this.loginButton = page.getByRole('button', { name: 'Log in', exact: true }).filter({ hasText: 'Log in' }).last();
    this.signupTab = page.getByRole('button', { name: 'Sign up' });
    this.loginTab = page.getByRole('button', { name: 'Log in' }).first();
    this.errorMessage = page.locator('p[class*="errorMessage"]');
  }

  async goto() {
    await this.page.goto('/auth');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async signup(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.page.getByRole('button', { name: 'Create account' }).click();
  }

  async switchToSignup() {
    await this.signupTab.click();
  }

  async switchToLogin() {
    await this.loginTab.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message, { timeout: 15000 });
  }
}
