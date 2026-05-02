import { type Locator, type Page } from '@playwright/test';

export class OnboardingPage {
  readonly page: Page;
  readonly legalFullNameInput: Locator;
  readonly displayNameInput: Locator;
  readonly continueButton: Locator;
  readonly capitalInput: Locator;
  readonly profitInput: Locator;
  readonly getStartedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.legalFullNameInput = page.locator('label:has-text("Government Full Name") input');
    this.displayNameInput = page.locator('label:has-text("Display Name") input');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.capitalInput = page.getByLabel('Capital Lent Out So Far');
    this.profitInput = page.getByLabel('Total Profit Earned So Far');
    this.getStartedButton = page.getByRole('button', { name: 'Get Started' });
  }

  async completeProfile(fullName: string, displayName: string) {
    await this.legalFullNameInput.fill(fullName);
    await this.displayNameInput.fill(displayName);
    await this.continueButton.click();
  }

  async completeCapital(capital: string, profit: string) {
    await this.capitalInput.fill(capital);
    await this.profitInput.fill(profit);
    await this.getStartedButton.click();
  }
}
