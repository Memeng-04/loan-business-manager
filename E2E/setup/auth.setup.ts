import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { createClient } from '@supabase/supabase-js';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
  const email = `e2e_${Date.now()}@test.com`;
  const password = 'TestPassword123!';

  // 1. Create auto-confirmed user via Admin API
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError) {
    throw new Error(`Failed to create test user: ${createError.message}`);
  }

  // 2. Log in through the UI
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await page.waitForLoadState('networkidle');
  await loginPage.login(email, password);
  
  // 3. Wait for the app to settle on a protected route
  // It might briefly hit /dashboard and then redirect to /onboarding
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 20000 });
  await page.waitForLoadState('networkidle');

  // 4. Handle Onboarding if the app requires it
  // We check for the onboarding heading to be sure we are there
  const onboardingHeading = page.getByText('Set up your profile.');
  const isAtOnboarding = await onboardingHeading.isVisible({ timeout: 5000 }).catch(() => false);

  if (isAtOnboarding || page.url().includes('/onboarding')) {
    // Profile step
    const nameInput = page.locator('label:has-text("Government Full Name") input');
    const displayInput = page.locator('label:has-text("Display Name") input');
    
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('E2E Tester');
    await displayInput.fill('Tester');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Capital step
    const capitalInput = page.locator('label:has-text("Capital Lent Out So Far") input');
    await capitalInput.waitFor({ state: 'visible' });
    await capitalInput.fill('100000');
    await page.locator('label:has-text("Total Profit Earned So Far") input').fill('0');
    await page.getByRole('button', { name: 'Get Started' }).click();

    await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
  }

  // 5. Final verification: Dashboard should be visible
  await page.waitForLoadState('networkidle');
  const greeting = page.locator('h2').filter({ hasText: 'Hi,' });
  await expect(greeting).toBeVisible({ timeout: 15000 });
  
  // Important: Wait for Supabase to persist the session to localStorage
  // Capture the state once the dashboard is fully active
  await page.waitForTimeout(2000);
  await page.context().storageState({ path: authFile });
});
