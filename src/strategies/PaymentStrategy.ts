// src/strategies/PaymentStrategy.ts
// Payment calculation and validation strategy (US-10: Support Partial Payments)

import type { PaymentValidation } from '../types/payment';

/**
 * Round money to 2 decimal places
 * Business rule: Always round using Math.round((amount * 100)) / 100
 */
export const roundToTwoDecimals = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

/**
 * Calculate remaining balance after a payment is made
 * @param totalDue - Total amount due for this period
 * @param amountPaid - Amount that was paid
 * @returns Remaining balance to be paid
 */
export const calculateRemainingBalance = (
  totalDue: number,
  amountPaid: number
): number => {
  const remaining = totalDue - amountPaid;
  return roundToTwoDecimals(Math.max(0, remaining));
};

/**
 * Check if a payment is partial
 * @param amountPaid - Amount paid by borrower
 * @param dueAmount - Amount due for this period
 * @returns true if payment is partial (less than due but greater than 0)
 */
export const isPartialPayment = (
  amountPaid: number,
  dueAmount: number
): boolean => {
  return amountPaid > 0 && amountPaid < dueAmount;
};

/**
 * Validate a payment amount against the due amount
 * @param amountPaid - Amount being paid
 * @param dueAmount - Amount due
 * @returns Validation result with message
 */
export const validatePayment = (
  amountPaid: number,
  dueAmount: number
): PaymentValidation => {
  // Check if amount is negative
  if (amountPaid < 0) {
    return {
      valid: false,
      message: 'Payment amount cannot be negative',
    };
  }

  // Check if amount is zero
  if (amountPaid === 0) {
    return {
      valid: false,
      message: 'Payment amount must be greater than 0',
    };
  }

  // Check if amount exceeds due amount
  if (amountPaid > dueAmount) {
    return {
      valid: true,
      message: `Payment exceeds due amount (₱${dueAmount.toFixed(2)}). Extra ₱${roundToTwoDecimals(amountPaid - dueAmount).toFixed(2)} will be applied to next period.`,
      isPartial: false,
    };
  }

  // Check if payment is partial
  if (isPartialPayment(amountPaid, dueAmount)) {
    const remaining = calculateRemainingBalance(dueAmount, amountPaid);
    return {
      valid: true,
      message: `Partial payment recorded. Remaining balance: ₱${remaining.toFixed(2)}`,
      isPartial: true,
      remainingBalance: remaining,
    };
  }

  // Full payment
  return {
    valid: true,
    message: 'Full payment recorded',
    isPartial: false,
    remainingBalance: 0,
  };
};

/**
 * Allocate payment between interest and principal
 * Business rule: Interest is always paid first
 * @param totalPaid - Total amount paid
 * @param interestDue - Interest portion of the payment
 * @returns { interestPortion, principalPortion }
 */
export const allocatePayment = (
  totalPaid: number,
  interestDue: number
): { interestPortion: number; principalPortion: number } => {
  // Interest is paid first
  const interestPortion = roundToTwoDecimals(Math.min(totalPaid, interestDue));
  const principalPortion = roundToTwoDecimals(totalPaid - interestPortion);

  return {
    interestPortion,
    principalPortion,
  };
};
