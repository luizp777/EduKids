import type { AgeLevel, AppState, AvatarId, ChildProfile, PillarId, PillarStats } from '../types';
import { PILLARS, STICKERS } from '../data/catalog';

/** Chave de versionamento usada no `localStorage` do navegador. */
export const STORAGE_KEY = 'edukids_state_v1';

const VALID_AVATARS = new Set<AvatarId>(['owl', 'bear', 'cat', 'bunny', 'fox', 'dino']);
const VALID_AGE_LEVELS = new Set<AgeLevel>(['3-4', '5-6']);
const VALID_VOICE_SPEEDS = new Set(['slow', 'normal', 'fast']);
const VALID_PILLARS = new Set<PillarId>(PILLARS.map((p) => p.id));

/** Retorna a chave de data local no formato `YYYY-MM-DD`. */
export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Calcula o nível de medalha de um pilar com base nas rodadas concluídas. */
export function getPillarTier(completedRounds: number): 'none' | 'bronze' | 'silver' | 'gold' {
  if (completedRounds >= 6) return 'gold';
  if (completedRounds >= 3) return 'silver';
  if (completedRounds >= 1) return 'bronze';
  return 'none';
}

/**
 * Seleciona a "Aventura do Dia" recomendada para o perfil:
 * prioriza o pilar com menos rodadas concluídas, usando a data do dia para desempate consistente.
 */
export function getRecommendedPillar(profile: ChildProfile, date = new Date()): PillarId {
  const daySeed = date.getFullYear() * 366 + date.getMonth() * 31 + date.getDate();
  const ordered = PILLARS.map((p, idx) => ({
    id: p.id,
    rounds: profile.stats[p.id]?.completedRounds ?? 0,
    tieBreaker: (idx + daySeed) % PILLARS.length,
  }));
  ordered.sort((a, b) => a.rounds - b.rounds || a.tieBreaker - b.tieBreaker);
  return ordered[0].id;
}

/**
 * Valida e normaliza um objeto de estado (vindo do `localStorage` ou de um arquivo de backup JSON).
 * Retorna `null` se a estrutura for inválida.
 */
export function validateAndNormalizeState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Partial<AppState>;
  if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
    return null;
  }

  const normalizedProfiles: ChildProfile[] = [];
  for (const item of parsed.profiles) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Partial<ChildProfile>;
    if (typeof p.id !== 'string' || !p.id.trim()) continue;
    const avatar: AvatarId = VALID_AVATARS.has(p.avatar as AvatarId) ? (p.avatar as AvatarId) : 'owl';
    const ageLevel: AgeLevel = VALID_AGE_LEVELS.has(p.ageLevel as AgeLevel)
      ? (p.ageLevel as AgeLevel)
      : '3-4';
    const baseStats = createEmptyStats();
    if (p.stats && typeof p.stats === 'object') {
      for (const pillar of PILLARS) {
        const s = (p.stats as Partial<Record<PillarId, Partial<PillarStats>>>)[pillar.id];
        if (s && typeof s === 'object') {
          baseStats[pillar.id] = {
            completedRounds: Math.max(0, Number(s.completedRounds) || 0),
            correctAnswers: Math.max(0, Number(s.correctAnswers) || 0),
            starsEarned: Math.max(0, Number(s.starsEarned) || 0),
            ...(typeof s.lastPlayedAt === 'string' ? { lastPlayedAt: s.lastPlayedAt } : {}),
          };
        }
      }
    }
    const validStickerIds = new Set(STICKERS.map((s) => s.id));
    const unlockedStickers = Array.isArray(p.unlockedStickers)
      ? Array.from(new Set(p.unlockedStickers.filter((id): id is string => typeof id === 'string' && validStickerIds.has(id))))
      : ['stk-abelha'];

    normalizedProfiles.push({
      id: p.id.trim(),
      name: typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 32) : 'Explorador',
      avatar,
      ageLevel,
      stars: Math.max(0, Number(p.stars) || 0),
      unlockedStickers,
      stats: baseStats,
      ...(typeof p.dailyBonusDate === 'string' ? { dailyBonusDate: p.dailyBonusDate } : {}),
      ...(VALID_PILLARS.has(p.dailyBonusPillar as PillarId)
        ? { dailyBonusPillar: p.dailyBonusPillar as PillarId }
        : {}),
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
    });
  }

  if (normalizedProfiles.length === 0) return null;

  const activeExists = normalizedProfiles.some((p) => p.id === parsed.activeProfileId);
  const rawVoiceSpeed = parsed.audio?.voiceSpeed;
  const voiceSpeed = VALID_VOICE_SPEEDS.has(rawVoiceSpeed as string)
    ? (rawVoiceSpeed as 'slow' | 'normal' | 'fast')
    : 'normal';
  const rawVolume = parsed.audio?.volume;
  const volume =
    typeof rawVolume === 'number' && Number.isFinite(rawVolume)
      ? Math.max(0.1, Math.min(1, rawVolume))
      : 0.85;

  return {
    version: 1,
    activeProfileId: activeExists ? (parsed.activeProfileId as string) : normalizedProfiles[0].id,
    profiles: normalizedProfiles,
    audio: {
      voiceEnabled: parsed.audio?.voiceEnabled ?? true,
      sfxEnabled: parsed.audio?.sfxEnabled ?? true,
      voiceSpeed,
      volume,
    },
  };
}

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
    const parsed = JSON.parse(raw) as unknown;
    return validateAndNormalizeState(parsed) || createDefaultState();
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
