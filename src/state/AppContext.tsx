import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AgeLevel, AppState, AudioSettings, AvatarId, ChildProfile, PillarId } from '../types';
import {
  createEmptyStats,
  createProfile,
  loadAppState,
  pickNextSticker,
  saveAppState,
} from './storage';
import { playSfx, speak, subscribeSpeaking, type SpeakOptions, type SfxType } from '../utils/audio';

interface RoundReward {
  starsAwarded: number;
  newStickerId: string | null;
}

interface AppContextValue {
  state: AppState;
  activeProfile: ChildProfile;
  isSpeaking: boolean;
  setActiveProfile: (id: string) => void;
  addProfile: (name: string, avatar: AvatarId, ageLevel: AgeLevel) => void;
  updateProfile: (id: string, patch: Partial<Pick<ChildProfile, 'name' | 'avatar' | 'ageLevel'>>) => void;
  deleteProfile: (id: string) => void;
  resetProfileProgress: (id: string) => void;
  updateAudio: (patch: Partial<AudioSettings>) => void;
  recordCorrectAnswer: (pillar: PillarId) => void;
  completeRound: (pillar: PillarId, starsAwarded?: number) => RoundReward;
  say: (text: string, opts?: Pick<SpeakOptions, 'queue'>) => void;
  sfx: (type: SfxType) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  useEffect(() => subscribeSpeaking(setIsSpeaking), []);

  const activeProfile = useMemo(() => {
    return state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
  }, [state.profiles, state.activeProfileId]);

  const unlockedStickersRef = useRef<string[]>(activeProfile.unlockedStickers);
  unlockedStickersRef.current = activeProfile.unlockedStickers;

  const setActiveProfile = (id: string) => {
    setState((prev) => ({ ...prev, activeProfileId: id }));
  };

  const addProfile = (name: string, avatar: AvatarId, ageLevel: AgeLevel) => {
    const profile = createProfile(name, avatar, ageLevel);
    setState((prev) => ({
      ...prev,
      activeProfileId: profile.id,
      profiles: [...prev.profiles, profile],
    }));
  };

  const updateProfile = (
    id: string,
    patch: Partial<Pick<ChildProfile, 'name' | 'avatar' | 'ageLevel'>>
  ) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const deleteProfile = (id: string) => {
    setState((prev) => {
      if (prev.profiles.length <= 1) return prev;
      const nextProfiles = prev.profiles.filter((p) => p.id !== id);
      return {
        ...prev,
        activeProfileId:
          prev.activeProfileId === id ? nextProfiles[0].id : prev.activeProfileId,
        profiles: nextProfiles,
      };
    });
  };

  const resetProfileProgress = (id: string) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === id
          ? {
              ...p,
              stars: 0,
              unlockedStickers: ['stk-abelha'],
              stats: createEmptyStats(),
            }
          : p
      ),
    }));
  };

  const updateAudio = (patch: Partial<AudioSettings>) => {
    setState((prev) => ({
      ...prev,
      audio: { ...prev.audio, ...patch },
    }));
  };

  const recordCorrectAnswer = (pillar: PillarId) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== prev.activeProfileId) return p;
        const current = p.stats[pillar];
        return {
          ...p,
          stars: p.stars + 1,
          stats: {
            ...p.stats,
            [pillar]: {
              ...current,
              correctAnswers: current.correctAnswers + 1,
              starsEarned: current.starsEarned + 1,
              lastPlayedAt: new Date().toISOString(),
            },
          },
        };
      }),
    }));
  };

  const completeRound = (pillar: PillarId, starsAwarded = 3): RoundReward => {
    const newStickerId = pickNextSticker(unlockedStickersRef.current);
    if (newStickerId && !unlockedStickersRef.current.includes(newStickerId)) {
      unlockedStickersRef.current = [...unlockedStickersRef.current, newStickerId];
    }
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== prev.activeProfileId) return p;
        const current = p.stats[pillar];
        const nextStickers =
          newStickerId && !p.unlockedStickers.includes(newStickerId)
            ? [...p.unlockedStickers, newStickerId]
            : p.unlockedStickers;
        return {
          ...p,
          stars: p.stars + starsAwarded,
          unlockedStickers: nextStickers,
          stats: {
            ...p.stats,
            [pillar]: {
              ...current,
              completedRounds: current.completedRounds + 1,
              starsEarned: current.starsEarned + starsAwarded,
              lastPlayedAt: new Date().toISOString(),
            },
          },
        };
      }),
    }));
    return { starsAwarded, newStickerId };
  };

  const say = (text: string, opts?: Pick<SpeakOptions, 'queue'>) =>
    speak(text, {
      enabled: state.audio.voiceEnabled,
      speed: state.audio.voiceSpeed,
      ageLevel: activeProfile.ageLevel,
      voiceURI: state.audio.voiceURI,
      queue: opts?.queue,
    });
  const sfx = (type: SfxType) => playSfx(type, state.audio.sfxEnabled);

  return (
    <AppContext.Provider
      value={{
        state,
        activeProfile,
        isSpeaking,
        setActiveProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        resetProfileProgress,
        updateAudio,
        recordCorrectAnswer,
        completeRound,
        say,
        sfx,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
