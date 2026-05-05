import { test, expect } from '@playwright/test';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { createClient } from '@supabase/supabase-js';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Onboarding Flow', () => {
  let onboardingPage: OnboardingPage;
  let supabaseAdmin: ReturnType<typeof createClient>;

  test.beforeAll(() => {
    supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  });

  test.beforeEach(async ({ page }) => {
    const email = `onboard_${Date.now()}@test.com`;
    const password = 'TestPassword123!';

    // 1. Create user via Admin API
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) throw new Error(`Failed to create user: ${error.message}`);

    // 2. Delete the auto-created profile so the app routes to onboarding
    if (user) {
      await supabaseAdmin.from('user_profiles').delete().eq('user_id', user.id);
    }

    // 3. Log in via UI
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await page.waitForLoadState('networkidle');
    await loginPage.login(email, password);

    // 4. Should redirect to onboarding since profile was deleted
    await page.waitForURL(/.*\/onboarding\/profile/, { timeout: 15000 });

    onboardingPage = new OnboardingPage(page);
  });

  test('should complete step 1 and move to step 2', async () => {
    await onboardingPage.completeProfile('John Doe', 'JohnD');
    await expect(onboardingPage.page).toHaveURL(/.*\/onboarding\/capital/);
  });

  test('should persist step 1 data in session storage', async ({ page }) => {
    await onboardingPage.completeProfile('John Doe', 'JohnD');
    const data = await page.evaluate(() => sessionStorage.getItem('onboarding_profile_step'));
    expect(data).toContain('John Doe');
  });
});
