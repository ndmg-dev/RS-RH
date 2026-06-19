import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersService } from "../features/users/users.service";
import { UserProfile } from "../types";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileAboutCard } from "../components/profile/ProfileAboutCard";
import { ProfileSkillsCard } from "../components/profile/ProfileSkillsCard";
import { RightInfoPanel } from "../components/layout/RightInfoPanel";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { authStorage } from "../lib/auth-storage";
import { ArrowLeft } from "lucide-react";
import { getFriendlyApiError } from "../utils/errors";

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = authStorage.getUser();
  const targetId = userId || "me";

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
            <ProfileHeader profile={profile} currentUser={currentUser} />
            <ProfileAboutCard profile={profile} />
            <ProfileSkillsCard profile={profile} />
          </div>

          {/* Right column: Corporate widgets */}
          <div className="lg:col-span-1">
            <RightInfoPanel />
          </div>
        </div>
      )}
    </div>
  );
};
