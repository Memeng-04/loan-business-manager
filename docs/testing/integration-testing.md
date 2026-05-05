# Integration & API Testing

**Integration Testing** verifies that different parts of the system work together, specifically the code's interaction with the **Supabase Database** and **Edge Functions**.

## Implementation in LEND

Unlike unit tests, integration tests communicate with a **real test database**. This ensures that Row Level Security (RLS) and database constraints are working as expected.

- **Tools:** Vitest, Supabase JS Client
- **Location:** `src/repositories/__tests__/*.integration.test.ts`
- **Command:** `npm run test:integration`

## What we test

1.  **Repositories:** Verifying that `LoanRepository` or `BorrowerRepository` correctly saves and retrieves data from Supabase.
2.  **Security (RLS):** Proving that one lender cannot see another lender's borrowers.
3.  **Edge Functions:** Testing the API endpoints (e.g., payment processing logic running on the server).

## Why we use it

We use integration tests because "mocking" a database isn't enough to guarantee the app works. We need to know that:

- Our SQL queries are valid.
- Our database schema matches our TypeScript interfaces.
- Our security rules (RLS) actually block unauthorized access.

## How we do it

1.  **Setup:** Each test file creates a unique test user.
2.  **Clean up:** Before each test, we delete all records for that test user to ensure a "clean slate."
3.  **Execution:** We call the Repository methods directly and assert that the data in the database matches what we expect.

### Code Example ([src/repositories/**tests**/BorrowerRepository.integration.test.ts](src/repositories/__tests__/BorrowerRepository.integration.test.ts#L33))

```typescript
it("should create and fetch a borrower", async () => {
  const input = { full_name: "John Doe", phone: "1234" };

  // Test the integration between Repository code and Real Supabase
  const borrower = await BorrowerRepository.create(input, supabaseAdmin);
  const fetched = await BorrowerRepository.getById(borrower.id!, supabaseAdmin);

  expect(fetched?.full_name).toBe("John Doe");
});
```
