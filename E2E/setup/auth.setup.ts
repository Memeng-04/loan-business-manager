import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { createClient } from "@supabase/supabase-js";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
  const email = `e2e_${Date.now()}@test.com`;
  const password = "TestPassword123!";

  // 1. Create auto-confirmed user via Admin API
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    throw new Error(`Failed to create test user: ${createError.message}`);
  }

  // 2. Log in through the UI
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await page.waitForLoadState("networkidle");
  await loginPage.login(email, password);

  // 3. Wait for the app to settle on a protected route.
  // It can land on onboarding first and only reach /dashboard after profile setup.
  await expect(page).toHaveURL(
    /\/(onboarding\/profile|onboarding\/capital|dashboard)$/,
    {
      timeout: 20000,
    },
  );

  // 4. Handle Onboarding if the app requires it
  const isAtOnboarding =
    page.url().includes("/onboarding") ||
    (await page
      .getByRole("heading", { name: "Tell us your name details." })
      .isVisible());

  if (isAtOnboarding) {
    // Stage 1: Profile details
    await page.getByLabel("Government Full Name").fill("E2E Tester");
    await page.getByLabel("Display Name").fill("Mr. Tester");

    // Click and wait for either the capital step or Dashboard to avoid racing navigation
    await Promise.all([
      page.getByRole("button", { name: "Continue" }).click(),
      page
        .waitForURL(/.*\/onboarding\/capital|.*\/dashboard/, { timeout: 15000 })
        .catch(() => {}),
      page
        .getByLabel("Capital Lent Out So Far")
        .waitFor({ timeout: 15000 })
        .catch(() => {}),
    ]);

    // If we are at the capital step, fill and continue
    if (
      page.url().includes("/onboarding/capital") ||
      (await page.getByLabel("Capital Lent Out So Far").count()) > 0
    ) {
      await page.getByLabel("Capital Lent Out So Far").fill("100000");
      await page.getByLabel("Total Profit Earned So Far").fill("0");
      await Promise.all([
        page.getByRole("button", { name: "Get Started" }).click(),
        page.waitForURL(/.*\/dashboard/, { timeout: 15000 }).catch(() => {}),
      ]);
    }
  }

  // 5. Final verification: Dashboard should be visible
  await expect(page.getByTestId("dashboard-root")).toBeVisible({
    timeout: 30000,
  });
  await expect(
    page.getByRole("heading", { level: 2, name: /^Hi,/ }),
  ).toBeVisible();

  // Important: Wait for Supabase to persist the session to localStorage
  // Capture the state once the dashboard is fully active
  await page.waitForTimeout(2000);
  await page.context().storageState({ path: authFile });
});
