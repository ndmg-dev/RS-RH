import React from "react";
import { Link } from "react-router-dom";
import { UserProfile, AuthUser } from "../../types";
import { MapPin, User, Edit3, Briefcase } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
  currentUser: AuthUser | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, currentUser }) => {
  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-800 relative"></div>

      {/* Avatar & Action Button Area */}
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-24 mb-4">
          {/* Avatar wrapper */}
          <div className="relative">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-900 object-cover bg-white dark:bg-slate-900 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-md">
                <User size={64} />
              </div>
            )}
          </div>

          {/* Edit Profile button */}
          {isOwnProfile && (
            <Link
              to="/profile/me/edit"
              className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-bold rounded-full text-sm transition-colors shadow-sm self-stretch sm:self-auto text-center justify-center"
            >
              <Edit3 size={16} />
              <span>Editar perfil</span>
            </Link>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">{profile.fullName}</h1>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase border border-slate-200 dark:border-slate-700">
              {profile.role}
            </span>
          </div>

          <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-slate-600 dark:text-slate-400">
            {profile.jobTitle && (
              <span className="flex items-center space-x-1">
                <Briefcase size={16} className="text-slate-400 dark:text-slate-500" />
                <span>{profile.jobTitle}</span>
              </span>
            )}
            {profile.department && (
              <span className="text-slate-400 dark:text-slate-500 font-medium">
                Setor: <span className="text-slate-700 dark:text-slate-300 font-semibold">{profile.department}</span>
              </span>
            )}
            {profile.location && (
              <span className="flex items-center space-x-1">
                <MapPin size={16} className="text-slate-400 dark:text-slate-500" />
                <span>{profile.location}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
