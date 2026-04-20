import Button from "../Button";
import styles from "../auth/AuthCard.module.css";
import { useState } from "react";
import type { SubmitEvent } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void | Promise<void>;
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
  const [showPassword, setShowPassword] = useState(false); // Local state for toggle

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.authTabs}>
        <Button
          type="button"
          onClick={() => onModeChange("login")}
          variant={mode === "login" ? "white" : "outlineWhiteText"}
          size="md"
          className={styles.halfButton}
        >
          Log in
        </Button>
        <Button
          type="button"
          onClick={() => onModeChange("signup")}
          variant={mode === "signup" ? "white" : "outlineWhiteText"}
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
          <div className={styles.passwordContainer}>
            {" "}
            <input
              type={showPassword ? "text" : "password"} // Dynamic type
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
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={styles.toggleButton}
              aria-label="Toggle password visibility"
              tabIndex={0}
              style={{ color: showPassword ? "#aaa" : "#fff" }}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </label>

        {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}

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
  );
}
