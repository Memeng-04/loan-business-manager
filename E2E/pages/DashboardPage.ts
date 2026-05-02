import { type Page, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async expectDashboardLoaded() {
    // Greeting - uses class*="greeting" selector
    await expect(this.page.locator('h2').filter({ hasText: 'Hi,' })).toBeVisible({ timeout: 15000 });

    // All three cards should be present
    await expect(this.page.getByText('Outstanding Fund Balance').first()).toBeVisible();
    await expect(this.page.getByText('Revenue Report by Frequency').first()).toBeVisible();
    await expect(this.page.getByText('Due Today List').first()).toBeVisible();
  }
}
