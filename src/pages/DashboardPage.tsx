import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoggingOut(true);
    setErrorMessage(null);

    const { error } = await signOut();

    if (error) {
      setErrorMessage(error);
      setIsLoggingOut(false);
      return;
    }

    navigate("/auth", { replace: true });
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white/10 p-6 sm:p-8">
        <p className="text-sm text-blue-100">Authenticated session</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-4 break-all text-sm sm:text-base">
          Signed in as: <span className="font-semibold">{user?.email}</span>
        </p>

        {errorMessage ? (
          <p className="mt-4 rounded-xl bg-white/15 px-3 py-2 text-sm">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-8 rounded-full bg-white px-6 py-3 text-base font-semibold text-main-blue transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </PageShell>
  );
}
