export type Role = "USER" | "ADMIN" | "MODERATOR";

export type CustomSectionItem = {
  id: string;
  title: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  link?: string;
};

export type CustomSection = {
  type: "education" | "experience" | "certificate" | "project" | "recommendation" | "custom";
  title: string;
  items: CustomSectionItem[];
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  jobTitle?: string;
  department?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  theme?: "LIGHT" | "DARK";
  customSections?: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  jobTitle?: string;
  department?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  skills?: string[];
  location?: string;
  theme?: "LIGHT" | "DARK";
  customSections?: string;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  content: string;
  mediaUrls?: string[];
  author: {
    id: string;
    fullName: string;
    jobTitle?: string;
    department?: string;
    avatarUrl?: string;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  visibility?: "COMPANY" | "DEPARTMENT" | "PRIVATE";
  status?: "ACTIVE" | "HIDDEN" | "DELETED";
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string;
    fullName: string;
    jobTitle?: string;
    avatarUrl?: string;
  };
  status?: "ACTIVE" | "HIDDEN" | "DELETED";
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  type: "EVENT" | "DOCUMENT" | "GENERAL";
  createdAt: string;
};
