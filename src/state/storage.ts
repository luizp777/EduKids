import type {
  ActivityHistoryEntry,
  AgeLevel,
  AppState,
  AvatarId,
  ChildProfile,
  ForeignLanguage,
  LumiAccessoryId,
  PillarId,
  PillarStats,
  SavedPainting,
  StickerItem,
  StickerTheme,
} from '../types';
import { LUMI_ACCESSORIES, PILLARS, STICKERS } from '../data/catalog';

/** Chave de versionamento usada no `localStorage` do navegador. */
export const STORAGE_KEY = 'edukids_state_v1';

const VALID_AVATARS = new Set<AvatarId>(['owl', 'bear', 'cat', 'bunny', 'fox', 'dino']);
const VALID_AGE_LEVELS = new Set<AgeLevel>(['3-4', '5-6']);
const VALID_VOICE_SPEEDS = new Set(['slow', 'normal', 'fast']);
const VALID_PILLARS = new Set<PillarId>(PILLARS.map((p) => p.id));
const VALID_ACCESSORIES = new Set<LumiAccessoryId>(LUMI_ACCESSORIES.map((a) => a.id));

/** Retorna a chave de data local no formato `YYYY-MM-DD`. */
export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcula a ofensiva atualizada (dias seguidos brincando) ao concluir uma rodada.
 *
 * @param lastActiveDate - Última data (`YYYY-MM-DD`) em que o perfil jogou.
 * @param currentStreak - Contagem atual de dias seguidos.
 * @param todayKey - Chave da data local atual (`YYYY-MM-DD`).
 * @returns Nova contagem de dias seguidos brincando.
 */
export function computeNextStreak(
  lastActiveDate: string | undefined,
  currentStreak: number,
  todayKey = getLocalDateKey()
): number {
  if (lastActiveDate === todayKey) {
    return Math.max(1, currentStreak);
  }
  if (lastActiveDate) {
    const yesterday = new Date(`${todayKey}T12:00:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    if (getLocalDateKey(yesterday) === lastActiveDate) {
      return Math.max(1, currentStreak) + 1;
    }
  }
  return 1;
}

/**
 * Retorna os IDs de acessórios da Lumi desbloqueados para o saldo de estrelas informado.
 *
 * @param stars - Saldo acumulado de estrelas do perfil.
 */
export function getUnlockedAccessories(stars: number): LumiAccessoryId[] {
  return LUMI_ACCESSORIES.filter((a) => stars >= a.minStars).map((a) => a.id);
}

/** Calcula o nível de medalha de um pilar com base nas rodadas concluídas. */
export function getPillarTier(completedRounds: number): 'none' | 'bronze' | 'silver' | 'gold' {
  if (completedRounds >= 6) return 'gold';
  if (completedRounds >= 3) return 'silver';
  if (completedRounds >= 1) return 'bronze';
  return 'none';
}

/** Indica se o Modo Desafio Estrela adaptativo está ativo em um pilar (medalha Prata ou Ouro). */
export function isPillarChallengeActive(stats?: PillarStats): boolean {
  return (stats?.completedRounds ?? 0) >= 3;
}

/**
 * Indica se devemos sugerir gentilmente a transição de 3–4 anos para 5–6 anos
 * quando a criança já demonstra domínio consolidado no nível Exploradores.
 */
export function shouldSuggestAgeUpgrade(profile: ChildProfile): boolean {
  if (profile.ageLevel !== '3-4') return false;
  if (profile.stars >= 30) return true;
  const pillarsWithMedal = PILLARS.filter(
    (p) => (profile.stats[p.id]?.completedRounds ?? 0) >= 1
  ).length;
  return pillarsWithMedal >= 4;
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
    const goldenStickers = Array.isArray(p.goldenStickers)
      ? Array.from(
          new Set(
            p.goldenStickers.filter(
              (id): id is string => typeof id === 'string' && unlockedStickers.includes(id)
            )
          )
        )
      : [];
    const lumiAccessory: LumiAccessoryId = VALID_ACCESSORIES.has(p.lumiAccessory as LumiAccessoryId)
      ? (p.lumiAccessory as LumiAccessoryId)
      : 'none';
    const preferredLanguage: ForeignLanguage =
      p.preferredLanguage === 'es' ? 'es' : 'en';
    const savedPaintings: SavedPainting[] = Array.isArray(p.savedPaintings)
      ? p.savedPaintings
          .filter(
            (item): item is SavedPainting =>
              Boolean(item) &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.drawingId === 'string' &&
              typeof item.label === 'string' &&
              Boolean(item.parts) &&
              typeof item.parts === 'object'
          )
          .slice(0, 12)
      : [];
    const recentHistory: ActivityHistoryEntry[] = Array.isArray(p.recentHistory)
      ? p.recentHistory
          .filter(
            (item): item is ActivityHistoryEntry =>
              Boolean(item) &&
              typeof item === 'object' &&
              VALID_PILLARS.has(item.pillar as PillarId) &&
              typeof item.completedAt === 'string'
          )
          .slice(0, 10)
      : [];

    normalizedProfiles.push({
      id: p.id.trim(),
      name: typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 32) : 'Explorador',
      avatar,
      ageLevel,
      stars: Math.max(0, Number(p.stars) || 0),
      unlockedStickers,
      goldenStickers,
      lumiAccessory,
      preferredLanguage,
      savedPaintings,
      streakDays: Math.max(0, Number(p.streakDays) || 0),
      ...(typeof p.lastActiveDate === 'string' ? { lastActiveDate: p.lastActiveDate } : {}),
      recentHistory,
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
  const todayKey = getLocalDateKey();
  const rawScreen = parsed.screenTime;
  const isSameDay = rawScreen?.usageDate === todayKey;

  return {
    version: 1,
    activeProfileId: activeExists ? (parsed.activeProfileId as string) : normalizedProfiles[0].id,
    profiles: normalizedProfiles,
    audio: {
      voiceEnabled: parsed.audio?.voiceEnabled ?? true,
      sfxEnabled: parsed.audio?.sfxEnabled ?? true,
      voiceSpeed,
      volume,
      calmMode: Boolean(parsed.audio?.calmMode),
    },
    screenTime: {
      limitMinutes: Math.max(0, Math.min(180, Number(rawScreen?.limitMinutes) || 0)),
      usedSecondsToday: isSameDay ? Math.max(0, Number(rawScreen?.usedSecondsToday) || 0) : 0,
      usageDate: todayKey,
      extraMinutesToday: isSameDay ? Math.max(0, Number(rawScreen?.extraMinutesToday) || 0) : 0,
    },
  };
}

/** Cria um mapa inicial zerado de estatísticas para todos os 10 pilares. */
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
    languages: { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
    stories: { completedRounds: 0, correctAnswers: 0, starsEarned: 0 },
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
    goldenStickers: [],
    lumiAccessory: 'none',
    preferredLanguage: 'en',
    savedPaintings: [],
    streakDays: 0,
    recentHistory: [],
    stats: createEmptyStats(),
    createdAt: new Date().toISOString(),
  };
}

/** Cria o estado inicial padrão da aplicação com um perfil inicial ativo. */
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
      calmMode: false,
    },
    screenTime: {
      limitMinutes: 0,
      usedSecondsToday: 0,
      usageDate: getLocalDateKey(),
      extraMinutesToday: 0,
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
 * Se `preferredId` for informado e ainda estiver bloqueado, garante o desbloqueio dele.
 *
 * @returns ID da figurinha escolhida ou `null` quando o álbum estiver completo.
 */
export function pickNextSticker(
  unlockedIds: string[],
  preferredId?: string | null
): string | null {
  const locked = STICKERS.filter((s) => !unlockedIds.includes(s.id));
  if (locked.length === 0) return null;
  if (preferredId && locked.some((s) => s.id === preferredId)) {
    return preferredId;
  }
  const idx = Math.floor(Math.random() * locked.length);
  return locked[idx].id;
}

const STICKER_THEME_PILLARS: Record<StickerTheme, PillarId[]> = {
  Animais: ['nature-habitats', 'music-sounds', 'literacy', 'figures-logic'],
  Espaço: ['math', 'tracing', 'stories', 'figures-logic'],
  Natureza: ['nature-habitats', 'shapes-colors', 'literacy', 'stories'],
  Frutas: ['math', 'shapes-colors', 'languages', 'literacy'],
  'Objetos e Amigos': ['literacy', 'emotions-routine', 'figures-logic', 'tracing'],
};

/**
 * Escolhe o pilar pedagógico mais indicado para o desafio de desbloquear uma figurinha específica.
 * Prioriza pilares relacionados ao tema da figurinha com menos rodadas concluídas.
 */
export function getPillarForSticker(sticker: StickerItem, profile: ChildProfile): PillarId {
  const candidates = STICKER_THEME_PILLARS[sticker.theme] || ['literacy'];
  let hash = 0;
  for (let i = 0; i < sticker.id.length; i += 1) {
    hash = (hash * 31 + sticker.id.charCodeAt(i)) >>> 0;
  }
  const ordered = candidates.map((id, idx) => ({
    id,
    rounds: profile.stats[id]?.completedRounds ?? 0,
    tieBreaker: (idx + hash) % candidates.length,
  }));
  ordered.sort((a, b) => a.rounds - b.rounds || a.tieBreaker - b.tieBreaker);
  return ordered[0].id;
}

/**
 * Sorteia a próxima figurinha já desbloqueada para evoluir para Dourada Brilhante.
 *
 * @returns ID da figurinha sorteada ou `null` quando todas já forem douradas.
 */
export function pickNextGoldenSticker(unlockedIds: string[], goldenIds: string[]): string | null {
  const candidates = unlockedIds.filter((id) => !goldenIds.includes(id));
  if (candidates.length === 0) return null;
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}
