import { type Locator, type Page, expect } from '@playwright/test';

export class MorePage {
  readonly page: Page;
  readonly editNamesButton: Locator;
  readonly saveChangesButton: Locator;
  readonly logoutButton: Locator;
  readonly profileSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editNamesButton = page.getByRole('button', { name: 'Edit Names' });
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
    this.logoutButton = page.getByRole('button', { name: 'Log out' });
    this.profileSuccessMessage = page.getByText('Profile updated successfully!');
  }

  async goto() {
    await this.page.goto('/more');
    await this.page.waitForLoadState('networkidle');
    // Wait for the profile section to load
    await this.page.getByText('Profile').first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async updateProfile(legalName: string, displayName: string) {
    await this.editNamesButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.editNamesButton.click();

    // After clicking Edit Names, input fields appear
    // The MorePage uses <label><label text></label> + <input> pattern
    // Legal Full Name is the first required input, Display Name is the second
    const legalInput = this.page.locator('label:has-text("Legal Full Name")').locator('..').locator('input');
    const displayInput = this.page.locator('label:has-text("Display Name")').locator('..').locator('input');

    await legalInput.waitFor({ state: 'visible', timeout: 5000 });
    await legalInput.fill(legalName);
    await displayInput.fill(displayName);
    await this.saveChangesButton.click();
  }

  async logout() {
    await this.logoutButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.logoutButton.click();
  }

  async expectProfileUpdateSuccess() {
    await expect(this.profileSuccessMessage).toBeVisible({ timeout: 10000 });
  }
}
