import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-950/30 p-8 shadow-sm flex flex-col items-center text-center space-y-4 max-w-lg mx-auto my-4 transition-colors duration-300">
      <div className="bg-red-50 dark:bg-red-950/45 p-3 rounded-full text-red-500">
        <AlertCircle size={36} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Ops! Algo deu errado</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <RotateCcw size={16} />
          <span>Tentar novamente</span>
        </button>
      )}
    </div>
  );
};
