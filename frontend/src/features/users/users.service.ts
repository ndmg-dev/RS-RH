import { api } from "../../lib/api";
import { authStorage } from "../../lib/auth-storage";
import { mockDb } from "../../mocks/db";
import { UserProfile } from "../../types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const usersService = {
  async getUserProfile(id: string): Promise<UserProfile> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let targetId = id;
      if (id === "me") {
        const currentUser = authStorage.getUser();
        if (!currentUser) throw new Error("Ação não autorizada. Faça login.");
        targetId = currentUser.id;
      }

      const profile = mockDb.getUser(targetId);
      if (!profile) throw new Error("Colaborador não encontrado.");
      return profile;
    } else {
      const response = await api.get<UserProfile>(`/users/${id}`);
      return response.data;
    }
  },

  async updateUserProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 600));

      let targetId = id;
      if (id === "me") {
        const currentUser = authStorage.getUser();
        if (!currentUser) throw new Error("Ação não autorizada. Faça login.");
        targetId = currentUser.id;
      }

      const profile = mockDb.getUser(targetId);
      if (!profile) throw new Error("Colaborador não encontrado.");

      const updatedProfile: UserProfile = {
        ...profile,
        ...data,
        updatedAt: new Date().toISOString()
      };

      mockDb.saveUser(updatedProfile);

      // If updating 'me', update the auth session cache too
      if (id === "me" || targetId === authStorage.getUser()?.id) {
        const currentUser = authStorage.getUser();
        if (currentUser) {
          authStorage.setUser({
            ...currentUser,
            fullName: updatedProfile.fullName,
            jobTitle: updatedProfile.jobTitle,
            department: updatedProfile.department,
            avatarUrl: updatedProfile.avatarUrl,
            theme: updatedProfile.theme,
            customSections: updatedProfile.customSections
          });
        }
      }

      return updatedProfile;
    } else {
      const response = await api.patch<UserProfile>(id === "me" ? "/users/me" : `/users/${id}`, data);
      
      // Update session cache if needed
      if (id === "me") {
        const currentUser = authStorage.getUser();
        if (currentUser) {
          authStorage.setUser({
            ...currentUser,
            fullName: response.data.fullName,
            jobTitle: response.data.jobTitle,
            department: response.data.department,
            avatarUrl: response.data.avatarUrl,
            theme: response.data.theme,
            customSections: response.data.customSections
          });
        }
      }
      return response.data;
    }
  },

  async getUsers(): Promise<UserProfile[]> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockDb.getUsers();
    } else {
      const response = await api.get<UserProfile[]>("/users");
      return response.data;
    }
  }
};
