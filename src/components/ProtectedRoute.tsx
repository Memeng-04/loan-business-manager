import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingState from "./ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUserProfile } from "../hooks/useCurrentUserProfile";

export default function ProtectedRoute() {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useCurrentUserProfile();

  if (isLoading || isProfileLoading) {
    return <LoadingState fullScreen variant="blueBackground" message="PLEASE WAIT..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileError) {
    return (
      <LoadingState
        variant="error"
        message={profileError}
        actionLabel="Reload"
        onAction={() => window.location.reload()}
      />
    );
  }

  const isOnboardingPath = location.pathname.startsWith("/onboarding");

  if (!profile && !isOnboardingPath) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  if (profile && isOnboardingPath) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
