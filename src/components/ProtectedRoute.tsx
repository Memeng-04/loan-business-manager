import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "./LoadingState";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
