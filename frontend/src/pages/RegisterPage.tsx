import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { getFriendlyApiError } from "../utils/errors";
import { Loader2, Mail, Lock, User, Briefcase, Building } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido").refine((val) => val.endsWith("@mendoncagalvao.com.br"), {
    message: "Apenas e-mails com domínio @mendoncagalvao.com.br são permitidos",
  }),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
  department: z.string().min(1, "Departamento é obrigatório"),
  jobTitle: z.string().min(2, "Cargo é obrigatório"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await authRegister(data);
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(getFriendlyApiError(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 items-center transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center bg-blue-600 text-white font-black text-2xl h-12 w-12 rounded-lg shadow-md">
          MG
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Criar Conta</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Exclusivo para colaboradores Mendonça Galvão
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-xl sm:px-10 space-y-6 transition-colors duration-300">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-xs text-red-800 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Nome Completo
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  {...register("fullName")}
                  placeholder="Seu nome completo"
                  className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                E-mail Corporativo
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="nome@mendoncagalvao.com.br"
                  className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Confirmar Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Departamento
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Building size={16} />
                </div>
                <select
                  {...register("department")}
                  className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Selecione um departamento</option>
                  <option value="Contabilidade">Contabilidade</option>
                  <option value="Fiscal">Fiscal</option>
                  <option value="Pessoal">Departamento Pessoal</option>
                  <option value="Tecnologia">Tecnologia (TI)</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Atendimento">Atendimento</option>
                </select>
              </div>
              {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Cargo
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Briefcase size={16} />
                </div>
                <input
                  type="text"
                  {...register("jobTitle")}
                  placeholder="Ex: Analista Fiscal"
                  className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              {errors.jobTitle && <p className="mt-1 text-xs text-red-500">{errors.jobTitle.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Criando conta...</span>
                  </span>
                ) : (
                  <span>Criar Conta</span>
                )}
              </button>
            </div>
            
            <div className="text-center pt-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">Já tem uma conta? </span>
              <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Fazer login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
