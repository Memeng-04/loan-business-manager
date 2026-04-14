/**
 * Observer interface for the Gang of Four Observer pattern
 * Implementing components will receive notifications when the observed subject's state changes
 */
export interface Observer {
  /**
   * Called when the subject's state changes
   * @param state The new state from the subject
   */
  update(state: DashboardState): void;
}

/**
 * Represents the state of the dashboard
 */
export interface DashboardState {
  balance: number;
  capital: number;
  profit: number;
  activeLoanCount: number;
  totalRevenue: number;
  completedLoans: number;
  timestamp: number;
}
