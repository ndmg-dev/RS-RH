import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-50 dark:bg-red-950/45 text-red-500' : 'bg-blue-50 dark:bg-blue-950/45 text-brand-primary dark:text-blue-450'}`}>
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer ${
              isDestructive 
                ? "bg-red-600 hover:bg-red-700 shadow-sm shadow-red-100 dark:shadow-none" 
                : "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-100 dark:shadow-none"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
