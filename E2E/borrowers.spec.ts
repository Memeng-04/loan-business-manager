import { test, expect } from '@playwright/test';
import { BorrowerPage } from './pages/BorrowerPage';

test.describe('Borrower Management', () => {
  let borrowerPage: BorrowerPage;

  test.beforeEach(async ({ page }) => {
    borrowerPage = new BorrowerPage(page);
    await borrowerPage.goto();
  });

  test('should create a new borrower and show in list', async ({ page }) => {
    const testName = `Test User ${Date.now()}`;
    await borrowerPage.createBorrower({
      name: testName,
      address: '123 Test St, Manila',
      phone: '09123456789',
    });

    // After saving, we are redirected back to /borrowers
    // The list needs time to reload from Supabase
    await page.waitForLoadState('networkidle');
    
    // Wait for either the list or the search bar to appear (means page loaded)
    await borrowerPage.addButton.waitFor({ state: 'visible', timeout: 15000 });
    
    await borrowerPage.search(testName);
    await borrowerPage.expectBorrowerInList(testName);
  });

  test('should show empty state when searching for non-existent borrower', async ({ page }) => {
    // First create a borrower so we have at least one (to get "no match" vs "no borrowers")
    const seedName = `Seed User ${Date.now()}`;
    await borrowerPage.createBorrower({
      name: seedName,
      address: 'Seed Address',
      phone: '09999999999',
    });

    await page.waitForLoadState('networkidle');
    await borrowerPage.addButton.waitFor({ state: 'visible', timeout: 15000 });

    // Now search for something that doesn't exist
    await borrowerPage.search('ZZZNonExistentUserSearchString');
    
    // The app shows "No borrowers match your search." when there are borrowers but none match
    await expect(page.getByText('No borrowers match your search.')).toBeVisible({ timeout: 10000 });
  });
});
