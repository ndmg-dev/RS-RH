import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usersService } from "../features/users/users.service";
import { useAuth } from "../features/auth/useAuth";
import { Loader2, ArrowLeft, Save, Briefcase, MapPin, User, LayoutGrid, Image } from "lucide-react";
import { getFriendlyApiError } from "../utils/errors";

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo deve ter pelo menos 3 caracteres." }),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, { message: "A biografia pode ter no máximo 500 caracteres." }).optional(),
  avatarUrl: z.string().refine(val => {
    if (!val) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Insira uma URL válida para o avatar ou deixe em branco." }).optional(),
  skillsInput: z.string().optional(),
  theme: z.enum(["LIGHT", "DARK"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      jobTitle: "",
      department: "",
      location: "",
      bio: "",
      avatarUrl: "",
      skillsInput: "",
      theme: "LIGHT",
    }
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usersService.getUserProfile("me");
      setValue("fullName", data.fullName);
      setValue("jobTitle", data.jobTitle || "");
      setValue("department", data.department || "");
      setValue("location", data.location || "");
      setValue("bio", data.bio || "");
      setValue("avatarUrl", data.avatarUrl || "");
      setValue("skillsInput", data.skills ? data.skills.join(", ") : "");
      setValue("theme", data.theme || "LIGHT");
      setError(null);
    } catch {
      setError("Não foi possível carregar as informações do seu perfil.");
    } finally {
      setIsLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        loadProfile();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [loadProfile]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    setError(null);

    // Convert comma-separated string back to array of skills
    const skills = values.skillsInput
      ? values.skillsInput
          .split(",")
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : [];

    try {
      await usersService.updateUserProfile("me", {
        fullName: values.fullName,
        jobTitle: values.jobTitle,
        department: values.department,
        location: values.location,
        bio: values.bio,
        avatarUrl: values.avatarUrl,
        skills,
        theme: values.theme,
      });

      // Synchronize changes to Auth context
      refreshUser();

      // Redirect to my profile
      navigate("/profile/me");
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header back navigation */}
      <div className="flex items-center">
        <button
          onClick={() => navigate("/profile/me")}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Perfil</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Editar Perfil Profissional</h1>
          <span className="text-xs text-slate-400 dark:text-slate-500">Rede MGCA</span>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-2 text-slate-500 dark:text-slate-400">
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
            <span className="text-sm font-medium">Carregando seus dados...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg p-3.5 text-xs text-red-800 dark:text-red-400 font-medium">
                {error}
              </div>
            )}

            {/* Grid Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                  <User size={14} className="text-slate-400 dark:text-slate-500" />
                  <span>Nome Completo</span>
                </label>
                <input
                  type="text"
                  {...register("fullName")}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">{errors.fullName.message}</p>
                )}
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                  <Briefcase size={14} className="text-slate-400 dark:text-slate-500" />
                  <span>Cargo</span>
                </label>
                <input
                  type="text"
                  {...register("jobTitle")}
                  placeholder="Ex: Analista Fiscal Pleno"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                  <LayoutGrid size={14} className="text-slate-400 dark:text-slate-500" />
                  <span>Setor / Departamento</span>
                </label>
                <input
                  type="text"
                  {...register("department")}
                  placeholder="Ex: Fiscal"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                  <MapPin size={14} className="text-slate-400 dark:text-slate-500" />
                  <span>Localização</span>
                </label>
                <input
                  type="text"
                  {...register("location")}
                  placeholder="Ex: São Paulo, SP"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                  <Image size={14} className="text-slate-400 dark:text-slate-500" />
                  <span>URL do Avatar (Foto)</span>
                </label>
                <input
                  type="text"
                  {...register("avatarUrl")}
                  placeholder="Ex: https://images.unsplash.com/..."
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.avatarUrl && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">{errors.avatarUrl.message}</p>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Biografia / Sobre
                </label>
                <textarea
                  {...register("bio")}
                  placeholder="Descreva um pouco sobre suas atividades, metas ou histórico na Mendonça Galvão..."
                  className="mt-1 block w-full min-h-[90px] px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  maxLength={500}
                />
                {errors.bio && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">{errors.bio.message}</p>
                )}
              </div>

              {/* Skills */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Competências (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  {...register("skillsInput")}
                  placeholder="Ex: Balanço Patrimonial, SPED Fiscal, Excel, IFRS"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  Escreva suas competências separadas por vírgula. Nós as organizaremos em blocos no seu perfil.
                </p>
              </div>

              {/* Tema de Preferência */}
              <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  Preferência de Tema / Aparência
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="radio"
                      value="LIGHT"
                      {...register("theme")}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Tema Claro (Padrão)</span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500">Fundo claro clássico da Rede MGCA.</span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="radio"
                      value="DARK"
                      {...register("theme")}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Tema Escuro</span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500">Fundo escuro premium para ambientes de pouca luz.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/profile/me")}
                disabled={isSaving}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full text-sm font-bold flex items-center space-x-2 transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Salvar alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
