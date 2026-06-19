import React from "react";
import { UserProfile } from "../../types";

interface ProfileAboutCardProps {
  profile: UserProfile;
}

export const ProfileAboutCard: React.FC<ProfileAboutCardProps> = ({ profile }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-colors duration-300">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sobre</h2>
      {profile.bio ? (
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhuma descrição informada pelo colaborador.</p>
      )}
    </div>
  );
};
