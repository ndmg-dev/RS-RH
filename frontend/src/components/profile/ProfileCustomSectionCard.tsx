import React from "react";
import { Briefcase, GraduationCap, Award, FolderKanban, MessageSquareQuote, Plus, Edit3, ExternalLink } from "lucide-react";
import { CustomSection, CustomSectionItem } from "../../types";

interface ProfileCustomSectionCardProps {
  section: CustomSection;
  isOwnProfile: boolean;
  onAddItem: () => void;
  onEditItem: (item: CustomSectionItem) => void;
  profileFullName?: string;
}

export const ProfileCustomSectionCard: React.FC<ProfileCustomSectionCardProps> = ({
  section,
  isOwnProfile,
  onAddItem,
  onEditItem,
  profileFullName
}) => {
  const getIcon = () => {
    switch (section.type) {
      case "experience":
        return <Briefcase size={20} className="text-blue-500 flex-shrink-0" />;
      case "education":
        return <GraduationCap size={20} className="text-emerald-500 flex-shrink-0" />;
      case "certificate":
        return <Award size={20} className="text-amber-500 flex-shrink-0" />;
      case "project":
        return <FolderKanban size={20} className="text-purple-500 flex-shrink-0" />;
      case "recommendation":
        return <MessageSquareQuote size={20} className="text-rose-500 flex-shrink-0" />;
      default:
        return <Award size={20} className="text-blue-500 flex-shrink-0" />;
    }
  };

  const isEmpty = !section.items || section.items.length === 0;

  if (isEmpty && section.type !== "recommendation") return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          {getIcon()}
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{section.title}</h2>
        </div>
        {((section.type !== "recommendation" && isOwnProfile) || 
          (section.type === "recommendation" && !isOwnProfile)) && (
          <button
            onClick={onAddItem}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
            title={section.type === "recommendation" ? "Escrever recomendação" : `Adicionar item em ${section.title}`}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Items list */}
      {isEmpty ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
          {isOwnProfile 
            ? "Nenhuma recomendação recebida ainda." 
            : `Nenhuma recomendação recebida ainda. Seja o primeiro a recomendar ${profileFullName || "este colaborador"}!`
          }
        </p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {section.items.map((item) => (
            <div key={item.id} className={`py-4 first:pt-0 last:pb-0 relative flex justify-between items-start group`}>
              <div className="space-y-1 pr-6 flex-1">
                {/* Title & Link */}
                <div className="flex items-center flex-wrap gap-x-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">{item.title}</h3>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-450 dark:hover:text-blue-350 transition-colors inline-flex items-center space-x-0.5 text-xs font-semibold hover:underline"
                    >
                      <span>Ver</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                {/* Subtitle */}
                {item.subtitle && (
                  <p className="text-xs font-semibold text-slate-650 dark:text-slate-350">{item.subtitle}</p>
                )}

                {/* Date */}
                {(item.startDate || item.endDate) && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {item.startDate} {item.startDate && item.endDate && "–"} {item.endDate}
                  </p>
                )}

                {/* Description */}
                {item.description && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mt-2 select-text font-normal">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Edit Button (only owner can edit/moderate recommendations left on their profile) */}
              {isOwnProfile && (
                <button
                  onClick={() => onEditItem(item)}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg opacity-80 group-hover:opacity-100 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                  title="Editar item"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
