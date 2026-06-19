import { mockUsers } from "./users.mock";
import { mockPosts } from "./posts.mock";
import { mockComments } from "./comments.mock";
import { mockAnnouncements } from "./announcements.mock";
import { UserProfile, Post, Comment, Announcement } from "../types";

const MOCK_USERS_KEY = "mgca_mock_users";
const MOCK_POSTS_KEY = "mgca_mock_posts";
const MOCK_COMMENTS_KEY = "mgca_mock_comments";
const MOCK_ANNOUNCEMENTS_KEY = "mgca_mock_announcements";

export const mockDb = {
  init() {
    if (!localStorage.getItem(MOCK_USERS_KEY)) {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));
    }
    const postsInStorage = localStorage.getItem(MOCK_POSTS_KEY);
    if (!postsInStorage || !postsInStorage.includes("mediaUrls")) {
      localStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(mockPosts));
    }
    if (!localStorage.getItem(MOCK_COMMENTS_KEY)) {
      localStorage.setItem(MOCK_COMMENTS_KEY, JSON.stringify(mockComments));
    }
    if (!localStorage.getItem(MOCK_ANNOUNCEMENTS_KEY)) {
      localStorage.setItem(MOCK_ANNOUNCEMENTS_KEY, JSON.stringify(mockAnnouncements));
    }
  },

  getUsers(): UserProfile[] {
    this.init();
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "[]");
  },

  getUser(id: string): UserProfile | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  saveUser(updatedUser: UserProfile): void {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  },

  getPosts(): Post[] {
    this.init();
    return JSON.parse(localStorage.getItem(MOCK_POSTS_KEY) || "[]");
  },

  getPost(id: string): Post | undefined {
    return this.getPosts().find(p => p.id === id);
  },

  savePost(post: Post): void {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index > -1) {
      posts[index] = post;
    } else {
      posts.unshift(post); // new posts at the top
    }
    localStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(posts));
  },

  deletePost(id: string): void {
    const posts = this.getPosts().map(p => p.id === id ? { ...p, status: "DELETED" as const } : p);
    localStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(posts));
  },

  getComments(postId?: string): Comment[] {
    this.init();
    const comments: Comment[] = JSON.parse(localStorage.getItem(MOCK_COMMENTS_KEY) || "[]");
    if (postId) {
      return comments.filter(c => c.postId === postId && c.status !== "DELETED");
    }
    return comments;
  },

  getComment(id: string): Comment | undefined {
    return this.getComments().find(c => c.id === id);
  },

  saveComment(comment: Comment): void {
    const comments: Comment[] = JSON.parse(localStorage.getItem(MOCK_COMMENTS_KEY) || "[]");
    const index = comments.findIndex(c => c.id === comment.id);
    if (index > -1) {
      comments[index] = comment;
    } else {
      comments.push(comment);
    }
    localStorage.setItem(MOCK_COMMENTS_KEY, JSON.stringify(comments));

    // Update comment count on post
    const post = this.getPost(comment.postId);
    if (post) {
      const count = comments.filter(c => c.postId === comment.postId && c.status !== "DELETED").length;
      post.commentCount = count;
      this.savePost(post);
    }
  },

  deleteComment(id: string): void {
    const comments: Comment[] = JSON.parse(localStorage.getItem(MOCK_COMMENTS_KEY) || "[]");
    const comment = comments.find(c => c.id === id);
    if (comment) {
      comment.status = "DELETED";
      localStorage.setItem(MOCK_COMMENTS_KEY, JSON.stringify(comments));

      // Update comment count on post
      const post = this.getPost(comment.postId);
      if (post) {
        const count = comments.filter(c => c.postId === comment.postId && c.status !== "DELETED").length;
        post.commentCount = count;
        this.savePost(post);
      }
    }
  },

  getAnnouncements(): Announcement[] {
    this.init();
    return JSON.parse(localStorage.getItem(MOCK_ANNOUNCEMENTS_KEY) || "[]");
  },

  saveAnnouncement(announcement: Announcement): void {
    const announcements = this.getAnnouncements();
    const index = announcements.findIndex(a => a.id === announcement.id);
    if (index > -1) {
      announcements[index] = announcement;
    } else {
      announcements.unshift(announcement); // new announcements at the top
    }
    localStorage.setItem(MOCK_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  },

  deleteAnnouncement(id: string): void {
    const announcements = this.getAnnouncements().filter(a => a.id !== id);
    localStorage.setItem(MOCK_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  }
};
