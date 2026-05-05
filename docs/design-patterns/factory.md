# Factory Design Pattern

The **Factory Pattern** is a creational pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.

## Implementation in LEND

LEND uses the Factory pattern to standardize the creation of complex objects like Loans and Borrowers, ensuring all necessary transformations and calculations are performed correctly.

- **Files:**
  - [src/factories/LoanFactory.ts](src/factories/LoanFactory.ts)
  - [src/factories/BorrowerFactory.ts](src/factories/BorrowerFactory.ts)
  - [src/factories/PaymentActionFactory.ts](src/factories/PaymentActionFactory.ts)

## Purpose and Advantages

1.  **Standardization:** Ensures every Loan or Borrower object created follows the same internal structure.
2.  **Encapsulation:** Hidden complexity of initial calculations (like end dates or payment amounts).
3.  **DRY (Don't Repeat Yourself):** Prevents the need to rewrite the same object preparation logic in multiple components or hooks.

## How it Works

The Factory classes provide static methods that take raw input from the UI and return a fully formed object ready to be saved to the database. It often works in conjunction with the **Strategy Pattern**.

### Code Example ([src/factories/LoanFactory.ts](src/factories/LoanFactory.ts#L8))

```typescript
export class LoanFactory {
  static create(input: CreateLoanInput): Loan {
    const strategy = new FixedInterestStrategy();
    const result = strategy.calculate(...);

    return {
      borrower_id: input.borrower_id,
      principal: input.principal,
      total_payable: result.totalPayable,
      interest: result.interest,
      // ... more fields ...
      status: 'active'
    }
  }
}
```

## How we did it

We implemented the Factory pattern by creating static classes that act as "object builders" for our domain models.

1.  **Centralizing Logic:** We created `LoanFactory.ts` in `src/factories/` to handle the heavy lifting of preparing a loan entity.
2.  **Strategy Integration:** The factory imports the necessary `InterestStrategy` to perform calculations before building the final object.
3.  **Standardizing Output:** It ensures that properties like `status: 'active'` or calculated `end_date` are always set correctly.
4.  **Usage in Services:** When a user submits a "Create Loan" form, the service layer calls:

    ```typescript
    import { LoanFactory } from "../factories/LoanFactory";

    const newLoan = LoanFactory.create(formData);
    await LoanRepository.save(newLoan);
    ```

## Why we chose it

Creating a loan isn't as simple as just saving values; it requires calculating interest, determining the end date based on frequency, and setting initial status. The Factory pattern ensures that this "assembly" logic is centralized and consistent across the entire application.
