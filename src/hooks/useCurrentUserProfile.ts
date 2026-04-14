import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { UserProfileRepository } from "../repositories/UserProfileRepository";
import type { UserProfile } from "../types/userProfile";

export function useCurrentUserProfile() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (isAuthLoading) {
        return;
      }

      if (!user) {
        if (isMounted) {
          setProfile(null);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await UserProfileRepository.getByUserId(user.id);

        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load your profile.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, user]);

  return { profile, setProfile, isLoading: isAuthLoading || isLoading, error };
}
