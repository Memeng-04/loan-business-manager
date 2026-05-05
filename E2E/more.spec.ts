import { test, expect } from '@playwright/test';
import { MorePage } from './pages/MorePage';

test.describe('More / Settings', () => {
  let morePage: MorePage;

  test.beforeEach(async ({ page }) => {
    morePage = new MorePage(page);
    await morePage.goto();
  });

  test('should update profile names successfully', async () => {
    const newName = `Legal Name ${Date.now()}`;
    await morePage.updateProfile(newName, 'TestDisplay');
    await morePage.expectProfileUpdateSuccess();
    
    // Refresh to verify persistence
    await morePage.page.reload();
    await expect(morePage.page.getByText(newName)).toBeVisible();
  });

  test('should show terms and conditions', async ({ page }) => {
    await expect(page.getByText('LEND Terms & Conditions')).toBeVisible();
  });

});
