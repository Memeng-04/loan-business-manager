/**
 * Observer Pattern Implementation
 * Gang of Four: Observer Pattern for reactive dashboard state management
 *
 * This module provides a decoupled way for multiple components to react to dashboard state changes
 * without tight coupling between the dashboard and individual components.
 *
 * Usage:
 * 1. Create a class implementing Observer interface
 * 2. Implement the update() method to react to state changes
 * 3. Attach to dashboardSubject using attach()
 * 4. On state changes, call dashboardSubject.setState()
 * 5. All attached observers will be notified automatically
 */

export type { Observer, DashboardState } from "./Observer";
export { DashboardSubject, dashboardSubject } from "./DashboardSubject";
