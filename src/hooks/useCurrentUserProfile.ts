import { useProfile } from "../contexts/ProfileContext";

export function useCurrentUserProfile() {
  return useProfile();
}
