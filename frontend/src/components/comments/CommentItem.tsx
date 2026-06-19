import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Shield, Loader2, Check, X } from "lucide-react";
import { Comment } from "../../types";
import { authStorage } from "../../lib/auth-storage";
import { canEditComment, canDeleteComment } from "../../utils/permissions";
import { ConfirmDialog } from "../common/ConfirmDialog";

interface CommentItemProps {
  comment: Comment;
  onUpdate: (id: string, newContent: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onModerateHide?: (id: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdate,
  onDelete,
  onModerateHide
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const currentUser = authStorage.getUser();

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(comment.id, editContent.trim());
      setIsEditing(false);
    } catch {
      alert("Falha ao salvar comentário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmOpen(false);
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch {
      alert("Falha ao excluir comentário.");
      setIsDeleting(false);
    }
  };

  const handleModerate = async () => {
    if (!onModerateHide) return;
    try {
      await onModerateHide(comment.id);
    } catch {
      alert("Falha ao ocultar comentário.");
    }
  };

  const showEdit = canEditComment(currentUser, comment);
  const showDelete = canDeleteComment(currentUser, comment);
  const showModerate = currentUser && (currentUser.role === "ADMIN" || currentUser.role === "MODERATOR") && comment.status !== "HIDDEN" && onModerateHide;

  const formattedDate = new Date(comment.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

  if (isDeleting) {
    return (
      <div className="text-xs text-slate-400 py-2 italic animate-pulse">
        Excluindo comentário...
      </div>
    );
  }

  return (
    <div className={`group flex items-start space-x-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 ${comment.status === "HIDDEN" ? "opacity-75 bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg" : ""}`}>
      {/* Avatar */}
      <Link to={comment.author.id === currentUser?.id ? "/profile/me" : `/profile/${comment.author.id}`}>
        {comment.author.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.fullName}
            className="w-8 h-8 rounded-full object-cover bg-slate-100 dark:bg-slate-800 shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500 dark:text-slate-400 shadow-sm">
            {comment.author.fullName.substring(0, 2)}
          </div>
        )}
      </Link>

      {/* Main Comment Box */}
      <div className="flex-1 space-y-1">
        <div className="bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 p-3 rounded-2xl rounded-tl-none transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={comment.author.id === currentUser?.id ? "/profile/me" : `/profile/${comment.author.id}`}
                className="font-bold text-slate-800 dark:text-slate-200 text-xs hover:underline hover:text-blue-600 dark:hover:text-blue-400 block"
              >
                {comment.author.fullName}
              </Link>
              {comment.author.jobTitle && (
                <span className="text-[10px] text-slate-400 dark:text-slate-550 font-normal">
                  {comment.author.jobTitle}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {showEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                  title="Editar"
                >
                  <Edit2 size={12} />
                </button>
              )}
              {showDelete && (
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  className="p-1 text-slate-400 hover:text-red-650 rounded cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 size={12} />
                </button>
              )}
              {showModerate && (
                <button
                  onClick={handleModerate}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Moderar (Ocultar)"
                >
                  <Shield size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="space-y-2 mt-1.5">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 p-2 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                maxLength={500}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="p-1 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-0.5 cursor-pointer"
                >
                  <X size={10} />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editContent.trim()}
                  className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center space-x-0.5 cursor-pointer"
                >
                  {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-normal mt-1.5">
              {comment.content}
            </p>
          )}
        </div>

        {/* Date and Moderation status */}
        <div className="flex items-center space-x-2 px-1 text-[10px] text-slate-400 dark:text-slate-500">
          <span>{formattedDate}</span>
          {comment.status === "HIDDEN" && (
            <span className="text-rose-500 dark:text-rose-400 font-bold flex items-center space-x-1">
              <Shield size={10} />
              <span>Ocultado pela moderação</span>
            </span>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Excluir comentário?"
        description="Deseja realmente excluir este comentário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
