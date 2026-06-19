import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/admin/ProtectedRoute";
import { RoleGuard } from "../components/admin/RoleGuard";
import { AppShell } from "../components/layout/AppShell";

// Pages
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { FeedPage } from "../pages/FeedPage";
import { ProfilePage } from "../pages/ProfilePage";
import { EditProfilePage } from "../pages/EditProfilePage";
import { PostDetailPage } from "../pages/PostDetailPage";
import { AdminModerationPage } from "../pages/AdminModerationPage";
import { NotFoundPage } from "../pages/NotFoundPage";

import { authStorage } from "../lib/auth-storage";

// Helper components for routing logic
const HomeRedirect: React.FC = () => {
  const token = authStorage.getToken();
  const user = authStorage.getUser();
  if (token && user) {
    return <Navigate to="/feed" replace />;
  }
  return <Navigate to="/login" replace />;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = authStorage.getToken();
  const user = authStorage.getUser();
  if (token && user) {
    return <Navigate to="/feed" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Routes inside AppShell */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <AppShell>
                <FeedPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/me"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/me/edit"
          element={
            <ProtectedRoute>
              <AppShell>
                <EditProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts/:postId"
          element={
            <ProtectedRoute>
              <AppShell>
                <PostDetailPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["ADMIN", "MODERATOR"]}>
                <AppShell>
                  <AdminModerationPage />
                </AppShell>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Home Redirect */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Fallback Not Found */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <AppShell>
                <NotFoundPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
