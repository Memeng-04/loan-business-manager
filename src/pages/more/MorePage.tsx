import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/card/Card";
import FeedbackMessage from "../../components/ui/feedback/FeedbackMessage";


import { useAuth } from "../../hooks/useAuth";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import { UserProfileRepository } from "../../repositories/UserProfileRepository";

import LoadingState from "../../components/ui/LoadingState";

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
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F9F9F8] overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 w-full h-full flex items-center justify-center">
          <LoadingState message="Loading profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F8] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 w-full">
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>

          {profileError && <FeedbackMessage message={profileError} />}
          {profileSuccess && <FeedbackMessage message={profileSuccess} />}

          <Card className="flex flex-col gap-6" variant="default" padding="lg">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Email</label>
              <p className="text-base text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Legal Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-base px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#012a6a] transition-all"
                  required
                />
              ) : (
                <p className="text-base text-gray-900 bg-white px-4 py-2.5 rounded-xl border border-gray-200">{legalName}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">Display Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-base px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#012a6a] transition-all"
                  required
                />
              ) : (
                <p className="text-base text-gray-900 bg-white px-4 py-2.5 rounded-xl border border-gray-200">{displayName}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-gray-100">
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

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Terms & Conditions</h2>
          <Card className="flex flex-col gap-4" variant="default" padding="lg">
            <p className="font-bold text-gray-900 text-lg">LEND Terms & Conditions</p>
            <pre className="text-xs text-gray-600 bg-gray-50 p-6 rounded-xl border border-gray-100 whitespace-pre-wrap font-mono leading-relaxed h-64 overflow-y-auto">{TERMS_TEXT}</pre>
          </Card>
        </div>

        <div className="mt-12 flex flex-col items-center">
          {logoutError ? <FeedbackMessage message={logoutError} /> : null}

          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
