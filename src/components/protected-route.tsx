import { Navigate } from "react-router";
import { use } from "react";
import SessionContext from "../contexts/session-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, isLoading } = use(SessionContext);

  if (!currentUser && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
