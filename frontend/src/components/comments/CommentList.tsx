import React, { useState, useEffect, useCallback } from "react";
import { commentsService } from "../../features/comments/comments.service";
import { Comment } from "../../types";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Loader2 } from "lucide-react";

interface CommentListProps {
  postId: string;
  onCountChange?: (newCount: number) => void;
}

export const CommentList: React.FC<CommentListProps> = ({ postId, onCountChange }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await commentsService.getCommentsForPost(postId);
      setComments(data);
    } catch {
      setError("Não foi possível carregar os comentários.");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        loadComments();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [loadComments]);

  const handleCreateComment = async (content: string) => {
    const newComment = await commentsService.createComment(postId, content);
    setComments(prev => [...prev, newComment]);
    if (onCountChange) {
      onCountChange(comments.length + 1);
    }
  };

  const handleUpdateComment = async (id: string, content: string) => {
    const updated = await commentsService.updateComment(id, content);
    setComments(prev => prev.map(c => c.id === id ? updated : c));
  };

  const handleDeleteComment = async (id: string) => {
    await commentsService.deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
    if (onCountChange) {
      onCountChange(Math.max(0, comments.length - 1));
    }
  };

  const handleModerateComment = async (id: string) => {
    try {
      const { moderationService } = await import("../../features/moderation/moderation.service");
      await moderationService.moderateComment(id, "HIDDEN");
      setComments(prev => prev.map(c => c.id === id ? { ...c, status: "HIDDEN" } : c));
    } catch {
      alert("Falha ao moderar comentário.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Form at the top */}
      <CommentForm onSubmit={handleCreateComment} />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 space-x-2 text-slate-500 dark:text-slate-400 text-xs">
          <Loader2 size={16} className="animate-spin" />
          <span>Carregando comentários...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <p className="text-xs text-red-500 font-medium py-2 text-center">{error}</p>
      )}

      {/* Empty state */}
      {!isLoading && !error && comments.length === 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center italic">
          Ainda não há comentários. Seja o primeiro a comentar!
        </p>
      )}

      {/* Comments List */}
      {!isLoading && !error && comments.length > 0 && (
        <div className="space-y-1 mt-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
              onModerateHide={handleModerateComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
