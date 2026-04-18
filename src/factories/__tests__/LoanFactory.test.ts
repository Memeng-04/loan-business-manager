import { LoanFactory } from "../LoanFactory";
import type {
  CreateLoanInput,
  CreatePercentageLoanInput,
} from "../../types/loans";

describe("LoanFactory", () => {
  it("creates a loan from total payable and derives interest fields", () => {
    const input: CreateLoanInput = {
      borrower_id: "borrower-1",
      principal: 1000,
      total_payable: 1200,
      frequency: "weekly",
      term_days: 14,
      start_date: "2026-04-01",
    };

    const loan = LoanFactory.create(input);

    expect(loan).toEqual({
      borrower_id: "borrower-1",
      principal: 1000,
      total_payable: 1200,
      interest: 200,
      interest_rate: 20,
      frequency: "weekly",
      payment_amount: 600,
      start_date: "2026-04-01",
      end_date: "2026-04-15",
      status: "active",
    });
  });

  it("creates a loan from percentage and derives total payable", () => {
    const input: CreatePercentageLoanInput = {
      borrower_id: "borrower-2",
      principal: 1000,
      interest_rate: 10,
      frequency: "bi-monthly",
      term_days: 30,
      start_date: "2026-04-01",
    };

    const loan = LoanFactory.createFromPercentage(input);

    expect(loan).toEqual({
      borrower_id: "borrower-2",
      principal: 1000,
      total_payable: 1100,
      interest: 100,
      interest_rate: 10,
      frequency: "bi-monthly",
      payment_amount: 550,
      start_date: "2026-04-01",
      end_date: "2026-05-01",
      status: "active",
    });
  });
});
