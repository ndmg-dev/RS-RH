import { api } from "../../lib/api";
import { mockDb } from "../../mocks/db";
import { Announcement } from "../../types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const announcementsService = {
  async getAnnouncements(): Promise<Announcement[]> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.getAnnouncements();
    } else {
      const response = await api.get<Announcement[]>("/announcements");
      return response.data;
    }
  },

  async createAnnouncement(
    title: string,
    content: string,
    type: "EVENT" | "DOCUMENT" | "GENERAL"
  ): Promise<Announcement> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newAnnouncement: Announcement = {
        id: "announcement-" + Date.now(),
        title,
        content,
        type,
        createdAt: new Date().toISOString()
      };
      mockDb.saveAnnouncement(newAnnouncement);
      return newAnnouncement;
    } else {
      const response = await api.post<Announcement>("/announcements", {
        title,
        content,
        type
      });
      return response.data;
    }
  },

  async deleteAnnouncement(id: string): Promise<void> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockDb.deleteAnnouncement(id);
    } else {
      await api.delete(`/announcements/${id}`);
    }
  }
};
