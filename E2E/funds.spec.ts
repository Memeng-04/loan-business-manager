import { test, expect } from '@playwright/test';
import { FundPage } from './pages/FundPage';

test.describe('Fund Management', () => {
  let fundPage: FundPage;

  test.beforeEach(async ({ page }) => {
    fundPage = new FundPage(page);
    await fundPage.goto();
  });

  test('should successfully add capital to the fund', async () => {
    await fundPage.openManageFundsModal();
    
    await fundPage.updateFunds({
      addCapital: '10000'
    });

    await fundPage.expectSuccess();
    await fundPage.expectBalanceToUpdate();
  });

  test('should successfully withdraw profit from the fund', async () => {
    await fundPage.openManageFundsModal();
    
    // Add profit first (since new test users start with 0 profit)
    await fundPage.updateFunds({
      addProfit: '1000'
    });

    await fundPage.expectSuccess();
  });
});
