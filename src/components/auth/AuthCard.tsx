import type { FormEvent } from "react";
import logoWhite from "../../assets/icons/192x192/lend-white.png";
import Button from "../Button";
import styles from "./AuthCard.module.css";

export type AuthMode = "login" | "signup";

type AuthCardProps = {
  mode: AuthMode;
  email: string;
  password: string;
  errorMessage: string | null;
  successMessage: string | null;
  isSubmitting: boolean;
  onModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export default function AuthCard({
  mode,
  email,
  password,
  errorMessage,
  successMessage,
  isSubmitting,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthCardProps) {
  return (
    <main className="min-h-svh bg-main-blue text-white">
      <section className="mx-auto flex min-h-svh w-full max-w-7xl flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
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
                onClick={() => onModeChange("login")}
                variant={mode === "login" ? "white" : "outline"}
                size="md"
                className={styles.halfButton}
              >
                Log in
              </Button>
              <Button
                type="button"
                onClick={() => onModeChange("signup")}
                variant={mode === "signup" ? "white" : "outline"}
                size="md"
                className={styles.halfButton}
              >
                Sign up
              </Button>
            </div>

            <form onSubmit={onSubmit} className={styles.form}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
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
                  onChange={(event) => onPasswordChange(event.target.value)}
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
      </section>
    </main>
  );
}
