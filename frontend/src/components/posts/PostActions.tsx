import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { Post } from "../../types";
import { authStorage } from "../../lib/auth-storage";
import { canEditPost, canDeletePost, canModerateContent } from "../../utils/permissions";

interface PostActionsProps {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  onModerate?: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, onEdit, onDelete, onModerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = authStorage.getUser();

  const showEdit = canEditPost(user, post);
  const showDelete = canDeletePost(user, post);
  const showModerate = canModerateContent(user) && onModerate;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!showEdit && !showDelete && !showModerate) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 transition-colors focus:outline-none"
        aria-label="Opções da publicação"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 animate-fade-in">
          {showEdit && (
            <button
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Edit2 size={14} className="text-slate-400" />
              <span>Editar publicação</span>
            </button>
          )}

          {showDelete && (
            <button
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Trash2 size={14} className="text-red-400" />
              <span>Excluir publicação</span>
            </button>
          )}

          {showModerate && (
            <button
              onClick={() => {
                setIsOpen(false);
                onModerate();
              }}
              className="w-full px-4 py-2 text-left text-sm text-rose-700 hover:bg-rose-50 border-t border-slate-100 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <ShieldAlert size={14} className="text-rose-400" />
              <span>Ocultar do Feed</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
