import { describe, expect, it } from 'vitest';
import swSource from '../../public/sw.js?raw';
import { PILLARS, STICKERS } from '../data/catalog';
import { SW_CACHE_NAME } from '../utils/swCache';
import {
  computeNextStreak,
  createDefaultState,
  createProfile,
  getLocalDateKey,
  getPillarForSticker,
  getPillarTier,
  getRecommendedPillar,
  getUnlockedAccessories,
  isPillarChallengeActive,
  pickNextGoldenSticker,
  pickNextSticker,
  shouldSuggestAgeUpgrade,
  validateAndNormalizeState,
} from './storage';

describe('storage utilities', () => {
  describe('computeNextStreak', () => {
    it('starts at 1 when there is no previous active date', () => {
      expect(computeNextStreak(undefined, 0, '2026-11-23')).toBe(1);
    });

    it('keeps current streak when playing again on the same day', () => {
      expect(computeNextStreak('2026-11-23', 4, '2026-11-23')).toBe(4);
      expect(computeNextStreak('2026-11-23', 0, '2026-11-23')).toBe(1);
    });

    it('increments streak on consecutive days', () => {
      expect(computeNextStreak('2026-11-22', 3, '2026-11-23')).toBe(4);
      expect(computeNextStreak('2026-10-31', 5, '2026-11-01')).toBe(6);
    });

    it('resets streak to 1 after skipping one or more days', () => {
      expect(computeNextStreak('2026-11-20', 7, '2026-11-23')).toBe(1);
    });
  });

  describe('getPillarTier & getUnlockedAccessories', () => {
    it('maps completed rounds to none, bronze, silver, and gold tiers', () => {
      expect(getPillarTier(0)).toBe('none');
      expect(getPillarTier(1)).toBe('bronze');
      expect(getPillarTier(2)).toBe('bronze');
      expect(getPillarTier(3)).toBe('silver');
      expect(getPillarTier(5)).toBe('silver');
      expect(getPillarTier(6)).toBe('gold');
      expect(getPillarTier(20)).toBe('gold');
    });

    it('unlocks Lumi accessories progressively based on star count', () => {
      expect(getUnlockedAccessories(0)).toContain('none');
      expect(getUnlockedAccessories(0).length).toBe(1);
      expect(getUnlockedAccessories(1000).length).toBe(6);
    });
  });

  describe('getRecommendedPillar', () => {
    it('prioritizes the pillar with the fewest completed rounds', () => {
      const profile = createProfile('Ana', 'cat', '3-4');
      for (const p of PILLARS) {
        profile.stats[p.id].completedRounds = p.id === 'languages' ? 0 : 2;
      }
      expect(getRecommendedPillar(profile, new Date('2026-11-23T12:00:00'))).toBe('languages');
    });

    it('uses a deterministic date-based tie-breaker when rounds are tied', () => {
      const profile = createProfile('Leo', 'dino', '5-6');
      const d = new Date('2026-11-23T12:00:00');
      const first = getRecommendedPillar(profile, d);
      const second = getRecommendedPillar(profile, d);
      expect(first).toBe(second);
    });
  });

  describe('pickNextSticker & pickNextGoldenSticker', () => {
    it('returns an unlocked candidate until the album is full, then null', () => {
      const allIds = STICKERS.map((s) => s.id);
      const almostAll = allIds.slice(0, -1);
      expect(pickNextSticker(almostAll)).toBe(allIds[allIds.length - 1]);
      expect(pickNextSticker(allIds)).toBeNull();
    });

    it('prioritizes preferredId when it is a valid locked sticker, and falls back otherwise', () => {
      const unlocked = ['stk-abelha'];
      expect(pickNextSticker(unlocked, 'stk-foguete')).toBe('stk-foguete');
      const fallback = pickNextSticker(unlocked, 'stk-abelha');
      expect(fallback).not.toBeNull();
      expect(fallback).not.toBe('stk-abelha');
      expect(pickNextSticker(unlocked, 'stk-inexistente')).not.toBe('stk-inexistente');
    });

    it('promotes only unlocked non-golden stickers and returns null when all are golden', () => {
      const unlocked = ['stk-abelha', 'stk-bola'];
      expect(pickNextGoldenSticker(unlocked, ['stk-abelha'])).toBe('stk-bola');
      expect(pickNextGoldenSticker(unlocked, unlocked)).toBeNull();
    });

    it('maps locked stickers to thematic pillars prioritizing least played ones', () => {
      const profile = createProfile('Lia', 'cat', '3-4');
      const animalSticker = STICKERS.find((s) => s.theme === 'Animais')!;
      profile.stats['nature-habitats'].completedRounds = 5;
      profile.stats['music-sounds'].completedRounds = 5;
      profile.stats.literacy.completedRounds = 5;
      profile.stats['figures-logic'].completedRounds = 0;
      expect(getPillarForSticker(animalSticker, profile)).toBe('figures-logic');
    });
  });

  describe('validateAndNormalizeState', () => {
    it('rejects null, primitives, and empty profiles arrays', () => {
      expect(validateAndNormalizeState(null)).toBeNull();
      expect(validateAndNormalizeState('invalid')).toBeNull();
      expect(validateAndNormalizeState({ profiles: [] })).toBeNull();
    });

    it('normalizes a valid default state without losing fields', () => {
      const state = createDefaultState();
      const normalized = validateAndNormalizeState(state);
      expect(normalized).not.toBeNull();
      expect(normalized?.activeProfileId).toBe(state.activeProfileId);
      expect(normalized?.profiles).toHaveLength(1);
      expect(normalized?.audio.volume).toBe(0.85);
    });

    it('sanitizes invalid fields, clamps values, and enforces gallery/history caps', () => {
      const todayKey = getLocalDateKey();
      const raw = {
        version: 1,
        activeProfileId: 'missing-id',
        profiles: [
          {
            id: 'p1',
            name: '   ',
            avatar: 'invalid-avatar',
            ageLevel: '99',
            stars: -15,
            unlockedStickers: ['stk-abelha', 'stk-invalid', 'stk-abelha'],
            goldenStickers: ['stk-abelha', 'stk-not-unlocked'],
            lumiAccessory: 'jetpack',
            preferredLanguage: 'es',
            savedPaintings: Array.from({ length: 20 }, (_, i) => ({
              id: `paint-${i}`,
              drawingId: 'casa',
              label: 'Casa',
              parts: { wall: '#fff' },
              createdAt: '2026-11-23T00:00:00.000Z',
            })),
            recentHistory: Array.from({ length: 15 }, (_, i) => ({
              pillar: i === 0 ? 'invalid-pillar' : 'math',
              completedAt: '2026-11-23T00:00:00.000Z',
              starsEarned: 3,
            })),
          },
        ],
        audio: {
          voiceSpeed: 'turbo',
          volume: 99,
          calmMode: true,
        },
        screenTime: {
          limitMinutes: 999,
          usedSecondsToday: 120,
          usageDate: todayKey,
          extraMinutesToday: 15,
        },
      };

      const result = validateAndNormalizeState(raw);
      expect(result).not.toBeNull();
      expect(result?.activeProfileId).toBe('p1');
      const p = result!.profiles[0];
      expect(p.name).toBe('Explorador');
      expect(p.avatar).toBe('owl');
      expect(p.ageLevel).toBe('3-4');
      expect(p.stars).toBe(0);
      expect(p.unlockedStickers).toEqual(['stk-abelha']);
      expect(p.goldenStickers).toEqual(['stk-abelha']);
      expect(p.lumiAccessory).toBe('none');
      expect(p.preferredLanguage).toBe('es');
      expect(p.savedPaintings).toHaveLength(12);
      expect(p.recentHistory).toHaveLength(10);
      expect(result?.audio.voiceSpeed).toBe('normal');
      expect(result?.audio.volume).toBe(1);
      expect(result?.audio.calmMode).toBe(true);
      expect(result?.screenTime?.limitMinutes).toBe(180);
      expect(result?.screenTime?.usedSecondsToday).toBe(120);
    });
  });

  describe('adaptive difficulty helpers', () => {
    it('activates challenge mode once a pillar reaches Silver tier (3+ completed rounds)', () => {
      expect(isPillarChallengeActive(undefined)).toBe(false);
      expect(isPillarChallengeActive({ completedRounds: 2, correctAnswers: 8, starsEarned: 10 })).toBe(false);
      expect(isPillarChallengeActive({ completedRounds: 3, correctAnswers: 12, starsEarned: 15 })).toBe(true);
    });

    it('suggests age upgrade from 3-4 to 5-6 after mastery, and never for 5-6 profiles', () => {
      const p34 = createProfile('Bia', 'bunny', '3-4');
      expect(shouldSuggestAgeUpgrade(p34)).toBe(false);

      p34.stars = 30;
      expect(shouldSuggestAgeUpgrade(p34)).toBe(true);

      const p56 = createProfile('Gui', 'fox', '5-6');
      p56.stars = 50;
      expect(shouldSuggestAgeUpgrade(p56)).toBe(false);
    });
  });

  describe('Service Worker cache sync', () => {
    it('keeps SW_CACHE_NAME synchronized with public/sw.js', () => {
      expect(swSource).toContain(`const CACHE_NAME = '${SW_CACHE_NAME}';`);
    });
  });
});
