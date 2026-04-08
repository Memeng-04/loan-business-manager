import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import FeedbackMessage from "../../components/feedback/FeedbackMessage";
import { useAuth } from "../../hooks/useAuth";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import { UserProfileRepository } from "../../repositories/UserProfileRepository";
import styles from "./OnboardingPage.module.css";

const STORAGE_KEY = "onboarding_profile_step";

type ProfileStepData = {
  legal_full_name: string;
  display_name: string;
};

function parseMoney(value: string): number {
  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CapitalOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, setProfile, isLoading } = useCurrentUserProfile();
  const [capital, setCapital] = useState("");
  const [profit, setProfit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileData = useMemo<ProfileStepData | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as ProfileStepData;
      if (!parsed.legal_full_name || !parsed.display_name) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }, []);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!profileData) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentUser = user;
    const currentProfileData = profileData;

    if (!currentUser || !currentProfileData) {
      setError("Please complete step 1 first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const saved = await UserProfileRepository.upsertByUserId(currentUser.id, {
        legal_full_name: currentProfileData.legal_full_name,
        display_name: currentProfileData.display_name,
        initial_capital: parseMoney(capital),
        initial_profit: parseMoney(profit),
      });

      setProfile(saved);
      sessionStorage.removeItem(STORAGE_KEY);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save onboarding details right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const projectedBaseFund = parseMoney(capital) + parseMoney(profit);

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.progress}>Step 2 of 2</p>
        <h1 className={styles.heading}>Set your starting funds.</h1>
        <p className={styles.subheading}>
          Tell us how much capital you have lent out so far and your total
          profit earned so far.
        </p>

        <p className={styles.note}>
          Outstanding balance will be calculated automatically as you add loans.
          You can edit these numbers later.
        </p>

        {error ? <FeedbackMessage message={error} /> : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Capital Lent Out So Far</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="0.01"
              value={capital}
              onChange={(event) => setCapital(event.target.value)}
              placeholder="0.00"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Total Profit Earned So Far</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="0.01"
              value={profit}
              onChange={(event) => setProfit(event.target.value)}
              placeholder="0.00"
              required
            />
          </label>

          <div className={styles.previewBox}>
            <span className={styles.previewLabel}>Starting Fund Snapshot</span>
            <strong className={styles.previewValue}>
              {formatCurrency(projectedBaseFund)}
            </strong>
          </div>

          <div className={styles.actions}>
            <Button
              className={styles.actionButton}
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate("/onboarding/profile")}
            >
              Back
            </Button>
            <Button
              className={styles.actionButton}
              type="submit"
              variant="blue"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Get Started"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
