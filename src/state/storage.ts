import type { AgeLevel, AppState, AvatarId, ChildProfile, PillarId, PillarStats } from '../types';
import { STICKERS } from '../data/catalog';

/** Chave de versionamento usada no `localStorage` do navegador. */
export const STORAGE_KEY = 'edukids_state_v1';

/** Cria um mapa inicial zerado de estatísticas para todos os 8 pilares. */
export function createEmptyStats(): Record<PillarId, PillarStats> {
  return {
    literacy: { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
    math: { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
    'shapes-colors': { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
    'figures-logic': { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
    tracing: { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
    'music-sounds': { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
    'emotions-routine': { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
    'nature-habitats': { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
  };
}

/**
 * Cria um novo perfil infantil com figurinha inicial de boas-vindas.
 *
 * @param name - Nome da criança.
 * @param avatar - Identificador do avatar SVG.
 * @param ageLevel - Faixa etária (`'3-4'` ou `'5-6'`).
 */
export function createProfile(
  name: string,
  avatar: AvatarId,
  ageLevel: AgeLevel
): ChildProfile {
  return {
    id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Pequeno Explorador',
    avatar,
    ageLevel,
    stars: 0,
    unlockedStickers: ['stk-abelha'], // Starter welcome sticker!
    stats: createEmptyStats(),
    createdAt: new Date().toISOString(),
  };
}

export function createDefaultState(): AppState {
  const defaultChild = createProfile('Explorador', 'owl', '3-4');
  return {
    version: 1,
    activeProfileId: defaultChild.id,
    profiles: [defaultChild],
    audio: {
      voiceEnabled: true,
      sfxEnabled: true,
      voiceSpeed: 'normal',
      volume: 0.85,
    },
  };
}

/** Carrega o estado salvo do `localStorage` com fallback seguro para o estado padrão. */
export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      return createDefaultState();
    }
    const activeExists = parsed.profiles.some((p) => p.id === parsed.activeProfileId);
    return {
      version: 1,
      activeProfileId: activeExists ? parsed.activeProfileId : parsed.profiles[0].id,
      profiles: parsed.profiles.map((p) => ({
        ...p,
        stats: { ...createEmptyStats(), ...(p.stats || {}) },
        unlockedStickers: Array.isArray(p.unlockedStickers) ? p.unlockedStickers : [],
      })),
      audio: {
        voiceEnabled: parsed.audio?.voiceEnabled ?? true,
        sfxEnabled: parsed.audio?.sfxEnabled ?? true,
        voiceSpeed: parsed.audio?.voiceSpeed ?? 'normal',
        volume: typeof parsed.audio?.volume === 'number' ? parsed.audio.volume : 0.85,
      },
    };
  } catch {
    return createDefaultState();
  }
}

/** Persiste o estado da aplicação no `localStorage`. */
export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Sorteia a próxima figurinha ainda bloqueada no álbum.
 *
 * @returns ID da figurinha sorteada ou `null` quando o álbum estiver completo.
 */
export function pickNextSticker(unlockedIds: string[]): string | null {
  const locked = STICKERS.filter((s) => !unlockedIds.includes(s.id));
  if (locked.length === 0) return null;
  const idx = Math.floor(Math.random() * locked.length);
  return locked[idx].id;
}
