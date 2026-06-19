import React from "react";
import { ThumbsUp } from "lucide-react";

interface LikeButtonProps {
  likedByMe: boolean;
  likeCount: number;
  onClick: () => void;
  disabled?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  likedByMe,
  likeCount,
  onClick,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center space-x-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${
        likedByMe 
          ? "text-blue-600 dark:text-blue-400 font-extrabold" 
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      }`}
      aria-label={`${likedByMe ? "Descurtir" : "Curtir"} publicação (${likeCount} curtidas)`}
    >
      <ThumbsUp size={18} fill={likedByMe ? "currentColor" : "none"} />
      <span>{likedByMe ? "Curtido" : "Curtir"}</span>
      {likeCount > 0 && (
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-1.5 py-0.5 rounded-full font-bold">
          {likeCount}
        </span>
      )}
    </button>
  );
};
