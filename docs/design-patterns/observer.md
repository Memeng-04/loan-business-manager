# Observer Design Pattern

The **Observer Pattern** defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

## Implementation in LEND

LEND uses the Observer pattern to keep the Dashboard UI synchronized with the underlying financial data without direct coupling.

- **Files:**
  - [src/observers/Observer.ts](src/observers/Observer.ts) (Interface)
  - [src/observers/DashboardSubject.ts](src/observers/DashboardSubject.ts) (Subject)
  - [src/observers/index.ts](src/observers/index.ts) (Singleton instance)

## Interfaces ([src/observers/Observer.ts](src/observers/Observer.ts#L5))

```typescript
export interface Observer {
  update(state: DashboardState): void;
}

export interface DashboardState {
  balance: number;
  capital: number;
  profit: number;
  activeLoanCount: number;
  totalRevenue: number;
  completedLoans: number;
  timestamp: number;
}
```

## Purpose and Advantages

1.  **Reactive UI:** Real-time updates across different parts of the application when data changes.
2.  **Loose Coupling:** The `DashboardSubject` (the data provider) doesn't need to know which components are listening to it.
3.  **Efficiency:** Components only update when relevant state changes occur.

## How it Works

1.  **Subject:** The `DashboardSubject` maintains a list of `Observer` objects and a state object.
2.  **Attach/Detach:** Components can `attach` themselves to the subject when they mount and `detach` when they unmount.
3.  **Notify:** When data is fetched or updated (e.g., after a payment is recorded), the `setState` method is called, which triggers `notify()`, calling `update()` on all registered observers.

### Code Example ([src/observers/DashboardSubject.ts](src/observers/DashboardSubject.ts#L8))

```typescript
export class DashboardSubject {
  private observers: Set<Observer> = new Set();

  attach(observer: Observer): void {
    this.observers.add(observer);
  }

  private notify(): void {
    this.observers.forEach((observer) => {
      observer.update(this.state);
    });
  }
}
```

## How we did it

We implemented the Observer pattern by creating a dedicated `DashboardSubject` that acts as the "Source of Truth" for financial metrics.

1.  **Creating the Interface:** We defined the `Observer` interface in `Observer.ts` so any class or component can implement it.
2.  **Instantiating the Subject:** In `src/observers/index.ts`, we export a single instance of `DashboardSubject`:
    ```typescript
    export const dashboardSubject = new DashboardSubject();
    ```
3.  **Linking to UI:** Components (like the Dashboard page) import this instance, implement the `update` method, and attach themselves during the `useEffect` lifecycle:
    ```typescript
    useEffect(() => {
      dashboardSubject.attach(myObserver);
      return () => dashboardSubject.detach(myObserver);
    }, []);
    ```
4.  **Triggering Updates:** When a repository saves a payment, it calls `dashboardSubject.setState()`, which automatically triggers the `update()` call on all attached UI components.

## Why we chose it

We chose the Observer pattern to handle the complex state of the Lender's dashboard. Since multiple components (charts, stat cards, activity logs) depend on the same financial state, the Observer pattern provides a robust way to ensure everything stays in sync without passing props through many layers of components.
