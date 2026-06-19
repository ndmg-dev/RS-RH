import React from "react";
import { UserProfile } from "../../types";

interface ProfileSkillsCardProps {
  profile: UserProfile;
}

export const ProfileSkillsCard: React.FC<ProfileSkillsCardProps> = ({ profile }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-colors duration-300">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Competências</h2>
      {profile.skills && profile.skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/50"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhuma competência adicionada.</p>
      )}
    </div>
  );
};
