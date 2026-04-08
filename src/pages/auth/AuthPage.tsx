import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import logoWhite from "../../assets/icons/192x192/lend-white.png";
import type { AuthMode } from "../../components/auth/AuthCard";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AuthPage.module.css";

export default function AuthPage() {
  const navigate = useNavigate();
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

    if (mode === "signup") {
      const { error, hasSession } = await signUp(email, password);

      if (error) {
        setErrorMessage(error);
        setIsSubmitting(false);
        return;
      }

      if (hasSession) {
        navigate("/onboarding/profile", { replace: true });
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Account created. Check your email to verify first.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMessage(error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
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

          <AuthCard
            mode={mode}
            email={email}
            password={password}
            errorMessage={errorMessage}
            successMessage={successMessage}
            isSubmitting={isSubmitting}
            onModeChange={setMode}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </main>
  );
}
