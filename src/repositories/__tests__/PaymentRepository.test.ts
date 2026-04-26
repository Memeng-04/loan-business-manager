import { PaymentRepository } from "../PaymentRepository";
import { getCurrentUserId } from "../../services/auth";
import { supabase } from "../../services/supabase";

vi.mock("../../services/auth", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("../../services/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

type QueryResult = { data: unknown; error: unknown };

const createSelectSingleChain = (result: QueryResult) => {
  const chain: Record<string, any> = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn().mockResolvedValue(result),
  };
  return chain;
};

const createSelectOrderChain = (result: QueryResult) => {
  const chain: Record<string, any> = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn().mockResolvedValue(result),
  };
  return chain;
};

const createSummaryChain = (result: QueryResult) => {
  const chain: Record<string, any> = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    not: vi.fn().mockResolvedValue(result),
  };
  return chain;
};

describe("PaymentRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue("user-123");
  });

  it("includes the current user id when creating a payment", async () => {
    const chain = createSelectSingleChain({
      data: { id: "payment-1" },
      error: null,
    });

    const insert = vi.fn(() => chain);
    vi.mocked(supabase.from).mockReturnValue({
      insert,
    } as never);

    const result = await PaymentRepository.create({
      loan_id: "loan-1",
      amount_paid: 250,
      payment_date: "2026-04-27",
      schedule_id: "schedule-1",
    });

    expect(supabase.from).toHaveBeenCalledWith("payments");
    expect(insert).toHaveBeenCalledWith([
      {
        loan_id: "loan-1",
        amount_paid: 250,
        payment_date: "2026-04-27",
        schedule_id: "schedule-1",
        user_id: "user-123",
      },
    ]);
    expect(result).toEqual({ id: "payment-1" });
  });

  it("returns null for not-found payment lookups", async () => {
    const chain = createSelectSingleChain({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    const result = await PaymentRepository.getByDate("loan-2", "2026-04-27");

    expect(chain.eq).toHaveBeenNthCalledWith(1, "loan_id", "loan-2");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "payment_date", "2026-04-27");
    expect(chain.eq).toHaveBeenNthCalledWith(3, "user_id", "user-123");
    expect(result).toBeNull();
  });

  it("aggregates payment summary totals and latest payment date", async () => {
    const chain = createSummaryChain({
      data: [
        { amount_paid: 50, payment_date: "2026-04-20" },
        { amount_paid: 125.5, payment_date: "2026-04-27" },
        { amount_paid: 0, payment_date: "2026-04-10" },
      ],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    const result = await PaymentRepository.getSummary("loan-3");

    expect(chain.eq).toHaveBeenNthCalledWith(1, "loan_id", "loan-3");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
    expect(chain.not).toHaveBeenCalledWith("amount_paid", "is", null);
    expect(result).toEqual({
      totalPaid: 175.5,
      count: 3,
      latestPaymentDate: "2026-04-27",
    });
  });

  it("throws a wrapped error when fetching payments fails", async () => {
    const chain = createSelectOrderChain({
      data: null,
      error: { message: "db offline" },
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    await expect(PaymentRepository.getByLoanId("loan-4")).rejects.toThrow(
      "Failed to fetch payments: db offline",
    );
    expect(chain.eq).toHaveBeenNthCalledWith(1, "loan_id", "loan-4");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
  });
});
