import { test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Dashboard', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('should load all dashboard components', async () => {
    await dashboardPage.expectDashboardLoaded();
  });
});
