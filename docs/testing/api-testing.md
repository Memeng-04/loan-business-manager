# API Testing (Supabase Edge Functions)

**API Testing** ensures that our backend logic—specifically **Supabase Edge Functions**—behaves correctly when triggered by HTTP requests. These tests verify server-side operations like payment processing and complex state transitions.

## Implementation in LEND

We use **Vitest** to handle the test runner and assertions, while the **Supabase JS Client** is used to invoke the real Edge Functions in a test environment.

- **Tools:** Vitest, Supabase SDK (`functions.invoke`)
- **Location:** `supabase/functions/__tests__/*.test.ts`
- **Command:** `npm run test:api`

## What we test

1.  **Function Execution:** Verifying that functions like `record-payment` or `allocate-payment` return a `success: true` response.
2.  **Complex Logic:** Ensuring calculations that happen on the server (server-side) are accurate.
3.  **Authentication:** Validating that functions properly handle JWT tokens and reject unauthorized requests.
4.  **Error Handling:** Proving the API returns correct HTTP status codes for invalid input or business rule violations (e.g., trying to pay more than the outstanding balance).

## Why we use it

Edge Functions are written in Deno and run in a different environment than our React frontend. API testing is crucial to:
- Test logic that cannot be done on the client (like database transactions across multiple tables).
- Ensure the communication between the Frontend and the Backend endpoints remains robust.
- Catch bugs in "headless" logic that doesn't have a UI yet.

## How we did it

1.  **Test Environment:** We use a real Supabase instance (local or staging).
2.  **User Simulation:**
    - We use `supabaseAdmin` to bypass security and set up a temporary test user and test data.
    - We use `signInWithPassword` to get a real **JWT Access Token**.
3.  **Function Invocation:** We call the function using the standard Supabase client with the user's token:
    ```typescript
    const { data, error } = await supabaseUser.functions.invoke('record-payment', {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { loanId: testLoanId, amount: 100 }
    });
    ```
4.  **Verification:** We verify both the response from the function and the resulting state in the database.

### Code Example ([supabase/functions/__tests__/record-payment.test.ts](supabase/functions/__tests__/record-payment.test.ts#L79))

```typescript
it('should record a payment successfully', async () => {
  const { data, error } = await supabaseUser.functions.invoke('record-payment', {
    body: { loanId: testLoanId, amount: 100 }
  });

  expect(data?.success).toBe(true);
  // We also check the database to ensure a payment record was actually created
});
```
