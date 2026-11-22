import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AgeLevel, AppState, AudioSettings, AvatarId, ChildProfile, PillarId } from '../types';
import {
  createEmptyStats,
  createProfile,
  loadAppState,
  pickNextSticker,
  saveAppState,
} from './storage';
import { playSfx, setMasterVolume, speak, subscribeSpeaking, type SpeakOptions, type SfxType } from '../utils/audio';

/** Recompensa retornada ao concluir uma rodada de atividade. */
interface RoundReward {
  /** Quantidade de estrelas concedidas ao finalizar a rodada. */
  starsAwarded: number;
  /** ID da nova figurinha desbloqueada, ou `null` se o álbum já estiver completo. */
  newStickerId: string | null;
}

/** Contrato público do contexto global da aplicação (`useApp`). */
interface AppContextValue {
  /** Estado global completo persistido em `localStorage`. */
  state: AppState;
  /** Perfil infantil atualmente ativo. */
  activeProfile: ChildProfile;
  /** Indica se a narração da Lumi está em reprodução no momento. */
  isSpeaking: boolean;
  /** Seleciona outro perfil infantil pelo seu ID. */
  setActiveProfile: (id: string) => void;
  /** Cria e ativa um novo perfil infantil. */
  addProfile: (name: string, avatar: AvatarId, ageLevel: AgeLevel) => void;
  /** Atualiza nome, avatar ou faixa etária de um perfil existente. */
  updateProfile: (id: string, patch: Partial<Pick<ChildProfile, 'name' | 'avatar' | 'ageLevel'>>) => void;
  /** Remove um perfil infantil (mantendo ao menos 1 perfil ativo). */
  deleteProfile: (id: string) => void;
  /** Zera estrelas, estatísticas e figurinhas de um perfil para o estado inicial. */
  resetProfileProgress: (id: string) => void;
  /** Atualiza as preferências globais de áudio e volume. */
  updateAudio: (patch: Partial<AudioSettings>) => void;
  /** Registra um acerto individual e soma 1 estrela no pilar informado. */
  recordCorrectAnswer: (pillar: PillarId) => void;
  /** Conclui uma rodada, concede estrelas bônus e sorteia uma nova figurinha. */
  completeRound: (pillar: PillarId, starsAwarded?: number) => RoundReward;
  /** Reproduz uma fala da Lumi respeitando as configurações de áudio do app. */
  say: (text: string, opts?: Pick<SpeakOptions, 'queue' | 'onEnd'>) => void;
  /** Dispara um efeito sonoro sintetizado se os efeitos estiverem habilitados. */
  sfx: (type: SfxType) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Provedor global de estado do EduKids (perfis, progresso, áudio e narração). */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  useEffect(() => {
    setMasterVolume(state.audio.volume ?? 0.85);
  }, [state.audio.volume]);

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

  const say = (text: string, opts?: Pick<SpeakOptions, 'queue' | 'onEnd'>) =>
    speak(text, {
      enabled: state.audio.voiceEnabled,
      speed: state.audio.voiceSpeed,
      ageLevel: activeProfile.ageLevel,
      queue: opts?.queue,
      onEnd: opts?.onEnd,
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

/** Hook para acessar o estado global, perfil ativo e ações do EduKids. */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
