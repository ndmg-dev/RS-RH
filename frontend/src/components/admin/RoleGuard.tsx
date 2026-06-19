import React from "react";
import { authStorage } from "../../lib/auth-storage";
import { Role } from "../../types";
import { ShieldX } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
  hideOnly?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  hideOnly = false
}) => {
  const user = authStorage.getUser();

  const isAllowed = user && allowedRoles.includes(user.role);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (hideOnly) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default unauthorized screen
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center space-y-4 max-w-md mx-auto my-8">
      <div className="bg-rose-50 p-3.5 rounded-full text-rose-500">
        <ShieldX size={36} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800">Acesso Restrito</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Você não tem permissão para acessar esta área da Rede MGCA.
        </p>
      </div>
    </div>
  );
};
