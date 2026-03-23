import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import logoWhite from "../assets/icons/192x192/lend-white.png";
import Button from "../components/Button";
import PageShell from "../components/PageShell";
import { useAuth } from "../hooks/useAuth";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const authAction = mode === "login" ? signIn : signUp;
    const { error } = await authAction(email, password);

    if (error) {
      setErrorMessage(error);
      setIsSubmitting(false);
      return;
    }

    if (mode === "signup") {
      setMode("login");
      setPassword("");
      setSuccessMessage("Account created. You can log in now.");
    }

    setIsSubmitting(false);
  }

  return (
    <PageShell>
      <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2 md:items-center">
        <div className="text-center md:text-left">
          <img
            src={logoWhite}
            alt="LEND logo"
            className="mx-auto h-24 w-auto md:mx-0 md:h-28"
          />
          <p className="mt-4 text-sm text-blue-100 sm:text-base">
            Lending Efficiency through Networked Data
          </p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
            Because your business deserves better than a notebook.
          </h1>
        </div>

        <div className="rounded-3xl bg-white/10 p-7 pt-0.5 backdrop-blur-sm sm:p-7 sm:pt-0.5">
          <div className="mb-6 flex gap-2 -mt-3">
            <Button
              type="button"
              onClick={() => setMode("login")}
              variant={mode === "login" ? "white" : "outline"}
              size="md"
              className="w-1/2"
            >
              Log in
            </Button>
            <Button
              type="button"
              onClick={() => setMode("signup")}
              variant={mode === "signup" ? "white" : "outline"}
              size="md"
              className="w-1/2"
            >
              Sign up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-blue-100">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-blue-100">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                placeholder="••••••••"
              />
            </label>

            {errorMessage ? (
              <p className="rounded-xl bg-white/15 px-3 py-2 text-sm">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-xl bg-white/15 px-3 py-2 text-sm">
                {successMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="white"
              size="lg"
              className="w-full"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
