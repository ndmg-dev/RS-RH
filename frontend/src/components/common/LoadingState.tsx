import React from "react";

interface LoadingStateProps {
  type?: "feed" | "profile" | "spinner";
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type = "feed" }) => {
  if (type === "spinner") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // default to feed skeleton (LinkedIn style cards)
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
          </div>
          <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded w-full mt-4"></div>
        </div>
      ))}
    </div>
  );
};
