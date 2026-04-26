import { UserProfileRepository } from "../UserProfileRepository";
import { supabase } from "../../services/supabase";

vi.mock("../../services/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));


describe("UserProfileRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a profile by user id using maybeSingle", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { user_id: "user-1" },
      error: null,
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));

    vi.mocked(supabase.from).mockReturnValue({
      select,
    } as never);

    const result = await UserProfileRepository.getByUserId("user-1");

    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(result).toEqual({ user_id: "user-1" });
  });

  it("trims names before upserting a profile", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { user_id: "user-2" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const upsert = vi.fn(() => ({ select }));

    vi.mocked(supabase.from).mockReturnValue({
      upsert,
    } as never);

    const result = await UserProfileRepository.upsertByUserId("user-2", {
      legal_full_name: "  Jane Citizen  ",
      display_name: "  Jane  ",
      initial_capital: 1000,
      initial_profit: 200,
    });

    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-2",
        legal_full_name: "Jane Citizen",
        display_name: "Jane",
        initial_capital: 1000,
        initial_profit: 200,
      },
      { onConflict: "user_id" },
    );
    expect(result).toEqual({ user_id: "user-2" });
  });
});
