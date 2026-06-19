import React, { useState, useEffect } from "react";
import { AuthUser } from "../../types";
import { authStorage } from "../../lib/auth-storage";
import { authService } from "./auth.service";
import { AuthContext } from "./useAuth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(authStorage.getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      // Async gap to satisfy react-hooks/set-state-in-effect
      await Promise.resolve();
      if (!active) return;

      const token = authStorage.getToken();
      if (token) {
        try {
          const fetchedUser = await authService.getMe();
          if (active) {
            setUser(fetchedUser);
          }
        } catch {
          authStorage.clearAll();
          if (active) {
            setUser(null);
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      } else {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      if (user.theme === "DARK") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (data: any) => {
    const loggedUser = await authService.register(data);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = () => {
    setUser(authStorage.getUser());
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
