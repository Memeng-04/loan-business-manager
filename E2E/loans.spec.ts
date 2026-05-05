import { test } from '@playwright/test';
import { LoanPage } from './pages/LoanPage';
import { BorrowerPage } from './pages/BorrowerPage';

test.describe('Loan Lifecycle', () => {
  test('should create a Fixed Interest Loan successfully', async ({ page }) => {
    // 1. Create a borrower for this loan
    const borrowerPage = new BorrowerPage(page);
    await borrowerPage.goto();
    const borrowerName = `Fixed Tester ${Date.now()}`;
    await borrowerPage.createBorrower({
      name: borrowerName,
      address: 'Test Address',
      phone: '09111111111'
    });

    // 2. Go to the loan creation wizard
    const loanPage = new LoanPage(page);
    await loanPage.goto();

    // Step 1: Select Loan Type
    await loanPage.selectLoanType('fixed');

    // Step 2: Select Borrower
    await loanPage.selectBorrower(borrowerName);

    // Step 3: Fill Details
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split('T')[0];
    
    await loanPage.fillLoanDetails('50000', 'monthly', '6', startDate);

    // Step 4: Interest Details (Fixed)
    await loanPage.fillInterestDetails({
      totalPayable: '60000',
      penaltyRate: '5'
    });

    // Step 5: Confirm
    await loanPage.confirmLoan();

    // Verification
    await loanPage.expectSuccess();
  });

  test('should create a Percentage Interest Loan successfully', async ({ page }) => {
    // 1. Create a borrower for this loan
    const borrowerPage = new BorrowerPage(page);
    await borrowerPage.goto();
    const borrowerName = `Pct Tester ${Date.now()}`;
    await borrowerPage.createBorrower({
      name: borrowerName,
      address: 'Test Address 2',
      phone: '09222222222'
    });

    // 2. Go to the loan creation wizard
    const loanPage = new LoanPage(page);
    await loanPage.goto();

    // Step 1: Select Loan Type
    await loanPage.selectLoanType('percentage');

    // Step 2: Select Borrower
    await loanPage.selectBorrower(borrowerName);

    // Step 3: Fill Details
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split('T')[0];
    
    await loanPage.fillLoanDetails('100000', 'daily', '30', startDate);

    // Step 4: Interest Details (Percentage)
    await loanPage.fillInterestDetails({
      interestRate: '5',
      penaltyRate: '2'
    });

    // Step 5: Confirm
    await loanPage.confirmLoan();

    // Verification
    await loanPage.expectSuccess();
  });
});
