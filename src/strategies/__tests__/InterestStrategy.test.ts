import {
  calculateInterest,
  calculateFromPercentage,
  calculatePaymentAmount,
  calculateEndDate,
} from "../InterestStrategy";
import type { PaymentFrequency } from "../../types/loans";

describe("InterestStrategy", () => {
  it("calculates interest amount and interest rate from principal and total payable", () => {
    expect(calculateInterest(1000, 1250)).toEqual({
      interest: 250,
      interestRate: 25,
    });
  });

  it("calculates interest and total payable from percentage", () => {
    expect(calculateFromPercentage(2000, 15)).toEqual({
      interest: 300,
      totalPayable: 2300,
    });
  });

  it("calculates payment amount for each supported frequency", () => {
    expect(calculatePaymentAmount(300, "daily", 10)).toBe(30);
    expect(calculatePaymentAmount(300, "weekly", 14)).toBe(150);
    expect(calculatePaymentAmount(300, "bi-monthly", 30)).toBe(150);
    expect(calculatePaymentAmount(300, "monthly", 30)).toBe(300);
  });

  it("falls back to total payable when frequency is unknown", () => {
    const invalidFrequency = "unsupported" as unknown as PaymentFrequency;
    expect(calculatePaymentAmount(300, invalidFrequency, 30)).toBe(300);
  });

  it("calculates end date by adding term days", () => {
    expect(calculateEndDate("2026-04-01", 10)).toBe("2026-04-11");
  });
});
