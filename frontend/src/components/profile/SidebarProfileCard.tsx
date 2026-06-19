import React from "react";
import { Link } from "react-router-dom";
import { authStorage } from "../../lib/auth-storage";
import { User } from "lucide-react";

export const SidebarProfileCard: React.FC = () => {
  const user = authStorage.getUser();

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col items-center text-center transition-colors duration-300">
      {/* Cover Accent */}
      <div className="h-14 w-full bg-blue-600"></div>

      {/* Avatar (overlapping the cover) */}
      <div className="-mt-9 mb-3 relative">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-18 h-18 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm bg-white dark:bg-slate-900"
          />
        ) : (
          <div className="w-18 h-18 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm">
            <User size={30} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-6 w-full">
        <Link 
          to="/profile/me" 
          className="font-bold text-slate-800 dark:text-slate-200 hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-base leading-snug block"
        >
          {user.fullName}
        </Link>
        
        {user.jobTitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1 leading-snug">
            {user.jobTitle}
          </p>
        )}
        
        {user.department && (
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider mt-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-0.5 px-2.5 rounded-full inline-block">
            {user.department}
          </p>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
          <Link 
            to="/profile/me" 
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold block text-center"
          >
            Visualizar meu perfil
          </Link>
        </div>
      </div>
    </div>
  );
};
