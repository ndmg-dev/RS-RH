import { api } from "../../lib/api";
import { authStorage } from "../../lib/auth-storage";
import { mockDb } from "../../mocks/db";
import { Post, PaginatedResponse } from "../../types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const postsService = {
  async getPosts(page = 1, size = 10): Promise<PaginatedResponse<Post>> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const allPosts = mockDb.getPosts();
      // Filter out deleted or hidden posts (unless they are from the user, but standard feed should only display ACTIVE)
      const activePosts = allPosts.filter(p => p.status === "ACTIVE");

      const start = (page - 1) * size;
      const end = start + size;
      const items = activePosts.slice(start, end);
      const totalItems = activePosts.length;
      const totalPages = Math.ceil(totalItems / size);

      return {
        items,
        page,
        size,
        totalItems,
        totalPages
      };
    } else {
      const response = await api.get<PaginatedResponse<Post>>("/posts", {
        params: { page, size }
      });
      return response.data;
    }
  },

  async getPostById(id: string): Promise<Post> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const post = mockDb.getPost(id);
      if (!post || post.status === "DELETED") throw new Error("Publicação não encontrada.");
      return post;
    } else {
      const response = await api.get<Post>(`/posts/${id}`);
      return response.data;
    }
  },

  async createPost(content: string, mediaUrls?: string[], visibility: "COMPANY" | "DEPARTMENT" | "PRIVATE" = "COMPANY"): Promise<Post> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const currentUser = authStorage.getUser();
      if (!currentUser) throw new Error("Ação não autorizada. Faça login.");

      const newPost: Post = {
        id: "post-" + Date.now(),
        content,
        mediaUrls,
        author: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          jobTitle: currentUser.jobTitle,
          department: currentUser.department,
          avatarUrl: currentUser.avatarUrl
        },
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
        visibility,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockDb.savePost(newPost);
      return newPost;
    } else {
      const response = await api.post<Post>("/posts", { content, mediaUrls, visibility });
      return response.data;
    }
  },

  async updatePost(id: string, content: string, visibility?: "COMPANY" | "DEPARTMENT" | "PRIVATE"): Promise<Post> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const post = mockDb.getPost(id);
      if (!post || post.status === "DELETED") throw new Error("Publicação não encontrada.");

      const updated = {
        ...post,
        content,
        visibility: visibility || post.visibility,
        updatedAt: new Date().toISOString()
      };
      
      mockDb.savePost(updated);
      return updated;
    } else {
      const response = await api.patch<Post>(`/posts/${id}`, { content, visibility });
      return response.data;
    }
  },

  async deletePost(id: string): Promise<void> {
    if (USE_MOCKS) {
      await new Promise(resolve => setTimeout(resolve, 500));
      mockDb.deletePost(id);
    } else {
      await api.delete(`/posts/${id}`);
    }
  },

  async likePost(postId: string): Promise<void> {
    if (USE_MOCKS) {
      const post = mockDb.getPost(postId);
      if (post) {
        if (!post.likedByMe) {
          post.likedByMe = true;
          post.likeCount += 1;
          mockDb.savePost(post);
        }
      }
    } else {
      await api.post(`/posts/${postId}/likes`);
    }
  },

  async unlikePost(postId: string): Promise<void> {
    if (USE_MOCKS) {
      const post = mockDb.getPost(postId);
      if (post) {
        if (post.likedByMe) {
          post.likedByMe = false;
          post.likeCount = Math.max(0, post.likeCount - 1);
          mockDb.savePost(post);
        }
      }
    } else {
      await api.delete(`/posts/${postId}/likes`);
    }
  }
};
