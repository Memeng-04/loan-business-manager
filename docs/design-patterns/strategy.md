# Strategy Design Pattern

The **Strategy Pattern** defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

## Implementation in LEND

LEND uses the Strategy pattern to handle different types of interest calculations and payment actions.

- **Files:**
  - [src/strategies/InterestStrategy.ts](src/strategies/InterestStrategy.ts)
  - [src/strategies/PaymentActionStrategies.ts](src/strategies/PaymentActionStrategies.ts)
  - [src/types/strategies.ts](src/types/strategies.ts) (Interfaces)

## Interfaces ([src/types/strategies.ts](src/types/strategies.ts))

```typescript
export interface IInterestStrategy {
  calculate(
    principal: number,
    termDays: number,
    frequency: PaymentFrequency,
    startDate: string,
    value: number,
  ): CalculationResult;
}
```

## Purpose and Advantages

1.  **Flexibility:** Easily add new interest calculation methods (e.g., Compound Interest) without changing existing code.
2.  **Single Responsibility:** Each strategy class is responsible for exactly one algorithm.
3.  **Clean Code:** Replaces complex `if-else` or `switch` statements with polymorphism.

## How it Works

In LEND, we have two primary interest strategies:

- **`FixedInterestStrategy`**: Used when the lender specifies the total amount the borrower must pay.
- **`PercentageInterestStrategy`**: Used when the lender specifies an interest rate (e.g., 5%).

### Code Example ([src/strategies/InterestStrategy.ts](src/strategies/InterestStrategy.ts#L45))

```typescript
export class PercentageInterestStrategy extends BaseInterestStrategy implements IInterestStrategy {
  calculate(...) {
    const interest = principal * (interestRate / 100);
    const totalPayable = principal + interest;
    // ... calculation logic ...
    return { ... };
  }
}
```

## How we did it

We implemented the Strategy pattern by defining a strictly typed interface and concrete class implementations.

1.  **Interface Definition:** We created `IInterestStrategy` in `src/types/strategies.ts` to enforce a consistent contract for all calculation methods.
2.  **Base Class:** We created `BaseInterestStrategy` to share common logic like date calculations and payment distribution.
3.  **Concrete Strategies:** We implemented `FixedInterestStrategy` and `PercentageInterestStrategy`.
4.  **Dynamic Selection:** In our `LoanFactory`, we import these strategies and instantiate the correct one based on the user's input:
    ```typescript
    import { FixedInterestStrategy, PercentageInterestStrategy } from '../strategies/InterestStrategy';
    
    // The factory decides which strategy to use
    const strategy = input.type === 'fixed' 
      ? new FixedInterestStrategy() 
      : new PercentageInterestStrategy();
    ```

## Why we chose it

Loan management involves diverse mathematical rules. By using the Strategy pattern, we ensure that if a lender wants a new way to calculate "Fix" vs "Percentage" loans, we can simply plug in a new strategy class without risking breakages in the core loan creation logic.
