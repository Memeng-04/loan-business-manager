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

  // 3. Wait for the app to settle on the profile onboarding route.
  // A freshly created user must complete their profile first.
  await expect(page).toHaveURL(/\/onboarding\/profile$/, { timeout: 30000 });

  // 4. Handle Onboarding
  // Stage 1: Profile details
  const fullNameInput = page.getByLabel("Government Full Name");
  await fullNameInput.waitFor({ state: "visible", timeout: 15000 });
  await fullNameInput.fill("E2E Tester");
  await page.getByLabel("Display Name").fill("Mr. Tester");
  await page.getByRole("button", { name: "Continue" }).click();

  // Stage 2: Capital details
  await expect(page).toHaveURL(/\/onboarding\/capital$/, { timeout: 15000 });
  const capitalInput = page.getByLabel("Capital Lent Out So Far");
  await capitalInput.waitFor({ state: "visible", timeout: 15000 });
  await capitalInput.fill("100000");
  await page.getByLabel("Total Profit Earned So Far").fill("0");
  await page.getByRole("button", { name: "Get Started" }).click();

  // 5. Final verification: Dashboard should be visible
  try {
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30000 });
    await expect(page.getByTestId("dashboard-root")).toBeVisible({
      timeout: 15000,
    });
  } catch (e) {
    const currentUrl = page.url();
    const bodyText = await page.locator("body").innerText();
    throw new Error(
      `Failed to load dashboard. Current URL: ${currentUrl}\nPage Text:\n${bodyText}`,
    );
  }
  await expect(
    page.getByRole("heading", { level: 2, name: /^Hi,/ }),
  ).toBeVisible();

  // Important: Wait for Supabase to persist the session to localStorage
  // Capture the state once the dashboard is fully active
  await page.waitForTimeout(2000);
  await page.context().storageState({ path: authFile });
});
