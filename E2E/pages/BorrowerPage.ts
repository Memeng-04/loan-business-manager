import { type Locator, type Page, expect } from '@playwright/test';

export class BorrowerPage {
  readonly page: Page;
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly nameInput: Locator;
  readonly addressInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly borrowerList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.getByRole('button', { name: '+ Add' });
    this.searchInput = page.getByPlaceholder('Search borrowers');
    // The form uses <label><span>✦ Name</span><input></label> structure
    this.nameInput = page.locator('label:has-text("✦ Name") input');
    this.addressInput = page.locator('label:has-text("✦ Address") input');
    this.phoneInput = page.locator('label:has-text("✦ Phone Number") input');
    this.emailInput = page.locator('label:has-text("Email") input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.borrowerList = page.locator('ul[class*="list"]');
  }

  async goto() {
    await this.page.goto('/borrowers');
    // Wait for the loading state to finish and the page content to render
    await this.page.waitForLoadState('networkidle');
  }

  async createBorrower(details: { name: string; address: string; phone: string; email?: string }) {
    // Wait for the + Add button to appear (it's hidden during loading)
    await this.addButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.addButton.click();

    // Wait for the form to render
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.nameInput.fill(details.name);
    await this.addressInput.fill(details.address);
    await this.phoneInput.fill(details.phone);
    if (details.email) await this.emailInput.fill(details.email);
    await this.saveButton.click();

    // Wait for navigation back to borrowers list
    await this.page.waitForURL(/.*\/borrowers$/, { timeout: 10000 });
  }

  async search(query: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchInput.fill(query);
    // Small delay for debounced search to execute
    await this.page.waitForTimeout(500);
  }

  async expectBorrowerInList(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 10000 });
  }
}
