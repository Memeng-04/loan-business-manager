import { BorrowerRepository } from "../BorrowerRepository";
import { BorrowerFactory } from "../../factories/BorrowerFactory";
import { getCurrentUserId } from "../../services/auth";
import { supabase } from "../../services/supabase";

vi.mock("../../factories/BorrowerFactory", () => ({
  BorrowerFactory: {
    create: vi.fn(),
  },
}));

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

describe("BorrowerRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue("user-123");
  });

  it("filters borrower list queries by current user", async () => {
    const chain = createSelectOrderChain({
      data: [{ id: "borrower-1" }],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    const result = await BorrowerRepository.getAll();

    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-123");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual([{ id: "borrower-1" }]);
  });

  it("returns null when a borrower does not exist for this user", async () => {
    const chain = createSelectSingleChain({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => chain),
    } as never);

    const result = await BorrowerRepository.getById("borrower-2");

    expect(chain.eq).toHaveBeenNthCalledWith(1, "id", "borrower-2");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
    expect(result).toBeNull();
  });

  it("creates a borrower from the normalized factory payload", async () => {
    vi.mocked(BorrowerFactory.create).mockReturnValue({
      full_name: "Jane Doe",
      phone: null,
    } as never);

    const chain = createSelectSingleChain({
      data: { id: "borrower-3" },
      error: null,
    });
    const insert = vi.fn(() => chain);

    vi.mocked(supabase.from).mockReturnValue({
      insert,
    } as never);

    const input = { full_name: " Jane Doe ", phone: " " };
    const result = await BorrowerRepository.create(input as never);

    expect(BorrowerFactory.create).toHaveBeenCalledWith(input);
    expect(insert).toHaveBeenCalledWith({
      full_name: "Jane Doe",
      phone: null,
      user_id: "user-123",
    });
    expect(result).toEqual({ id: "borrower-3" });
  });

  it("updates a borrower from the normalized factory payload", async () => {
    vi.mocked(BorrowerFactory.create).mockReturnValue({
      full_name: "John Smith",
      phone: "08012345678",
    } as never);

    const chain = createSelectSingleChain({
      data: { id: "borrower-4" },
      error: null,
    });
    const update = vi.fn(() => chain);

    vi.mocked(supabase.from).mockReturnValue({
      update,
    } as never);

    const input = { full_name: " John Smith ", phone: "08012345678" };
    const result = await BorrowerRepository.update("borrower-4", input as never);

    expect(BorrowerFactory.create).toHaveBeenCalledWith(input);
    expect(update).toHaveBeenCalledWith({
      full_name: "John Smith",
      phone: "08012345678",
    });
    expect(chain.eq).toHaveBeenNthCalledWith(1, "id", "borrower-4");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-123");
    expect(result).toEqual({ id: "borrower-4" });
  });
});
