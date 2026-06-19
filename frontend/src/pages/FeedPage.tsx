import React, { useState, useEffect, useCallback } from "react";
import { SidebarProfileCard } from "../components/profile/SidebarProfileCard";
import { RightInfoPanel } from "../components/layout/RightInfoPanel";
import { PostComposer } from "../components/feed/PostComposer";
import { PostCard } from "../components/posts/PostCard";
import { postsService } from "../features/posts/posts.service";
import { Post } from "../types";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { Loader2 } from "lucide-react";

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (pageToFetch: number, append = false) => {
    if (pageToFetch === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await postsService.getPosts(pageToFetch, 5); // load 5 posts at a time
      if (append) {
        setPosts(prev => [...prev, ...response.items]);
      } else {
        setPosts(response.items);
      }
      setTotalPages(response.totalPages);
      setPage(pageToFetch);
      setError(null);
    } catch {
      setError("Não foi possível carregar a lista de publicações.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchFeed(1);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchFeed]);

  const handleCreatePost = async (content: string, visibility: "COMPANY" | "DEPARTMENT" | "PRIVATE") => {
    const newPost = await postsService.createPost(content, [], visibility);
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeletePost = (deletedId: string) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleModeratePost = (moderatedPost: Post) => {
    // If hidden by moderator, remove it from standard feed view
    if (moderatedPost.status === "HIDDEN") {
      setPosts(prev => prev.filter(p => p.id !== moderatedPost.id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Column: Profile Card */}
      <div className="lg:col-span-1 space-y-6">
        <SidebarProfileCard />
      </div>

      {/* Center Column: Feed (Composer + PostList) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Post Composer */}
        <PostComposer onSubmit={handleCreatePost} />

        {/* Loading State */}
        {isLoading && <LoadingState type="feed" />}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState message={error} onRetry={() => fetchFeed(1)} />
        )}

        {/* Empty State */}
        {!isLoading && !error && posts.length === 0 && (
          <EmptyState />
        )}

        {/* Feed List */}
        {!isLoading && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeleteSuccess={handleDeletePost}
                onUpdateSuccess={handleUpdatePost}
                onModerateSuccess={handleModeratePost}
              />
            ))}
          </div>
        )}

        {/* Pagination / Load More */}
        {!isLoading && !error && page < totalPages && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => fetchFeed(page + 1, true)}
              disabled={isLoadingMore}
              className="flex items-center space-x-2 px-6 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-full font-bold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Carregando mais...</span>
                </>
              ) : (
                <span>Carregar mais</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Institutional Info */}
      <div className="lg:col-span-1">
        <RightInfoPanel />
      </div>
    </div>
  );
};
