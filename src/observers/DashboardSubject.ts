import type { Observer, DashboardState } from "./Observer";

/**
 * Subject (Observable) class implementing the Gang of Four Observer pattern
 * Maintains a list of observers and notifies them of state changes
 */
export class DashboardSubject {
  private observers: Set<Observer> = new Set();
  private state: DashboardState = {
    balance: 0,
    capital: 0,
    profit: 0,
    activeLoanCount: 0,
    totalRevenue: 0,
    completedLoans: 0,
    timestamp: Date.now(),
  };

  /**
   * Attaches an observer to the subject
   * @param observer The observer to attach
   */
  attach(observer: Observer): void {
    this.observers.add(observer);
  }

  /**
   * Detaches an observer from the subject
   * @param observer The observer to detach
   */
  detach(observer: Observer): void {
    this.observers.delete(observer);
  }

  /**
   * Notifies all attached observers of state changes
   */
  private notify(): void {
    this.observers.forEach((observer) => {
      observer.update(this.state);
    });
  }

  /**
   * Updates the subject's state and notifies all observers
   * @param newState The new state
   */
  setState(newState: Partial<DashboardState>): void {
    this.state = {
      ...this.state,
      ...newState,
      timestamp: Date.now(),
    };
    this.notify();
  }

  /**
   * Gets the current state
   */
  getState(): DashboardState {
    return { ...this.state };
  }

  /**
   * Gets the number of attached observers
   */
  getObserverCount(): number {
    return this.observers.size;
  }

  /**
   * Clears all observers
   */
  clearObservers(): void {
    this.observers.clear();
  }
}

// Singleton instance for global dashboard state management
export const dashboardSubject = new DashboardSubject();
