import React from "react";
import { MessageSquareOff } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Nenhuma publicação encontrada",
  description = "Que tal compartilhar uma nova atualização com a equipe?"
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center text-center space-y-4 py-12 transition-colors duration-300">
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full text-slate-400 dark:text-slate-500">
        <MessageSquareOff size={40} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      </div>
    </div>
  );
};
