import { LoanRepository } from "../LoanRepository";
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

type QueryResult = { data?: unknown; error: unknown };

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

describe("LoanRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue("user-123");
  });

  it("adds user_id when creating a loan", async () => {
    const chain = createSelectSingleChain({
      data: { id: "loan-1" },
      error: null,
    });
    const insert = vi.fn(() => chain);

    vi.mocked(supabase.from).mockReturnValue({
      insert,
    } as never);

    const payload = {
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
      penalty_rate: 5,
    };

    const result = await LoanRepository.create(payload as never);

    expect(supabase.from).toHaveBeenCalledWith("loans");
    expect(insert).toHaveBeenCalledWith({ ...payload, user_id: "user-123" });
    expect(result).toEqual({ id: "loan-1" });
  });

  it("filters borrower loan lookups by borrower id and user id", async () => {
    const chain = createSelectOrderChain({
      data: [{ id: "loan-2" }],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    const result = await LoanRepository.getByBorrowerId("borrower-2");

    expect(chain.eq).toHaveBeenNthCalledWith(1, "borrower_id", "borrower-2");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual([{ id: "loan-2" }]);
  });

  it("loads a single loan by id within the current user scope", async () => {
    const chain = createSelectSingleChain({
      data: { id: "loan-3" },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    const result = await LoanRepository.getById("loan-3");

    expect(chain.eq).toHaveBeenNthCalledWith(1, "id", "loan-3");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
    expect(result).toEqual({ id: "loan-3" });
  });

  it("updates loan status within the current user scope", async () => {
    const chain = createSelectSingleChain({
      data: { id: "loan-4", status: "closed" },
      error: null,
    });
    const update = vi.fn(() => chain);

    vi.mocked(supabase.from).mockReturnValue({
      update,
    } as never);

    const result = await LoanRepository.updateStatus("loan-4", "closed");

    expect(update).toHaveBeenCalledWith({ status: "closed" });
    expect(chain.eq).toHaveBeenNthCalledWith(1, "id", "loan-4");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
    expect(result).toEqual({ id: "loan-4", status: "closed" });
  });
});
