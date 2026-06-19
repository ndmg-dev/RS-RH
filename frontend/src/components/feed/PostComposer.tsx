import React, { useState } from "react";
import { Send, Globe, Users, Lock } from "lucide-react";
import { authStorage } from "../../lib/auth-storage";

interface PostComposerProps {
  onSubmit: (content: string, visibility: "COMPANY" | "DEPARTMENT" | "PRIVATE") => Promise<void>;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"COMPANY" | "DEPARTMENT" | "PRIVATE">("COMPANY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = authStorage.getUser();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(content.trim(), visibility);
      setContent("");
      setVisibility("COMPANY");
    } catch (err) {
      const { getFriendlyApiError } = await import("../../utils/errors");
      setError(getFriendlyApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 transition-colors duration-300">
      <div className="flex items-start space-x-3">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-12 h-12 rounded-full object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 flex-shrink-0">
            <span className="font-bold text-sm">{user.fullName.substring(0, 2)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="No que você está trabalhando hoje? Compartilhe uma atualização com a equipe..."
            className="w-full min-h-[90px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none resize-none border border-slate-100 dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-500 rounded-lg p-2 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            maxLength={1000}
            disabled={isSubmitting}
          />

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Visibility Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="post-visibility" className="sr-only">Visibilidade</label>
              <div className="relative flex items-center text-slate-500 dark:text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                {visibility === "COMPANY" && <Globe size={14} className="mr-1 text-slate-500 dark:text-slate-400" />}
                {visibility === "DEPARTMENT" && <Users size={14} className="mr-1 text-slate-500 dark:text-slate-400" />}
                {visibility === "PRIVATE" && <Lock size={14} className="mr-1 text-slate-500 dark:text-slate-400" />}

                <select
                  id="post-visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "COMPANY" | "DEPARTMENT" | "PRIVATE")}
                  className="bg-transparent border-none outline-none font-semibold cursor-pointer text-slate-600 dark:text-slate-300 focus:ring-0 [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:text-slate-800 [&>option]:dark:text-slate-100"
                  disabled={isSubmitting}
                >
                  <option value="COMPANY">Toda a Empresa</option>
                  <option value="DEPARTMENT">Meu Setor ({user.department || "Setor"})</option>
                  <option value="PRIVATE">Apenas Eu</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center space-x-2 px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Publicar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
