import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/card/Card";
import FeedbackMessage from "../../components/ui/feedback/FeedbackMessage";
import Header from "../../components/ui/header/Header";
import Navbar from "../../components/ui/navigation/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import { UserProfileRepository } from "../../repositories/UserProfileRepository";
import styles from "./MorePage.module.css";

const TERMS_TEXT = `1. NO LEGAL OR FINANCIAL ADVICE
────────────────────────────────
LEND is a record-keeping tool only. It does not provide legal, tax, or financial advice. The user is solely responsible for complying with Philippine lending laws (e.g., SEC regulations, usury laws, data privacy).

2. DATA ACCURACY
────────────────────────────────
The user is responsible for entering accurate borrower information, loan amounts, interest rates, and payment records. LEND is a tool to assist, not a guarantee of collection.

3. DATA OWNERSHIP & PRIVACY
────────────────────────────────
All borrower data belongs to the user. The developer (Bidaure, Umadhay, Mendoza) does not collect, store, or sell any data. Data is stored locally on the user's device and/or his chosen cloud sync service.

4. OFFLINE & SYNC DISCLAIMER
────────────────────────────────
While LEND works offline, the user should regularly connect to the internet to back up data. The developer is not liable for data loss due to device damage, loss, or failed sync.

5. NO WARRANTY
────────────────────────────────
LEND is provided "as is" without warranties of merchantability or fitness for a particular purpose. The developer is not liable for any financial losses, missed collections, or calculation errors arising from use.

6. LIMITATION OF LIABILITY
────────────────────────────────
To the maximum extent permitted by law, the developer shall not be liable for any indirect, incidental, or consequential damages.

7. GOVERNING LAW
────────────────────────────────
These terms shall be governed by the laws of the Republic of the Philippines.

8. ACKNOWLEDGMENT
────────────────────────────────
By using LEND, the user confirms they have read, understood, and agreed to these terms.`;

export default function MorePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    profile,
    setProfile,
    isLoading: isProfileLoading,
  } = useCurrentUserProfile();

  const [displayName, setDisplayName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setLegalName(profile.legal_full_name);
    }
  }, [profile]);

  async function handleSaveProfile() {
    if (!user || !profile) return;

    setIsSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const updated = await UserProfileRepository.upsertByUserId(user.id, {
        display_name: displayName.trim(),
        legal_full_name: legalName.trim(),
        initial_capital: profile.initial_capital,
        initial_profit: profile.initial_profit,
      });

      setProfile(updated);
      setIsEditing(false);
      setProfileSuccess("Profile updated successfully!");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelEdit() {
    setDisplayName(profile?.display_name ?? "");
    setLegalName(profile?.legal_full_name ?? "");
    setIsEditing(false);
    setProfileError(null);
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    const { error } = await signOut();

    setIsLoggingOut(false);

    if (error) {
      setLogoutError(error);
      return;
    }

    navigate("/auth", { replace: true });
  };

  if (isProfileLoading) {
    return null;
  }

  return (
    <main className={styles.page}>
      <Header title="More" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>

          {profileError && <FeedbackMessage message={profileError} />}
          {profileSuccess && <FeedbackMessage message={profileSuccess} />}

          <Card className={styles.profileCard} variant="default" padding="lg">
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <p className={styles.readOnlyValue}>{user?.email}</p>
              <p className={styles.hint}>Email cannot be changed</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Legal Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className={styles.input}
                  required
                />
              ) : (
                <p className={styles.value}>{legalName}</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Display Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={styles.input}
                  required
                />
              ) : (
                <p className={styles.value}>{displayName}</p>
              )}
            </div>

            <div className={styles.actions}>
              {!isEditing ? (
                <Button
                  type="button"
                  variant="blue"
                  size="md"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Names
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="blue"
                    size="md"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Terms & Conditions</h2>
          <Card className={styles.termsCard} variant="default" padding="lg">
            <p className={styles.termsHeading}>LEND Terms & Conditions</p>
            <pre className={styles.termsText}>{TERMS_TEXT}</pre>
          </Card>
        </div>

        <div className={styles.section}>
          {logoutError ? <FeedbackMessage message={logoutError} /> : null}

          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={styles.logoutButton}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </section>
    </main>
  );
}
