import { api } from "../../lib/api";
import { authStorage } from "../../lib/auth-storage";
import { mockDb } from "../../mocks/db";
import { Comment } from "../../types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const commentsService = {
  async getCommentsForPost(postId: string): Promise<Comment[]> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockDb.getComments(postId).filter(c => c.status === "ACTIVE");
    } else {
      const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
      return response.data;
    }
  },

  async createComment(postId: string, content: string): Promise<Comment> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentUser = authStorage.getUser();
      if (!currentUser) throw new Error("Ação não autorizada. Faça login.");

      const newComment: Comment = {
        id: "comment-" + Date.now(),
        postId,
        content,
        author: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          jobTitle: currentUser.jobTitle,
          avatarUrl: currentUser.avatarUrl
        },
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockDb.saveComment(newComment);
      return newComment;
    } else {
      const response = await api.post<Comment>(`/posts/${postId}/comments`, { content });
      return response.data;
    }
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const comment = mockDb.getComment(commentId);
      if (!comment || comment.status === "DELETED") throw new Error("Comentário não encontrado.");

      const updated = {
        ...comment,
        content,
        updatedAt: new Date().toISOString()
      };

      mockDb.saveComment(updated);
      return updated;
    } else {
      const response = await api.patch<Comment>(`/comments/${commentId}`, { content });
      return response.data;
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 400));
      mockDb.deleteComment(commentId);
    } else {
      await api.delete(`/comments/${commentId}`);
    }
  }
};
