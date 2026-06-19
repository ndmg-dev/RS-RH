import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Users, Lock, MessageSquare, Shield, Check, X, Loader2 } from "lucide-react";
import { Post } from "../../types";
import { postsService } from "../../features/posts/posts.service";
import { LikeButton } from "./LikeButton";
import { PostActions } from "./PostActions";
import { CommentList } from "../comments/CommentList";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { authStorage } from "../../lib/auth-storage";

interface PostCardProps {
  post: Post;
  onDeleteSuccess?: (id: string) => void;
  onUpdateSuccess?: (post: Post) => void;
  onModerateSuccess?: (post: Post) => void;
  defaultShowComments?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post: initialPost,
  onDeleteSuccess,
  onUpdateSuccess,
  onModerateSuccess,
  defaultShowComments = false
}) => {
  const [post, setPost] = useState<Post>(initialPost);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editVisibility, setEditVisibility] = useState(post.visibility || "COMPANY");
  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const currentUser = authStorage.getUser();

  const handleLikeToggle = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const originallyLiked = post.likedByMe;
    const originalLikeCount = post.likeCount;

    // Optimistic Update
    setPost(prev => ({
      ...prev,
      likedByMe: !originallyLiked,
      likeCount: originallyLiked ? Math.max(0, originalLikeCount - 1) : originalLikeCount + 1
    }));

    try {
      if (originallyLiked) {
        await postsService.unlikePost(post.id);
      } else {
        await postsService.likePost(post.id);
      }
    } catch {
      // Rollback on error
      setPost(prev => ({
        ...prev,
        likedByMe: originallyLiked,
        likeCount: originalLikeCount
      }));
    } finally {
      setIsLiking(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    try {
      const updated = await postsService.updatePost(post.id, editContent.trim(), editVisibility);
      setPost(updated);
      setIsEditing(false);
      if (onUpdateSuccess) onUpdateSuccess(updated);
    } catch {
      alert("Falha ao salvar as alterações do post.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmOpen(false);
    setIsDeleting(true);
    try {
      await postsService.deletePost(post.id);
      if (onDeleteSuccess) onDeleteSuccess(post.id);
    } catch {
      alert("Falha ao excluir o post.");
      setIsDeleting(false);
    }
  };

  const handleModerateHide = async () => {
    try {
      // In mock mode we toggle status. In real API it calls patch.
      // Set status to HIDDEN
      const updatedStatus = "HIDDEN";
      if (import.meta.env.VITE_USE_MOCKS === "true") {
        const { moderationService } = await import("../../features/moderation/moderation.service");
        await moderationService.moderatePost(post.id, updatedStatus);
      } else {
        // If not mocks, call API
        const { moderationService } = await import("../../features/moderation/moderation.service");
        await moderationService.moderatePost(post.id, updatedStatus);
      }
      const updatedPost: Post = { ...post, status: updatedStatus };
      setPost(updatedPost);
      if (onModerateSuccess) onModerateSuccess(updatedPost);
    } catch {
      alert("Falha ao moderar o post.");
    }
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case "DEPARTMENT":
        return <span title="Apenas Setor"><Users size={12} className="text-slate-400" /></span>;
      case "PRIVATE":
        return <span title="Privado"><Lock size={12} className="text-slate-400" /></span>;
      case "COMPANY":
      default:
        return <span title="Toda a Empresa"><Globe size={12} className="text-slate-400" /></span>;
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

  if (isDeleting) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-400">
        <Loader2 size={18} className="animate-spin" />
        <span>Excluindo publicação...</span>
      </div>
    );
  }

  return (
    <article className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300 ${post.status === "HIDDEN" ? "opacity-75 border-dashed border-rose-300 dark:border-rose-900/50" : ""}`}>
      {/* Moderation Banner if Hidden */}
      {post.status === "HIDDEN" && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50 text-rose-800 dark:text-rose-450 text-xs px-4 py-2 flex items-center justify-between">
          <span className="flex items-center space-x-1.5 font-semibold">
            <Shield size={14} />
            <span>Esta publicação foi oculta pela moderação.</span>
          </span>
          <span className="bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold px-2 py-0.5 rounded text-[10px]">OCULTO</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={post.author.id === currentUser?.id ? "/profile/me" : `/profile/${post.author.id}`}>
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.fullName}
                  className="w-11 h-11 rounded-full object-cover bg-slate-50 dark:bg-slate-800 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700">
                  {post.author.fullName.substring(0, 2)}
                </div>
              )}
            </Link>

            <div>
              <div className="flex items-center space-x-1.5">
                <Link
                  to={post.author.id === currentUser?.id ? "/profile/me" : `/profile/${post.author.id}`}
                  className="font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-sm leading-snug"
                >
                  {post.author.fullName}
                </Link>
                {post.author.id === currentUser?.id && (
                  <span className="bg-blue-50 dark:bg-blue-950/45 text-blue-700 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded">VOCÊ</span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                {post.author.jobTitle} {post.author.department && `• ${post.author.department}`}
              </p>

              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-none">{formattedDate}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                {getVisibilityIcon()}
              </div>
            </div>
          </div>

          {/* Action Menu (Edit/Delete/Moderate) */}
          <PostActions
            post={post}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsConfirmOpen(true)}
            onModerate={handleModerateHide}
          />
        </div>

        {/* Content Body */}
        {isEditing ? (
          <div className="space-y-3 pt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={1000}
            />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <label htmlFor={`edit-post-visibility-${post.id}`} className="sr-only">Visibilidade</label>
                <select
                  id={`edit-post-visibility-${post.id}`}
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value as "COMPANY" | "DEPARTMENT" | "PRIVATE")}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 focus:outline-none [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:text-slate-800 [&>option]:dark:text-slate-100"
                >
                  <option value="COMPANY">Toda a Empresa</option>
                  <option value="DEPARTMENT">Meu Setor</option>
                  <option value="PRIVATE">Apenas Eu</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                    setEditVisibility(post.visibility || "COMPANY");
                  }}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-1"
                >
                  <X size={12} />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editContent.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-full flex items-center space-x-1"
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap pt-1 select-text">
            {post.content}
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 transition-colors duration-300">
        <LikeButton
          likedByMe={post.likedByMe}
          likeCount={post.likeCount}
          onClick={handleLikeToggle}
          disabled={post.status === "HIDDEN"}
        />

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${
            showComments ? "text-blue-600 dark:text-blue-400 font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          aria-label="Comentários"
        >
          <MessageSquare size={18} />
          <span>Comentar</span>
          {post.commentCount > 0 && (
            <span className="bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-1.5 py-0.5 rounded-full font-bold">
              {post.commentCount}
            </span>
          )}
        </button>
      </div>

      {/* Collapsible Comments Section */}
      {showComments && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
          <CommentList 
            postId={post.id} 
            onCountChange={(newCount) => setPost(prev => ({ ...prev, commentCount: newCount }))} 
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Excluir publicação?"
        description="Tem certeza de que deseja excluir esta publicação? Esta ação é irreversível e os colaboradores não poderão mais visualizá-la."
        confirmText="Excluir"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </article>
  );
};
