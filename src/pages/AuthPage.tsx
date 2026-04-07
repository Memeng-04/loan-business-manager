import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import logoWhite from "../assets/icons/192x192/lend-white.png";
import Button from "../components/Button";
import PageShell from "../components/PageShell";
import { useAuth } from "../hooks/useAuth";
import styles from "./styles/AuthPage.module.css";

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
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <PageShell>
      <div className={styles.layout}>
        <div className={styles.hero}>
          <img src={logoWhite} alt="LEND logo" className={styles.logo} />
          <p className={styles.tagline}>
            Lending Efficiency through Networked Data
          </p>
          <h1 className={styles.heading}>
            Because your business deserves better than a notebook.
          </h1>
        </div>

        <div className={styles.panel}>
          <div className={styles.authTabs}>
            <Button
              type="button"
              onClick={() => setMode("login")}
              variant={mode === "login" ? "white" : "outline"}
              size="md"
              className={styles.halfButton}
            >
              Log in
            </Button>
            <Button
              type="button"
              onClick={() => setMode("signup")}
              variant={mode === "signup" ? "white" : "outline"}
              size="md"
              className={styles.halfButton}
            >
              Sign up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className={styles.input}
                placeholder="you@example.com"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                className={styles.input}
                placeholder="••••••••"
              />
            </label>

            {errorMessage ? (
              <p className={styles.message}>{errorMessage}</p>
            ) : null}

            {successMessage ? (
              <p className={styles.message}>{successMessage}</p>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="white"
              size="lg"
              className={styles.submitButton}
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
