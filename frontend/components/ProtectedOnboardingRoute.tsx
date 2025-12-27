import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type ProtectedOnboardingRouteProps = {
  children: React.ReactNode;
};

export const ProtectedOnboardingRoute: React.FC<ProtectedOnboardingRouteProps> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-gray-700">Loading…</div>
      </div>
    );
  }

  // If no user, kick them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has already completed onboarding, redirect them
  if (user.onboardingComplete) {
    const redirectPath = user.role === "admin" ? "/dashboard" : "/portal";
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise, allow them to access onboarding
  return <>{children}</>;
};
