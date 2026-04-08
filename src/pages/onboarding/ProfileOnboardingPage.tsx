import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import FeedbackMessage from "../../components/feedback/FeedbackMessage";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import styles from "./OnboardingPage.module.css";

const STORAGE_KEY = "onboarding_profile_step";

export default function ProfileOnboardingPage() {
  const navigate = useNavigate();
  const { profile, isLoading, error } = useCurrentUserProfile();
  const [legalFullName, setLegalFullName] = useState("");
  const [displayName, setDisplayName] = useState("");

  if (isLoading) {
    return null;
  }

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        legal_full_name: legalFullName.trim(),
        display_name: displayName.trim(),
      }),
    );

    navigate("/onboarding/capital");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.progress}>Step 1 of 2</p>
        <h1 className={styles.heading}>Tell us your name details.</h1>
        <p className={styles.subheading}>
          We need your government full name for legality and records, then your
          display name for greetings inside the app.
        </p>

        {error ? <FeedbackMessage message={error} /> : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Government Full Name</span>
            <input
              className={styles.input}
              value={legalFullName}
              onChange={(event) => setLegalFullName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Display Name</span>
            <input
              className={styles.input}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
            />
          </label>

          <div className={styles.actions}>
            <Button
              className={styles.actionButton}
              type="submit"
              variant="blue"
              size="md"
            >
              Continue
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
