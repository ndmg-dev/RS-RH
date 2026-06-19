import React, { useState } from "react";
import { Send, Globe, Users, Lock, Image, X, Loader2 } from "lucide-react";
import { authStorage } from "../../lib/auth-storage";

interface PostComposerProps {
  onSubmit: (content: string, mediaUrls: string[], visibility: "COMPANY" | "DEPARTMENT" | "PRIVATE") => Promise<void>;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"COMPANY" | "DEPARTMENT" | "PRIVATE">("COMPANY");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = authStorage.getUser();

  if (!user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaUrls.length + files.length > 4) {
      setError("Você pode anexar no máximo 4 imagens por publicação.");
      return;
    }

    setIsReadingFiles(true);
    setError(null);

    const readPromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
          reject(new Error("Apenas imagens são permitidas."));
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error("Erro ao ler arquivo."));
          }
        };
        reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(readPromises);
      setMediaUrls((prev) => [...prev, ...results]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao ler as imagens.");
    } finally {
      setIsReadingFiles(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(content.trim(), mediaUrls, visibility);
      setContent("");
      setMediaUrls([]);
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

          {/* Selected Images Preview Grid */}
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                    title="Remover imagem"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Left side actions (Upload Image + Visibility Selector) */}
            <div className="flex items-center space-x-2">
              {/* Image Upload Trigger */}
              <label className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors">
                {isReadingFiles ? (
                  <Loader2 size={14} className="animate-spin text-slate-500" />
                ) : (
                  <Image size={14} className="text-slate-500" />
                )}
                <span>Mídia</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting || isReadingFiles}
                />
              </label>

              {/* Visibility Selector */}
              <div className="relative flex items-center text-slate-500 dark:text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                {visibility === "COMPANY" && <Globe size={14} className="mr-1 text-slate-500 dark:text-slate-400" />}
                {visibility === "DEPARTMENT" && <Users size={14} className="mr-1 text-slate-500 dark:text-slate-400" />}
                {visibility === "PRIVATE" && <Lock size={14} className="mr-1 text-slate-500 dark:text-slate-400" />}

                <select
                  id="post-visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "COMPANY" | "DEPARTMENT" | "PRIVATE")}
                  className="bg-transparent border-none outline-none font-semibold cursor-pointer text-slate-650 dark:text-slate-300 focus:ring-0 [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:text-slate-800 [&>option]:dark:text-slate-100"
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
              disabled={isSubmitting || isReadingFiles || (!content.trim() && mediaUrls.length === 0)}
              className="flex items-center space-x-2 px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={12} className="animate-spin text-white" />
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
