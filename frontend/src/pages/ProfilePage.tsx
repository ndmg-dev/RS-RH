import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersService } from "../features/users/users.service";
import { UserProfile, CustomSection, CustomSectionItem } from "../types";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileAboutCard } from "../components/profile/ProfileAboutCard";
import { ProfileSkillsCard } from "../components/profile/ProfileSkillsCard";
import { ProfileCustomSectionCard } from "../components/profile/ProfileCustomSectionCard";
import { SectionItemModal } from "../components/profile/SectionItemModal";
import { RightInfoPanel } from "../components/layout/RightInfoPanel";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { authStorage } from "../lib/auth-storage";
import { ArrowLeft, X } from "lucide-react";
import { getFriendlyApiError } from "../utils/errors";

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSectionSelectOpen, setIsSectionSelectOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<"education" | "experience" | "certificate" | "project" | "recommendation" | "custom" | "">("");
  const [itemToEdit, setItemToEdit] = useState<CustomSectionItem | null>(null);

  const currentUser = authStorage.getUser();
  const targetId = userId || "me";
  const isOwnProfile = currentUser?.id === profile?.id || targetId === "me";

  const parsedSections = useMemo<CustomSection[]>(() => {
    if (!profile || !profile.customSections) return [];
    try {
      return JSON.parse(profile.customSections) as CustomSection[];
    } catch {
      return [];
    }
  }, [profile]);

  const displaySections = useMemo<CustomSection[]>(() => {
    const sections = [...parsedSections];
    const hasRecommendation = sections.some(s => s.type === "recommendation");
    if (!hasRecommendation) {
      sections.push({
        type: "recommendation",
        title: "Recomendações",
        items: []
      });
    }
    return sections;
  }, [parsedSections]);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersService.getUserProfile(targetId);
      setProfile(data);
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [targetId]);

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

  const saveSections = async (updatedSections: CustomSection[]) => {
    if (!profile) return;
    try {
      const jsonString = JSON.stringify(updatedSections);
      const updated = await usersService.updateUserProfile(profile.id, {
        customSections: jsonString
      });
      setProfile(updated);
    } catch (err) {
      alert("Falha ao salvar as alterações do perfil.");
    }
  };

  const handleSaveItem = async (formData: Omit<CustomSectionItem, "id"> & { id?: string }) => {
    if (!profile || !selectedSectionType) return;

    const sectionsCopy = [...parsedSections];
    let section = sectionsCopy.find(s => s.type === selectedSectionType);

    if (!section) {
      const titlesMap: Record<string, string> = {
        experience: "Experiência Profissional",
        education: "Formação Acadêmica",
        certificate: "Licenças e certificados",
        project: "Projetos",
        recommendation: "Recomendações"
      };
      section = {
        type: selectedSectionType,
        title: titlesMap[selectedSectionType] || "Seção Personalizada",
        items: []
      };
      sectionsCopy.push(section);
    }

    if (formData.id) {
      section.items = section.items.map(item => 
        item.id === formData.id ? { ...item, ...formData } : item
      );
    } else {
      const newItem: CustomSectionItem = {
        ...formData,
        id: "item-" + Date.now()
      };
      section.items.push(newItem);
    }

    await saveSections(sectionsCopy);
    setIsItemModalOpen(false);
    setItemToEdit(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!profile || !selectedSectionType) return;

    const sectionsCopy = parsedSections.map(s => {
      if (s.type === selectedSectionType) {
        return {
          ...s,
          items: s.items.filter(item => item.id !== itemId)
        };
      }
      return s;
    }).filter(s => s.items.length > 0);

    await saveSections(sectionsCopy);
    setIsItemModalOpen(false);
    setItemToEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* Back to feed button on top for easier navigation */}
      <div className="flex items-center">
        <button
          onClick={() => navigate("/feed")}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Feed</span>
        </button>
      </div>

      {isLoading && <LoadingState type="profile" />}

      {error && !isLoading && (
        <ErrorState message={error} onRetry={loadProfile} />
      )}

      {!isLoading && !error && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Main profile section */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileHeader 
              profile={profile} 
              currentUser={currentUser} 
              onAddSectionClick={() => setIsSectionSelectOpen(true)}
            />
            <ProfileAboutCard profile={profile} />
            
            {/* Render Custom Sections */}
            {displaySections.map(section => (
              <ProfileCustomSectionCard
                key={section.type}
                section={section}
                isOwnProfile={isOwnProfile}
                profileFullName={profile.fullName}
                onAddItem={() => {
                  setSelectedSectionType(section.type);
                  setItemToEdit(null);
                  setIsItemModalOpen(true);
                }}
                onEditItem={(item) => {
                  setSelectedSectionType(section.type);
                  setItemToEdit(item);
                  setIsItemModalOpen(true);
                }}
              />
            ))}

            <ProfileSkillsCard profile={profile} />
          </div>

          {/* Right column: Corporate widgets */}
          <div className="lg:col-span-1">
            <RightInfoPanel />
          </div>
        </div>
      )}

      {/* Select Section Type Modal */}
      {isSectionSelectOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsSectionSelectOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Adicionar seção ao perfil</h3>
              <button onClick={() => setIsSectionSelectOpen(false)} className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button 
                onClick={() => {
                  setSelectedSectionType("experience");
                  setItemToEdit(null);
                  setIsSectionSelectOpen(false);
                  setIsItemModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-semibold border border-transparent hover:border-slate-100 dark:hover:border-slate-750 flex items-center justify-between cursor-pointer group"
              >
                <span>Experiência Profissional</span>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold group-hover:scale-105 transition-transform">+ Adicionar</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedSectionType("education");
                  setItemToEdit(null);
                  setIsSectionSelectOpen(false);
                  setIsItemModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-semibold border border-transparent hover:border-slate-100 dark:hover:border-slate-750 flex items-center justify-between cursor-pointer group"
              >
                <span>Formação Acadêmica</span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 px-2 py-0.5 rounded font-bold group-hover:scale-105 transition-transform">+ Adicionar</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedSectionType("certificate");
                  setItemToEdit(null);
                  setIsSectionSelectOpen(false);
                  setIsItemModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-semibold border border-transparent hover:border-slate-100 dark:hover:border-slate-750 flex items-center justify-between cursor-pointer group"
              >
                <span>Licenças e certificados</span>
                <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold group-hover:scale-105 transition-transform">+ Adicionar</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedSectionType("project");
                  setItemToEdit(null);
                  setIsSectionSelectOpen(false);
                  setIsItemModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-semibold border border-transparent hover:border-slate-100 dark:hover:border-slate-750 flex items-center justify-between cursor-pointer group"
              >
                <span>Projetos</span>
                <span className="text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-bold group-hover:scale-105 transition-transform">+ Adicionar</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedSectionType("recommendation");
                  setItemToEdit(null);
                  setIsSectionSelectOpen(false);
                  setIsItemModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-semibold border border-transparent hover:border-slate-100 dark:hover:border-slate-750 flex items-center justify-between cursor-pointer group"
              >
                <span>Recomendações</span>
                <span className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-bold group-hover:scale-105 transition-transform">+ Adicionar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Item Form Modal */}
      <SectionItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        sectionType={selectedSectionType}
        itemToEdit={itemToEdit}
        currentUserFullName={currentUser?.fullName}
      />
    </div>
  );
};
