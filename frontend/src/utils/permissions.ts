import { AuthUser, Post, Comment } from "../types";

export function canEditPost(user: AuthUser | null, post: Post): boolean {
  if (!user) return false;
  // Author can edit, or ADMIN
  return post.author.id === user.id || user.role === "ADMIN";
}

export function canDeletePost(user: AuthUser | null, post: Post): boolean {
  if (!user) return false;
  // Author can delete, or ADMIN, or MODERATOR
  return post.author.id === user.id || user.role === "ADMIN" || user.role === "MODERATOR";
}

export function canModerateContent(user: AuthUser | null): boolean {
  if (!user) return false;
  // ADMIN or MODERATOR can moderate
  return user.role === "ADMIN" || user.role === "MODERATOR";
}

export function canEditComment(user: AuthUser | null, comment: Comment): boolean {
  if (!user) return false;
  // Author can edit, or ADMIN
  return comment.author.id === user.id || user.role === "ADMIN";
}

export function canDeleteComment(user: AuthUser | null, comment: Comment): boolean {
  if (!user) return false;
  // Author can delete, or ADMIN, or MODERATOR
  return comment.author.id === user.id || user.role === "ADMIN" || user.role === "MODERATOR";
}
