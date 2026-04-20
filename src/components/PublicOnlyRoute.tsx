import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "./LoadingState";
import { useAuth } from "../hooks/useAuth";

export default function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState variant="blueBackground" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
