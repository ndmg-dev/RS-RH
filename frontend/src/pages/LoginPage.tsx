import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { getFriendlyApiError } from "../utils/errors";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route redirect destination after successful login
  const from = location.state?.from?.pathname || "/feed";
  const sessionExpired = new URLSearchParams(location.search).get("expired") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email.trim(), password.trim());
      navigate(from, { replace: true });
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to log in with mock roles
  const handleQuickLogin = (mockEmail: string) => {
    setEmail(mockEmail);
    setPassword("senha123");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 items-center transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center bg-blue-600 text-white font-black text-2xl h-12 w-12 rounded-lg shadow-md">
          MG
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Rede MGCA</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Rede social corporativa da Mendonça Galvão Contadores Associados
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-xl sm:px-10 space-y-6 transition-colors duration-300">
          
          {sessionExpired && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-400 font-medium">
              Sua sessão expirou por inatividade. Faça login novamente.
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-xs text-red-800 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                E-mail Corporativo
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@mendoncagalvao.com.br"
                  className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Mock Logins for testing */}
          {import.meta.env.VITE_USE_MOCKS === "true" && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck size={14} className="text-blue-500 dark:text-blue-400" />
                <span>Simular Contas (Mocks Ativos)</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-normal">
                Clique em um dos e-mails abaixo para preencher os dados de teste correspondentes:
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("eduardo@mendoncagalvao.com.br")}
                  className="text-left text-xs bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded p-2 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <span className="font-bold">Eduardo Melo</span> - Desenvolvedor <span className="text-blue-650 dark:text-blue-400 font-bold">(ADMIN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("mariana.silva@mendoncagalvao.com.br")}
                  className="text-left text-xs bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded p-2 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <span className="font-bold">Mariana Silva</span> - Coord. RH <span className="text-teal-600 dark:text-teal-400 font-bold">(MODERATOR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("roberto.santos@mendoncagalvao.com.br")}
                  className="text-left text-xs bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded p-2 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <span className="font-bold">Roberto Santos</span> - Contábil <span className="text-indigo-600 dark:text-indigo-400 font-bold">(USER)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
