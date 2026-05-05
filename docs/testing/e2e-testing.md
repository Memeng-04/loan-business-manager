# End-to-End (E2E) Testing

**E2E Testing** simulates real user journeys from start to finish. It tests the "full stack": Frontend -> API -> Database.

## Implementation in LEND

We use **Playwright** to automate a browser (Chromium/Webkit) and perform actions just like a lender would.

- **Tools:** Playwright
- **Location:** `E2E/*.spec.ts`
- **Command:** `npm run e2e`

## What we test (The Critical Path)

1.  **Authentication:** Login and Onboarding flows.
2.  **Successful Loan Cycle:**
    - Create a Borrower.
    - Create a Loan for that borrower.
    - Record a Payment for that loan.
    - Verify the Dashboard updates (Observer pattern in action).
3.  **Edge Cases:** Dealing with invalid inputs or "expired" sessions.

## Why we use it

E2E tests are the ultimate safety net. While unit and integration tests prove the "parts" work, E2E tests prove the **entire application** fulfills the user's needs. If an E2E test passes, we are confident the app is ready for production.

## How we do it

We follow the **Page Object Model (POM)** to keep tests readable and maintainable.

1.  **Page Objects:** We have files like `LoanPage.ts` and `BorrowerPage.ts` that encapsulate the selectors for those pages.
2.  **Specs:** The test files (`.spec.ts`) describe the user story.

### Code Example ([E2E/loans.spec.ts](../../E2E/loans.spec.ts#L6))

```typescript
test("should create a loan and record payment", async ({ page }) => {
  const loanPage = new LoanPage(page);
  await loanPage.goto();

  await loanPage.selectLoanType("fixed");
  await loanPage.selectBorrower("John Doe");
  await loanPage.fillLoanDetails("50000", "monthly", "6", startDate);
  await loanPage.confirmLoan();

  await loanPage.expectSuccess();
});
```

E2E testing ensures that no matter how much we refactor the "under the hood" code, the user's experience remains broken-free.
