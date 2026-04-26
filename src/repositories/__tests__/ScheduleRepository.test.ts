import { ScheduleRepository } from "../ScheduleRepository";
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

const createEqOrderChain = (result: QueryResult) => {
  const chain: Record<string, any> = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn().mockResolvedValue(result),
  };
  return chain;
};

const createDeleteChain = (result: QueryResult) => {
  const chain: Record<string, any> = {
    delete: vi.fn(() => chain),
    eq: vi.fn()
      .mockImplementationOnce(() => chain)
      .mockResolvedValueOnce(result),
  };
  return chain;
};

const createUpdateChain = (result: QueryResult) => {
  const chain: Record<string, any> = {
    update: vi.fn(() => chain),
    eq: vi.fn()
      .mockImplementationOnce(() => chain)
      .mockResolvedValueOnce(result),
  };
  return chain;
};

const createInsertSelectChain = (result: QueryResult) => {
  const chain: Record<string, any> = {
    select: vi.fn().mockResolvedValue(result),
  };
  return chain;
};

const createDashboardChain = (result: QueryResult) => {
  const chain: Record<string, any> = {
    select: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn().mockResolvedValue(result),
  };
  return chain;
};

describe("ScheduleRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue("user-123");
  });

  it("filters schedules by loan id and current user", async () => {
    const chain = createEqOrderChain({
      data: [{ id: "schedule-1" }],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    const result = await ScheduleRepository.getByLoanId("loan-1");

    expect(chain.eq).toHaveBeenNthCalledWith(1, "loan_id", "loan-1");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
    expect(chain.order).toHaveBeenCalledWith("due_date", { ascending: true });
    expect(result).toEqual([{ id: "schedule-1" }]);
  });

  it("adds user_id to every schedule before insert", async () => {
    const selectChain = createInsertSelectChain({
      data: [{ id: "schedule-2" }],
      error: null,
    });
    const insert = vi.fn(() => selectChain);

    vi.mocked(supabase.from).mockReturnValue({
      insert,
    } as never);

    const result = await ScheduleRepository.saveSchedule([
      {
        loan_id: "loan-2",
        due_date: "2026-05-01",
        amount_due: 100,
        status: "unpaid",
      },
      {
        loan_id: "loan-2",
        due_date: "2026-05-08",
        amount_due: 120,
        status: "unpaid",
      },
    ]);

    expect(insert).toHaveBeenCalledWith([
      {
        loan_id: "loan-2",
        due_date: "2026-05-01",
        amount_due: 100,
        status: "unpaid",
        user_id: "user-123",
      },
      {
        loan_id: "loan-2",
        due_date: "2026-05-08",
        amount_due: 120,
        status: "unpaid",
        user_id: "user-123",
      },
    ]);
    expect(result).toEqual([{ id: "schedule-2" }]);
  });

  it("scopes schedule updates to the current user", async () => {
    const chain = createUpdateChain({
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await ScheduleRepository.updateSchedule("schedule-3", {
      status: "paid",
    });

    expect(chain.update).toHaveBeenCalledWith({ status: "paid" });
    expect(chain.eq).toHaveBeenNthCalledWith(1, "id", "schedule-3");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
  });

  it("scopes deletion by loan id to the current user", async () => {
    const chain = createDeleteChain({
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await ScheduleRepository.deleteByLoanId("loan-4");

    expect(chain.eq).toHaveBeenNthCalledWith(1, "loan_id", "loan-4");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
  });

  it("filters dashboard schedules by date range and user id", async () => {
    const chain = createDashboardChain({
      data: [{ id: "schedule-5" }],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    const result = await ScheduleRepository.getDashboardSchedules(
      "2026-04-01",
      "2026-04-30",
    );

    expect(chain.gte).toHaveBeenCalledWith("due_date", "2026-04-01");
    expect(chain.lte).toHaveBeenCalledWith("due_date", "2026-04-30");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-123");
    expect(chain.order).toHaveBeenCalledWith("due_date", { ascending: true });
    expect(result).toEqual([{ id: "schedule-5" }]);
  });
});
