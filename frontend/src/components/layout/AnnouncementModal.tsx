import React, { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string, type: "EVENT" | "DOCUMENT" | "GENERAL") => Promise<void>;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"EVENT" | "DOCUMENT" | "GENERAL">("GENERAL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (title.length < 3 || title.length > 100) {
      setError("O título deve ter entre 3 e 100 caracteres.");
      return;
    }
    if (content.length < 5 || content.length > 500) {
      setError("O conteúdo deve ter entre 5 e 500 caracteres.");
      return;
    }

    setIsSubmitting(false);
    setError(null);
    try {
      setIsSubmitting(true);
      await onSave(title.trim(), content.trim(), type);
      setTitle("");
      setContent("");
      setType("GENERAL");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar o aviso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Criar Novo Aviso Corporativo</h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-xs text-red-800 dark:text-red-400 font-medium flex items-center space-x-1.5">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Tipo do Aviso
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "EVENT" | "DOCUMENT" | "GENERAL")}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-white [&>option]:dark:bg-slate-800"
            >
              <option value="GENERAL">Informativo Geral (Info)</option>
              <option value="EVENT">Evento / Cronograma (Calendário)</option>
              <option value="DOCUMENT">Documento / Modelo (Texto)</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Título do Aviso <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Novo Canal de Denúncias"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Mensagem / Conteúdo <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva as instruções ou detalhes do aviso para a equipe..."
              className="mt-1 block w-full min-h-[100px] px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-350 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              maxLength={500}
              disabled={isSubmitting}
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Save size={14} />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
