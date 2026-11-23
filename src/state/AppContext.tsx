import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AgeLevel,
  AppState,
  AudioSettings,
  AvatarId,
  ChildProfile,
  LumiAccessoryId,
  PillarId,
} from '../types';
import {
  computeNextStreak,
  createEmptyStats,
  createProfile,
  getLocalDateKey,
  getRecommendedPillar,
  loadAppState,
  pickNextGoldenSticker,
  pickNextSticker,
  saveAppState,
  validateAndNormalizeState,
} from './storage';
import {
  playSfx,
  setCalmAudioMode,
  setMasterVolume,
  speak,
  subscribeSpeaking,
  type SpeakOptions,
  type SfxType,
} from '../utils/audio';

/** Recompensa retornada ao concluir uma rodada de atividade. */
export interface RoundReward {
  /** Quantidade de estrelas concedidas ao finalizar a rodada. */
  starsAwarded: number;
  /** ID da nova figurinha desbloqueada, ou `null` se o álbum já estiver completo. */
  newStickerId: string | null;
  /** ID da figurinha promovida a Dourada Brilhante após completar o álbum, ou `null`. */
  newGoldenStickerId?: string | null;
}

/** Contrato público do contexto global da aplicação (`useApp`). */
interface AppContextValue {
  /** Estado global completo persistido em `localStorage`. */
  state: AppState;
  /** Perfil infantil atualmente ativo. */
  activeProfile: ChildProfile;
  /** Pilar recomendado para a "Aventura do Dia" do perfil ativo. */
  recommendedPillar: PillarId;
  /** Indica se o bônus diário da Aventura do Dia já foi conquistado hoje. */
  dailyBonusClaimed: boolean;
  /** Indica se a narração da Lumi está em reprodução no momento. */
  isSpeaking: boolean;
  /** Indica se o Modo Calmo / Sensorial está ativado. */
  calmMode: boolean;
  /** Indica se o limite diário de tempo de tela foi atingido. */
  screenTimeReached: boolean;
  /** Seleciona outro perfil infantil pelo seu ID. */
  setActiveProfile: (id: string) => void;
  /** Cria e ativa um novo perfil infantil. */
  addProfile: (name: string, avatar: AvatarId, ageLevel: AgeLevel) => void;
  /** Atualiza nome, avatar ou faixa etária de um perfil existente. */
  updateProfile: (id: string, patch: Partial<Pick<ChildProfile, 'name' | 'avatar' | 'ageLevel'>>) => void;
  /** Equipa um acessório visual na mascote Lumi do perfil ativo. */
  setLumiAccessory: (accessory: LumiAccessoryId) => void;
  /** Salva uma pintura mágica na galeria do perfil ativo. */
  savePainting: (drawingId: string, label: string, parts: Record<string, string>) => void;
  /** Remove uma pintura salva da galeria do perfil ativo. */
  deletePainting: (paintingId: string) => void;
  /** Atualiza o limite diário de tempo de tela em minutos (0 = sem limite). */
  updateScreenTimeLimit: (limitMinutes: number) => void;
  /** Incrementa o tempo de uso diário em segundos. */
  addPlaySeconds: (seconds: number) => void;
  /** Concede minutos extras de tempo de tela hoje (via Parental Gate). */
  extendScreenTime: (extraMinutes: number) => void;
  /** Remove um perfil infantil (mantendo ao menos 1 perfil ativo). */
  deleteProfile: (id: string) => void;
  /** Zera estrelas, estatísticas e figurinhas de um perfil para o estado inicial. */
  resetProfileProgress: (id: string) => void;
  /** Importa e valida um backup JSON de perfis e configurações. Retorna `true` se bem-sucedido. */
  importBackupState: (raw: unknown) => boolean;
  /** Atualiza as preferências globais de áudio e volume. */
  updateAudio: (patch: Partial<AudioSettings>) => void;
  /** Registra um acerto individual e soma 1 estrela no pilar informado. */
  recordCorrectAnswer: (pillar: PillarId) => void;
  /** Conclui uma rodada, concede estrelas bônus e sorteia uma nova figurinha (ou evolução dourada). */
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

  const calmMode = Boolean(state.audio.calmMode);

  useEffect(() => {
    setCalmAudioMode(calmMode);
  }, [calmMode]);

  useEffect(() => subscribeSpeaking(setIsSpeaking), []);

  const activeProfile = useMemo(() => {
    return state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
  }, [state.profiles, state.activeProfileId]);

  const todayKey = getLocalDateKey();
  const dailyBonusClaimed = activeProfile.dailyBonusDate === todayKey;
  const recommendedPillar = useMemo(() => {
    if (dailyBonusClaimed && activeProfile.dailyBonusPillar) {
      return activeProfile.dailyBonusPillar;
    }
    return getRecommendedPillar(activeProfile);
  }, [activeProfile, dailyBonusClaimed]);

  const screenTimeReached = useMemo(() => {
    const st = state.screenTime;
    if (!st || st.limitMinutes <= 0) return false;
    if (st.usageDate !== todayKey) return false;
    const allowedSec = (st.limitMinutes + (st.extraMinutesToday || 0)) * 60;
    return st.usedSecondsToday >= allowedSec;
  }, [state.screenTime, todayKey]);

  const unlockedStickersRef = useRef<string[]>(activeProfile.unlockedStickers);
  unlockedStickersRef.current = activeProfile.unlockedStickers;
  const goldenStickersRef = useRef<string[]>(activeProfile.goldenStickers || []);
  goldenStickersRef.current = activeProfile.goldenStickers || [];

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

  const setLumiAccessory = (accessory: LumiAccessoryId) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId ? { ...p, lumiAccessory: accessory } : p
      ),
    }));
  };

  const savePainting = (drawingId: string, label: string, parts: Record<string, string>) => {
    const entry = {
      id: `paint-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      drawingId,
      label,
      parts: { ...parts },
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId
          ? { ...p, savedPaintings: [entry, ...(p.savedPaintings || [])].slice(0, 12) }
          : p
      ),
    }));
  };

  const deletePainting = (paintingId: string) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId
          ? {
              ...p,
              savedPaintings: (p.savedPaintings || []).filter((item) => item.id !== paintingId),
            }
          : p
      ),
    }));
  };

  const updateScreenTimeLimit = (limitMinutes: number) => {
    const today = getLocalDateKey();
    setState((prev) => {
      const cur = prev.screenTime;
      const sameDay = cur?.usageDate === today;
      return {
        ...prev,
        screenTime: {
          limitMinutes: Math.max(0, Math.min(180, limitMinutes)),
          usedSecondsToday: sameDay ? cur?.usedSecondsToday || 0 : 0,
          usageDate: today,
          extraMinutesToday: sameDay ? cur?.extraMinutesToday || 0 : 0,
        },
      };
    });
  };

  const addPlaySeconds = useCallback((seconds: number) => {
    if (seconds <= 0) return;
    const today = getLocalDateKey();
    setState((prev) => {
      const cur = prev.screenTime;
      if (!cur || cur.limitMinutes <= 0) return prev;
      const sameDay = cur.usageDate === today;
      return {
        ...prev,
        screenTime: {
          ...cur,
          usageDate: today,
          usedSecondsToday: (sameDay ? cur.usedSecondsToday : 0) + seconds,
          extraMinutesToday: sameDay ? cur.extraMinutesToday : 0,
        },
      };
    });
  }, []);

  const extendScreenTime = (extraMinutes: number) => {
    const today = getLocalDateKey();
    setState((prev) => {
      const cur = prev.screenTime || {
        limitMinutes: 0,
        usedSecondsToday: 0,
        usageDate: today,
        extraMinutesToday: 0,
      };
      const sameDay = cur.usageDate === today;
      return {
        ...prev,
        screenTime: {
          ...cur,
          usageDate: today,
          usedSecondsToday: sameDay ? cur.usedSecondsToday : 0,
          extraMinutesToday: (sameDay ? cur.extraMinutesToday : 0) + extraMinutes,
        },
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
              goldenStickers: [],
              lumiAccessory: 'none',
              savedPaintings: [],
              streakDays: 0,
              lastActiveDate: undefined,
              recentHistory: [],
              stats: createEmptyStats(),
              dailyBonusDate: undefined,
              dailyBonusPillar: undefined,
            }
          : p
      ),
    }));
  };

  const importBackupState = (raw: unknown): boolean => {
    const normalized = validateAndNormalizeState(raw);
    if (!normalized) return false;
    setState(normalized);
    return true;
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
    const isDailyBonus = pillar === recommendedPillar && !dailyBonusClaimed;
    const totalStars = starsAwarded + (isDailyBonus ? 2 : 0);
    const newStickerId = pickNextSticker(unlockedStickersRef.current);
    let newGoldenStickerId: string | null = null;

    if (newStickerId && !unlockedStickersRef.current.includes(newStickerId)) {
      unlockedStickersRef.current = [...unlockedStickersRef.current, newStickerId];
    } else if (!newStickerId) {
      newGoldenStickerId = pickNextGoldenSticker(
        unlockedStickersRef.current,
        goldenStickersRef.current
      );
      if (newGoldenStickerId && !goldenStickersRef.current.includes(newGoldenStickerId)) {
        goldenStickersRef.current = [...goldenStickersRef.current, newGoldenStickerId];
      }
    }

    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== prev.activeProfileId) return p;
        const current = p.stats[pillar];
        const nextStickers =
          newStickerId && !p.unlockedStickers.includes(newStickerId)
            ? [...p.unlockedStickers, newStickerId]
            : p.unlockedStickers;
        const currentGolden = p.goldenStickers || [];
        const nextGolden =
          newGoldenStickerId && !currentGolden.includes(newGoldenStickerId)
            ? [...currentGolden, newGoldenStickerId]
            : currentGolden;
        const nextStreak = computeNextStreak(p.lastActiveDate, p.streakDays || 0, todayKey);
        const nextHistory = [
          { pillar, completedAt: nowIso, starsEarned: totalStars },
          ...(p.recentHistory || []),
        ].slice(0, 10);

        return {
          ...p,
          stars: p.stars + totalStars,
          unlockedStickers: nextStickers,
          goldenStickers: nextGolden,
          streakDays: nextStreak,
          lastActiveDate: todayKey,
          recentHistory: nextHistory,
          ...(isDailyBonus ? { dailyBonusDate: todayKey, dailyBonusPillar: pillar } : {}),
          stats: {
            ...p.stats,
            [pillar]: {
              ...current,
              completedRounds: current.completedRounds + 1,
              starsEarned: current.starsEarned + totalStars,
              lastPlayedAt: nowIso,
            },
          },
        };
      }),
    }));
    return { starsAwarded: totalStars, newStickerId, newGoldenStickerId };
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
        recommendedPillar,
        dailyBonusClaimed,
        isSpeaking,
        calmMode,
        screenTimeReached,
        setActiveProfile,
        addProfile,
        updateProfile,
        setLumiAccessory,
        savePainting,
        deletePainting,
        updateScreenTimeLimit,
        addPlaySeconds,
        extendScreenTime,
        deleteProfile,
        resetProfileProgress,
        importBackupState,
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
