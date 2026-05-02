import { type Locator, type Page, expect } from '@playwright/test';

export class LoanPage {
  readonly page: Page;
  readonly nextButton: Locator;
  readonly confirmButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.successMessage = page.getByText('Loan Created Successfully!');
  }

  async goto() {
    await this.page.goto('/add');
    await this.page.waitForLoadState('networkidle');
    // Wait for the wizard to render (step title should be visible)
    await this.page.getByText('Step 1 of 5').waitFor({ state: 'visible', timeout: 15000 });
  }

  async selectLoanType(type: 'fixed' | 'percentage') {
    const buttonText = type === 'fixed' ? 'Fixed Interest' : 'Percentage Interest';
    // These are rendered as <button> wrapping a Card, with the title text inside
    await this.page.locator('button').filter({ hasText: buttonText }).click();
    await this.nextButton.click();
  }

  async selectBorrower(name: string) {
    // Wait for step 2 to render
    await this.page.getByText('Step 2 of 5').waitFor({ state: 'visible', timeout: 10000 });
    
    // Open the borrower dropdown
    const dropdown = this.page.locator('button').filter({ hasText: 'Select a borrower...' }).or(
      this.page.locator('button').filter({ hasText: '▼' })
    ).first();
    await dropdown.click();

    // Search and select
    const searchInput = this.page.getByPlaceholder('Search by name, phone...');
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill(name);
    await this.page.waitForTimeout(500);

    // Click the matching borrower option in the dropdown list
    const borrowerOption = this.page.locator('button').filter({ hasText: new RegExp(name) });
    // If there are multiple matches, pick the one inside the dropdown menu
    await borrowerOption.last().click();

    await this.nextButton.click();
  }

  async fillLoanDetails(principal: string, frequency: string, term: string, startDate: string) {
    // Wait for step 3 to render
    await this.page.getByText('Step 3 of 5').waitFor({ state: 'visible', timeout: 10000 });

    // Principal - use label text locator
    const principalInput = this.page.locator('label:has-text("Principal Amount") input').or(
      this.page.getByPlaceholder('e.g. 50000')
    ).first();
    await principalInput.fill(principal);

    // Frequency - it's a <select> element
    const frequencySelect = this.page.locator('select');
    await frequencySelect.selectOption(frequency);

    // Term - input with maxLength="5", wait a moment for re-render after frequency change
    await this.page.waitForTimeout(300);
    const termInput = this.page.locator('input[maxlength="5"]');
    await termInput.fill(term);

    // Start Date
    const dateInput = this.page.locator('input[type="date"]');
    await dateInput.fill(startDate);

    await this.nextButton.click();
  }

  async fillInterestDetails(details: { totalPayable?: string; interestRate?: string; penaltyRate?: string }) {
    // Wait for step 4 to render
    await this.page.getByText('Step 4 of 5').waitFor({ state: 'visible', timeout: 10000 });

    if (details.totalPayable) {
      const input = this.page.getByPlaceholder('e.g. 60000');
      await input.fill(details.totalPayable);
    }
    if (details.interestRate) {
      const input = this.page.getByPlaceholder('e.g. 5').first();
      await input.fill(details.interestRate);
    }
    if (details.penaltyRate) {
      // The penalty rate input uses the same placeholder 'e.g. 5'
      // It's the second one if interest rate was also 'e.g. 5', or the last one
      const penaltyInput = this.page.locator('label:has-text("Default Penalty Rate") input').or(
        this.page.getByPlaceholder('e.g. 5').last()
      ).first();
      await penaltyInput.fill(details.penaltyRate);
    }

    await this.nextButton.click();
  }

  async confirmLoan() {
    // Wait for step 5 (Review)
    await this.page.getByText('Step 5 of 5').waitFor({ state: 'visible', timeout: 10000 });
    await this.confirmButton.click();
  }

  async expectSuccess() {
    await expect(this.successMessage).toBeVisible({ timeout: 15000 });
  }
}
