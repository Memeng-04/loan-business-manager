import {
  allocatePayment,
  calculateRemainingBalance,
  isPartialPayment,
  roundToTwoDecimals,
  validatePayment,
} from "../PaymentStrategy";

describe("PaymentStrategy", () => {
  it("rounds monetary values to two decimals", () => {
    expect(roundToTwoDecimals(10.235)).toBe(10.24);
    expect(roundToTwoDecimals(10.234)).toBe(10.23);
  });

  it("calculates a non-negative remaining balance", () => {
    expect(calculateRemainingBalance(100, 40.126)).toBe(59.87);
    expect(calculateRemainingBalance(100, 140)).toBe(0);
  });

  it("detects whether a payment is partial", () => {
    expect(isPartialPayment(50, 100)).toBe(true);
    expect(isPartialPayment(0, 100)).toBe(false);
    expect(isPartialPayment(100, 100)).toBe(false);
  });

  it("rejects negative and zero payment amounts", () => {
    expect(validatePayment(-1, 100)).toEqual({
      valid: false,
      message: "Payment amount cannot be negative",
    });
    expect(validatePayment(0, 100)).toEqual({
      valid: false,
      message: "Payment amount must be greater than 0",
    });
  });

  it("returns partial-payment details including the remaining balance", () => {
    expect(validatePayment(60, 100)).toEqual({
      valid: true,
      message: "Partial payment recorded. Remaining balance: ₱40.00",
      isPartial: true,
      remainingBalance: 40,
    });
  });

  it("treats overpayments as valid and reports the extra amount", () => {
    expect(validatePayment(125.555, 100)).toEqual({
      valid: true,
      message:
        "Payment exceeds due amount (₱100.00). Extra ₱25.56 will be applied to next period.",
      isPartial: false,
    });
  });

  it("allocates payment to interest first and then principal", () => {
    expect(allocatePayment(80, 100)).toEqual({
      interestPortion: 80,
      principalPortion: 0,
    });
    expect(allocatePayment(150.555, 100.111)).toEqual({
      interestPortion: 100.11,
      principalPortion: 50.45,
    });
  });
});
