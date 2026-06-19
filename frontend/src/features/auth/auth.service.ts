import { api } from "../../lib/api";
import { authStorage } from "../../lib/auth-storage";
import { mockDb } from "../../mocks/db";
import { AuthUser } from "../../types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    if (USE_MOCKS) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!email.includes("@")) {
        throw new Error("Formato de e-mail inválido.");
      }

      // Check if user exists in mock database
      const mockUsers = mockDb.getUsers();
      const matchedUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (matchedUser) {
        const authUser: AuthUser = {
          id: matchedUser.id,
          fullName: matchedUser.fullName,
          email: matchedUser.email,
          role: matchedUser.role,
          jobTitle: matchedUser.jobTitle,
          department: matchedUser.department,
          avatarUrl: matchedUser.avatarUrl
        };
        authStorage.setToken("fake-jwt-token-for-" + matchedUser.id);
        authStorage.setUser(authUser);
        return authUser;
      } else {
        // Default fallback to Eduardo Melo (ADMIN) if not matched, to make logging in easy
        const defaultUser = mockUsers[0]; // Eduardo Melo
        const authUser: AuthUser = {
          id: defaultUser.id,
          fullName: defaultUser.fullName,
          email: defaultUser.email,
          role: defaultUser.role,
          jobTitle: defaultUser.jobTitle,
          department: defaultUser.department,
          avatarUrl: defaultUser.avatarUrl
        };
        authStorage.setToken("fake-jwt-token-for-default");
        authStorage.setUser(authUser);
        return authUser;
      }
    } else {
      const response = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
      // The response structure: { token: string, user: AuthUser }
      const { token, user } = response.data;
      authStorage.setToken(token);
      authStorage.setUser(user);
      return user;
    }
  },

  async register(data: { fullName: string; email: string; password: string; department: string; jobTitle: string; }): Promise<AuthUser> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!data.email.endsWith("@mendoncagalvao.com.br")) {
        throw new Error("Apenas e-mails corporativos são permitidos.");
      }
      const authUser: AuthUser = {
        id: "mock-new-id-" + Date.now(),
        fullName: data.fullName,
        email: data.email,
        role: "USER",
        jobTitle: data.jobTitle,
        department: data.department
      };
      authStorage.setToken("fake-jwt-token-for-new");
      authStorage.setUser(authUser);
      return authUser;
    } else {
      const response = await api.post<{ token: string; user: AuthUser }>("/auth/register", data);
      const { token, user } = response.data;
      authStorage.setToken(token);
      authStorage.setUser(user);
      return user;
    }
  },

  async logout(): Promise<void> {
    if (USE_MOCKS) {
      authStorage.clearAll();
      return;
    } else {
      try {
        await api.post("/auth/logout");
      } catch (err) {
        console.error("Logout failed on server:", err);
      } finally {
        authStorage.clearAll();
      }
    }
  },

  async getMe(): Promise<AuthUser> {
    if (USE_MOCKS) {
      const stored = authStorage.getUser();
      if (!stored) throw new Error("Não autenticado.");
      return stored;
    } else {
      const response = await api.get<AuthUser>("/auth/me");
      authStorage.setUser(response.data);
      return response.data;
    }
  }
};
