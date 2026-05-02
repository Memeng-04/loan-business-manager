import { type Locator, type Page, expect } from '@playwright/test';

export class FundPage {
  readonly page: Page;
  readonly manageFundsButton: Locator;
  readonly saveChangesButton: Locator;
  readonly successMessage: Locator;
  readonly outstandingBalance: Locator;

  constructor(page: Page) {
    this.page = page;
    this.manageFundsButton = page.getByRole('button', { name: 'Manage Funds' });
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
    this.successMessage = page.getByText('Funds updated successfully.');
    this.outstandingBalance = page.locator('h3[class*="balanceValue"]');
  }

  async goto() {
    await this.page.goto('/funds');
    await this.page.waitForLoadState('networkidle');
    // Wait until loading spinners are gone and the balance card is rendered
    await this.manageFundsButton.waitFor({ state: 'visible', timeout: 15000 });
  }

  async openManageFundsModal() {
    await this.manageFundsButton.click();
    // Wait for modal to appear
    await this.page.getByText('Edit Funds').waitFor({ state: 'visible', timeout: 5000 });
  }

  async updateFunds(updates: {
    addCapital?: string;
    withdrawCapital?: string;
    addProfit?: string;
    withdrawProfit?: string;
  }) {
    // The modal labels are rendered as uppercase text by CSS, but the actual text
    // in the HTML is "Withdraw Capital", "Add Capital", etc.
    if (updates.withdrawCapital) {
      const input = this.page.locator('label:has-text("Withdraw Capital")').locator('..').locator('input');
      await input.fill(updates.withdrawCapital);
    }
    if (updates.addCapital) {
      const input = this.page.locator('label:has-text("Add Capital")').locator('..').locator('input');
      await input.fill(updates.addCapital);
    }
    if (updates.withdrawProfit) {
      const input = this.page.locator('label:has-text("Withdraw Profit")').locator('..').locator('input');
      await input.fill(updates.withdrawProfit);
    }
    if (updates.addProfit) {
      const input = this.page.locator('label:has-text("Add Profit")').locator('..').locator('input');
      await input.fill(updates.addProfit);
    }
    
    await this.saveChangesButton.click();
  }

  async expectSuccess() {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  async expectBalanceToUpdate() {
    await expect(this.outstandingBalance).toBeVisible();
    await expect(this.outstandingBalance).toContainText('₱');
  }
}
