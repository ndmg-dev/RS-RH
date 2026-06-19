import React from "react";
import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm flex flex-col items-center text-center space-y-5 max-w-md mx-auto my-12 transition-colors duration-300">
      <div className="bg-blue-50 dark:bg-blue-950/45 p-4 rounded-full text-blue-500 dark:text-blue-400">
        <Compass size={48} className="animate-spin-slow" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Página Não Encontrada</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          O endereço que você tentou acessar não existe ou foi removido. Verifique o caminho e tente novamente.
        </p>
      </div>
      <Link
        to="/feed"
        className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold shadow-sm transition-colors cursor-pointer"
      >
        <Home size={16} />
        <span>Voltar para o Início</span>
      </Link>
    </div>
  );
};
