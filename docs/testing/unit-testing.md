# Unit Testing

**Unit Testing** focuses on verifying the correctness of individual functions and logic in isolation. These tests are fast, reliable, and do not depend on external services like databases or network connections.

## Implementation in LEND

We use **Vitest** for our unit testing suite. The tests primarily target pure functions, data formatters, and calculation strategies.

- **Tools:** Vitest
- **Location:** `src/**/__tests__/*.test.ts`
- **Command:** `npm run test:unit`

## What we test

1.  **Strategies:** Validating mathematics for different loan types (Fixed vs Percentage).
    - [src/strategies/__tests__/InterestStrategy.test.ts](src/strategies/__tests__/InterestStrategy.test.ts)
2.  **Factories:** Ensuring UI input is correctly transformed into database-ready objects.
    - [src/factories/__tests__/LoanFactory.test.ts](src/factories/__tests__/LoanFactory.test.ts)
3.  **Utils:** Formatting currency, dates, and number calculations.
    - [src/utils/__tests__/numberUtils.test.ts](src/utils/__tests__/numberUtils.test.ts)

## Why we use it

Unit tests provide immediate feedback during development. By testing the "pure" logic (like interest calculations) separately from the UI or Database, we ensure that the core mathematical engine of LEND is 100% accurate.

## How we do it

We follow the **AAA (Arrange, Act, Assert)** pattern:
- **Arrange:** Set up the input data.
- **Act:** Call the function or strategy.
- **Assert:** Verify the output matches the expected result.

### Code Example ([src/strategies/__tests__/InterestStrategy.test.ts](src/strategies/__tests__/InterestStrategy.test.ts))

```typescript
it('should correctly calculate percentage interest', () => {
    const strategy = new PercentageInterestStrategy();
    const result = strategy.calculate(1000, 30, 'monthly', '2024-01-01', 10);
    
    expect(result.interest).toBe(100);
    expect(result.totalPayable).toBe(1100);
});
```
