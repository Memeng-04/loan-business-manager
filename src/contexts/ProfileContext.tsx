import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { UserProfileRepository } from "../repositories/UserProfileRepository";
import type { UserProfile } from "../types/userProfile";

type ProfileContextValue = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (forceLoading = false) => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    if (forceLoading || !profile) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await UserProfileRepository.getByUserId(user.id);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      loadProfile();
    }
  }, [isAuthLoading, user?.id]);

  const value = useMemo(() => ({
    profile,
    setProfile,
    isLoading: isAuthLoading || isLoading,
    error,
    refreshProfile: () => loadProfile(true)
  }), [profile, isAuthLoading, isLoading, error, user?.id]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
