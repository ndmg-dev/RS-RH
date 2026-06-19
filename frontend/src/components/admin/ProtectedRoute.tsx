import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStorage } from "../../lib/auth-storage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const user = authStorage.getUser();
  const token = authStorage.getToken();

  if (!user || !token) {
    // Save the current location to redirect back after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
