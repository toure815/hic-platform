import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Still loading → show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Not logged in → redirect to login and preserve current location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. User logged in but role not allowed → redirect accordingly
  if (!allowedRoles.includes(user.role)) {
    const redirectPath = user.role === "client" ? "/portal" : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // 4. Authorized → render children
  return <>{children}</>;
}
