import {
  getAccessToken,
  getCurrentSession,
  getCurrentUserId,
  signInWithEmailPassword,
  signOut,
  signUpWithEmailPassword,
} from "../auth";
import { supabase } from "../supabase";

vi.mock("../supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
  },
}));

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user and session from sign in", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: { id: "user-1" }, session: { access_token: "token" } },
      error: null,
    } as never);

    const result = await signInWithEmailPassword("a@test.com", "secret");

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "a@test.com",
      password: "secret",
    });
    expect(result).toEqual({
      user: { id: "user-1" },
      session: { access_token: "token" },
      error: null,
    });
  });

  it("returns user and session from sign up", async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: "user-2" }, session: null },
      error: null,
    } as never);

    const result = await signUpWithEmailPassword("b@test.com", "secret");

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "b@test.com",
      password: "secret",
    });
    expect(result).toEqual({
      user: { id: "user-2" },
      session: null,
      error: null,
    });
  });

  it("returns the session from getCurrentSession", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "token-2" } },
      error: null,
    } as never);

    const result = await getCurrentSession();

    expect(result).toEqual({
      session: { access_token: "token-2" },
      error: null,
    });
  });

  it("returns signOut errors transparently", async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: { message: "signout failed" },
    } as never);

    const result = await signOut();

    expect(result).toEqual({
      error: { message: "signout failed" },
    });
  });

  it("returns the access token when the session is authenticated", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "fresh-token" } },
      error: null,
    } as never);

    await expect(getAccessToken()).resolves.toBe("fresh-token");
  });

  it("throws when access token is missing", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    await expect(getAccessToken()).rejects.toThrow(
      "Not authenticated — please log in first",
    );
  });

  it("returns the authenticated user id", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "user-3" } },
      error: null,
    } as never);

    await expect(getCurrentUserId()).resolves.toBe("user-3");
  });

  it("throws when there is no authenticated user", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    } as never);

    await expect(getCurrentUserId()).rejects.toThrow("Not authenticated");
  });
});
