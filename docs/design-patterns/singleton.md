# Singleton Design Pattern (Database)

The **Singleton Pattern** ensures that a class has only one instance and provides a global point of access to it.

## Implementation in LEND

In LEND, the primary use of the Singleton pattern is for the database connection (Supabase Client).

- **File:** [src/services/supabase.ts](../../src/services/supabase.ts)

## Purpose and Advantages

1.  **Resource Management:** Prevents the application from opening multiple unnecessary connections to Supabase.
2.  **Consistency:** Ensures that every part of the application is using the same configuration and authentication state.
3.  **Global Access:** Allows any file to import and use the pre-configured database client easily.

## How it Works

Instead of creating a new client every time we need to query data, the `supabase.ts` file initializes the client once and exports it. Due to the way JavaScript modules work, this exported variable acts as a Singleton.

### Code Example ([src/services/supabase.ts](../../src/services/supabase.ts#L13))

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This instance is created ONCE per application lifecycle
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

In the Repositories, we use this instance:

```typescript
import { supabase } from "../services/supabase";

export class BorrowerRepository {
  static async getAll(client: SupabaseClient = supabase) {
    // Uses the singleton client by default
  }
}
```

## How we did it

We implemented the Singleton pattern by leveraging the JavaScript/TypeScript module system.

1.  **Initialization:** We created `src/services/supabase.ts`.
2.  **Configuration:** We import the `createClient` function from the Supabase SDK and initialize it using environment variables.
3.  **Exporting the Instance:** By exporting the constant `supabase`, we ensure that any file importing it receives the exact same instance.
    ```typescript
    // src/services/supabase.ts
    export const supabase = createClient(url, key);
    ```
4.  **Dependency Injection:** In our Repository classes, we default the `client` parameter to this singleton, which allows us to use it globally while still being able to "inject" a different client (like a mock) during testing:
    ```typescript
    static async getAll(client: SupabaseClient = supabase) { ... }
    ```

## Why we chose it

Supabase clients manage their own authentication state and connection pooling. By using a Singleton, we ensure that when a user logs in, the standard client is automatically updated with the correct auth token, and all subsequent repository calls use that authenticated session without extra configuration.
