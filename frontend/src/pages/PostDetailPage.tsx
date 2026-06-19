import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postsService } from "../features/posts/posts.service";
import { Post } from "../types";
import { PostCard } from "../components/posts/PostCard";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { RightInfoPanel } from "../components/layout/RightInfoPanel";
import { ArrowLeft } from "lucide-react";
import { getFriendlyApiError } from "../utils/errors";

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await postsService.getPostById(postId);
      setPost(data);
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        loadPost();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [loadPost]);

  const handleDeleteSuccess = () => {
    // If the active post gets deleted, redirect back to feed
    navigate("/feed");
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <button
          onClick={() => navigate("/feed")}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Feed</span>
        </button>
      </div>

      {isLoading && <LoadingState type="feed" />}

      {error && !isLoading && (
        <ErrorState message={error} onRetry={loadPost} />
      )}

      {!isLoading && !error && post && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Post Card Detail */}
          <div className="lg:col-span-2">
            <PostCard 
              post={post} 
              defaultShowComments={true} 
              onDeleteSuccess={handleDeleteSuccess} 
            />
          </div>

          {/* Right Column: Widgets */}
          <div className="lg:col-span-1">
            <RightInfoPanel />
          </div>
        </div>
      )}
    </div>
  );
};
