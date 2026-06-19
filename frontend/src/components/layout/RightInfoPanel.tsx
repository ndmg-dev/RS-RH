import React, { useState, useEffect } from "react";
import { Info, HelpCircle, FileText, Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { announcementsService } from "../../features/announcements/announcements.service";
import { authStorage } from "../../lib/auth-storage";
import { Announcement } from "../../types";
import { AnnouncementModal } from "./AnnouncementModal";

export const RightInfoPanel: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = authStorage.getUser();
  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "MODERATOR";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await announcementsService.getAnnouncements();
        setAnnouncements(data);
        setError(null);
      } catch {
        setError("Erro ao carregar avisos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleSaveAnnouncement = async (
    title: string,
    content: string,
    type: "EVENT" | "DOCUMENT" | "GENERAL"
  ) => {
    const newAnnouncement = await announcementsService.createAnnouncement(title, content, type);
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este aviso?")) return;
    try {
      await announcementsService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Falha ao excluir o aviso.");
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "EVENT":
        return <Calendar size={14} className="text-blue-600 dark:text-blue-400" />;
      case "DOCUMENT":
        return <FileText size={14} className="text-amber-650 dark:text-amber-400" />;
      case "GENERAL":
      default:
        return <Info size={14} className="text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <aside className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-5 transition-colors duration-300">
      {/* Block 1: Dynamic Announcements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center space-x-1">
            <Info size={14} className="text-slate-400 dark:text-slate-500" />
            <span>Avisos Importantes</span>
          </h4>
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-full transition-colors cursor-pointer"
              title="Criar novo aviso corporativo"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-slate-400">
            <Loader2 size={16} className="animate-spin mr-1.5" />
            <span className="text-xs">Buscando avisos...</span>
          </div>
        ) : error ? (
          <p className="text-xs text-red-500 text-center font-medium py-2">{error}</p>
        ) : announcements.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4 border border-dashed border-slate-100 dark:border-slate-800/80 rounded-lg">
            Nenhum aviso ativo no momento.
          </p>
        ) : (
          <div className="space-y-2 text-sm max-h-[320px] overflow-y-auto pr-0.5">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors relative group"
              >
                {/* Delete button (Admins/Mods only) */}
                {canManage && (
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="absolute top-2.5 right-2.5 p-1 bg-white/80 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-all border border-slate-100 dark:border-slate-700 cursor-pointer shadow-sm"
                    title="Excluir aviso"
                  >
                    <Trash2 size={11} />
                  </button>
                )}

                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 pr-5">
                  {getAnnouncementIcon(ann.type)}
                  <span className="truncate">{ann.title}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed select-text">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Block 2: Corporate Best Practices */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center space-x-1">
          <HelpCircle size={14} className="text-slate-400 dark:text-slate-500" />
          <span>Manual de Boas Práticas</span>
        </h4>
        <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-400 list-disc list-inside leading-relaxed">
          <li>Classifique os lançamentos fiscais com o CFOP exato.</li>
          <li>Sinalize incompatibilidades de notas antes de fechar balancetes.</li>
          <li>Mantenha o eSocial atualizado com admissões com 24h de antecedência.</li>
          <li>Dúvidas de clientes? Registre sempre a resposta no CRM oficial.</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-450 dark:text-slate-500 text-center leading-normal">
        Mendonça Galvão Contadores Associados © 2026. Todos os direitos reservados.
      </div>

      {/* Creation Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAnnouncement}
      />
    </aside>
  );
};
