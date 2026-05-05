# Repository Design Pattern

The **Repository Pattern** is used to mediate between the domain and data mapping layers, acting like an in-memory collection of domain objects. It encapsulates the logic required to access data sources.

## Implementation in LEND

The repository pattern is central to how LEND interacts with Supabase (PostgreSQL). Each major entity has its own repository class.

- **Files:**
  - [src/repositories/BorrowerRepository.ts](src/repositories/BorrowerRepository.ts)
  - [src/repositories/LoanRepository.ts](src/repositories/LoanRepository.ts)
  - [src/repositories/PaymentRepository.ts](src/repositories/PaymentRepository.ts)
  - [src/repositories/ScheduleRepository.ts](src/repositories/ScheduleRepository.ts)
  - [src/repositories/UserProfileRepository.ts](src/repositories/UserProfileRepository.ts)
  - [src/repositories/DashboardRepository.ts](src/repositories/DashboardRepository.ts)

## Purpose and Advantages

1.  **Decoupling:** Decouples the business logic from the data access logic (Supabase queries).
2.  **Centralized Logic:** Provides a single place to manage data access logic for an entity.
3.  **Testability:** Makes it easier to mock data access for unit tests.
4.  **Ownership Checks:** Centralizes security logic, ensuring users only access their own data.

## How it Works

The Repositories provide static methods for CRUD operations. They handle:

- Authenticating the request (getting the current user ID).
- Constructing complex Supabase queries.
- Mapping database records back to TypeScript types.

### Code Example ([src/repositories/BorrowerRepository.ts](src/repositories/BorrowerRepository.ts#L7))

```typescript
export class BorrowerRepository {
  /**
   * Get all borrowers for the current authenticated user
   */
  static async getAll(client: SupabaseClient = supabase): Promise<Borrower[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await client
      .from("borrowers")
      .select("...")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }
}
```

## How we did it

We implemented the Repository pattern by creating specialized classes in the `src/repositories/` folder. Each class contains static methods representing distinct data operations.

1.  **Defining the Repository:** For example, we created `BorrowerRepository` to house all borrower-related database logic.
2.  **Importing Dependencies:** We import the singleton `supabase` client and authentication helpers:
    ```typescript
    import { supabase } from "../services/supabase";
    import { getCurrentUserId } from "../services/auth";
    ```
3.  **Encapsulating Queries:** We moved raw Supabase queries into high-level methods like `getAll()` or `create()`.
4.  **Consuming in Hooks:** Instead of React components calling the database directly, they use custom hooks that import and call these repository methods, maintaining a clean separation of concerns.

## Why we chose it

We chose the Repository pattern to ensure that our business logic (like loan calculations or dashboard updates) doesn't get cluttered with raw SQL-like Supabase queries. It keeps the codebase clean, maintainable, and highly organized.
