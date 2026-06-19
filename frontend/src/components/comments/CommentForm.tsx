import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { authStorage } from "../../lib/auth-storage";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Adicione um comentário..."
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = authStorage.getUser();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch {
      alert("Falha ao publicar comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-3 mt-3">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.fullName}
          className="w-8 h-8 rounded-full object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700 flex-shrink-0">
          {user.fullName.substring(0, 2)}
        </div>
      )}

      <div className="flex-1 relative flex items-center">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-500 focus:outline-none rounded-full py-2 pl-4 pr-10 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
          disabled={isSubmitting}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="absolute right-1 p-1.5 text-blue-600 dark:text-blue-400 disabled:text-slate-300 dark:disabled:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center justify-center cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </form>
  );
};
