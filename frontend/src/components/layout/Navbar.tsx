import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Home, User, LogOut } from "lucide-react";
import { authStorage } from "../../lib/auth-storage";
import { canModerateContent } from "../../utils/permissions";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authStorage.getUser();

  const handleLogout = () => {
    authStorage.clearAll();
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Left Side: Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/feed" className="flex items-center space-x-2 text-brand-primary font-black text-xl tracking-tight">
            <span className="bg-brand-primary text-white px-2 py-1 rounded font-black text-sm">MG</span>
            <span className="hidden sm:inline text-slate-800 dark:text-slate-200 text-base font-bold">Rede MGCA</span>
          </Link>
        </div>

        {/* Center/Right: Navigation Links */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          <Link
            to="/feed"
            className={`flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-2 px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
              isActive("/feed")
                ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title="Página Inicial"
          >
            <Home size={18} />
            <span className="hidden xs:inline">Início</span>
          </Link>

          <Link
            to="/profile/me"
            className={`flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-2 px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
              isActive("/profile/me")
                ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title="Meu Perfil"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-[18px] h-[18px] rounded-full object-cover"
              />
            ) : (
              <User size={18} />
            )}
            <span className="hidden xs:inline">Perfil</span>
          </Link>

          {/* Moderation Link (only for ADMIN / MODERATOR) */}
          {canModerateContent(user) && (
            <Link
              to="/admin/moderation"
              className={`flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-2 px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                isActive("/admin/moderation")
                  ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              }`}
              title="Moderação"
            >
              <Shield size={18} />
              <span className="hidden xs:inline">Moderação</span>
            </Link>
          )}

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden xs:block"></div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-2 px-3 py-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            title="Sair da Conta"
          >
            <LogOut size={18} />
            <span className="hidden xs:inline">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
