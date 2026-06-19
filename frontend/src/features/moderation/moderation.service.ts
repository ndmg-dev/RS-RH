import { api } from "../../lib/api";
import { mockDb } from "../../mocks/db";
import { Post, Comment } from "../../types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const moderationService = {
  async getModeratedPosts(): Promise<Post[]> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // In mock mode, show posts that are active or hidden (excluding completely deleted posts)
      return mockDb.getPosts().filter(p => p.status !== "DELETED");
    } else {
      const response = await api.get<Post[]>("/admin/posts");
      return response.data;
    }
  },

  async moderatePost(postId: string, status: "ACTIVE" | "HIDDEN"): Promise<void> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const post = mockDb.getPost(postId);
      if (post) {
        post.status = status;
        post.updatedAt = new Date().toISOString();
        mockDb.savePost(post);
      }
    } else {
      await api.patch(`/admin/posts/${postId}/moderation`, { status });
    }
  },

  async getModeratedComments(): Promise<Comment[]> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Return comments that are active or hidden
      return mockDb.getComments().filter(c => c.status !== "DELETED");
    } else {
      const response = await api.get<Comment[]>("/admin/comments");
      return response.data;
    }
  },

  async moderateComment(commentId: string, status: "ACTIVE" | "HIDDEN"): Promise<void> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const comment = mockDb.getComment(commentId);
      if (comment) {
        comment.status = status;
        comment.updatedAt = new Date().toISOString();
        mockDb.saveComment(comment);
      }
    } else {
      await api.patch(`/admin/comments/${commentId}/moderation`, { status });
    }
  }
};
