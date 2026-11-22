import { describe, expect, it } from 'vitest';
import {
  generateAnimalSoundQuestions,
  generateAssociationQuestions,
  generateCategoryRound,
  generateColorMixRounds,
  generateColorRound,
  generateCompareQuestions,
  generateInitialSyllableQuestions,
  generateLiteracyQuestions,
  generateMathQuestions,
  generateMatrixLogicQuestions,
  generateNumberQuantityQuestions,
  generateOddOneOutQuestions,
  generateOrderSizeQuestions,
  generatePatternQuestions,
  generateRhymeQuestions,
  generateSequenceQuestions,
  generateShadowQuestions,
  generateShapeObjectQuestions,
  generateShapeRound,
  generateSubtractionQuestions,
  generateSyllableQuestions,
  generateWordBuilderQuestions,
} from './gameGenerators';
import { createProfile, pickNextSticker } from '../state/storage';
import { FIGURES, RHYME_PAIRS, STICKERS, TRACING_TEMPLATES } from '../data/catalog';

describe('EduKids game generators', () => {
  it('generates age-appropriate literacy questions for 3-4 (vowels only, 3 options)', () => {
    const qs = generateLiteracyQuestions('3-4', 5);
    expect(qs).toHaveLength(5);
    for (const q of qs) {
      expect(q.mode).toBe('initial-letter');
      expect(q.target.isVowel).toBe(true);
      expect(q.options).toHaveLength(3);
      expect(q.options.some((o) => o.id === q.target.id)).toBe(true);
    }
  });

  it('generates mixed initial-letter and complete-word questions for 5-6', () => {
    const qs = generateLiteracyQuestions('5-6', 4);
    expect(qs).toHaveLength(4);
    expect(qs.some((q) => q.mode === 'complete-word')).toBe(true);
    for (const q of qs) {
      if (q.mode === 'complete-word') {
        const expectedChar = q.target.name[q.missingIndex];
        expect(q.letterOptions).toContain(expectedChar);
      } else {
        expect(q.options).toHaveLength(4);
      }
    }
  });

  it('generates rhyme and syllable questions', () => {
    const rhymes = generateRhymeQuestions('3-4', 4);
    expect(rhymes).toHaveLength(4);
    for (const r of rhymes) {
      expect(r.options).toHaveLength(3);
      expect(r.options.some((o) => o.id === r.match.id)).toBe(true);
    }

    const syllables = generateSyllableQuestions('5-6', 4);
    expect(syllables).toHaveLength(4);
    for (const s of syllables) {
      expect(s.syllableCount).toBe(s.target.syllables.length);
      expect(s.options).toContain(s.syllableCount);
    }
  });

  it('generates counting (1..5) for 3-4 and includes visual addition for 5-6', () => {
    const qs34 = generateMathQuestions('3-4', 5);
    for (const q of qs34) {
      expect(q.mode).toBe('count');
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeLessThanOrEqual(5);
      expect(q.options).toContain(q.answer);
    }

    const qs56 = generateMathQuestions('5-6', 4);
    expect(qs56.some((q) => q.mode === 'addition')).toBe(true);
    for (const q of qs56) {
      expect(q.options).toContain(q.answer);
      if (q.mode === 'addition') {
        expect(q.countA + q.countB).toBe(q.answer);
      }
    }
  });

  it('generates compare, subtraction, and sequence math questions', () => {
    const compares = generateCompareQuestions('5-6', 4);
    expect(compares).toHaveLength(4);
    for (const c of compares) {
      expect(c.leftCount).not.toBe(c.rightCount);
      const expected = c.askMost
        ? c.leftCount > c.rightCount ? 'left' : 'right'
        : c.leftCount < c.rightCount ? 'left' : 'right';
      expect(c.correctSide).toBe(expected);
    }

    const subs = generateSubtractionQuestions('5-6', 4);
    expect(subs).toHaveLength(4);
    for (const s of subs) {
      expect(s.startCount - s.removeCount).toBe(s.answer);
      expect(s.options).toContain(s.answer);
    }

    const seqs = generateSequenceQuestions('3-4', 4);
    expect(seqs).toHaveLength(4);
    for (const seq of seqs) {
      expect(seq.items[seq.missingIndex]).toBeNull();
      expect(seq.options).toContain(seq.answer);
    }
  });

  it('generates shapes, color sorting, color mixing, and pattern rounds', () => {
    expect(generateShapeRound('3-4')).toHaveLength(3);
    expect(generateShapeRound('5-6')).toHaveLength(4);

    const colorRound = generateColorRound('3-4');
    expect(colorRound.items.filter((i) => i.isMatch).length).toBeGreaterThanOrEqual(2);

    const mixes = generateColorMixRounds();
    expect(mixes).toHaveLength(3);
    for (const m of mixes) {
      expect(m.options.some((o) => o.id === m.result.id)).toBe(true);
    }

    const patterns = generatePatternQuestions('5-6', 4);
    expect(patterns).toHaveLength(4);
    for (const p of patterns) {
      expect(p.options.some((o) => o.id === p.answer.id)).toBe(true);
    }
  });

  it('generates shadow, odd-one-out, and category sorting rounds', () => {
    const shadows = generateShadowQuestions('3-4', 4);
    expect(shadows).toHaveLength(4);
    for (const s of shadows) {
      expect(s.options).toHaveLength(3);
      expect(s.options.some((o) => o.id === s.target.id)).toBe(true);
    }

    const odds = generateOddOneOutQuestions('5-6', 4);
    expect(odds).toHaveLength(4);
    for (const o of odds) {
      expect(o.items).toHaveLength(6);
      expect(o.items.filter((i) => i.isOdd)).toHaveLength(1);
    }

    const clampedOdds = generateOddOneOutQuestions('3-4', 50);
    expect(clampedOdds.length).toBeGreaterThan(0);
    expect(clampedOdds.every((q) => q.commonFigure && q.oddFigure)).toBe(true);

    const catRound = generateCategoryRound('5-6');
    expect(catRound.items).toHaveLength(6);
    expect(catRound.groupA.id).not.toBe(catRound.groupB.id);
  });

  it('creates child profiles with starter sticker and unlocks remaining stickers without duplicates', () => {
    const profile = createProfile('Léo', 'dino', '3-4');
    expect(profile.unlockedStickers).toHaveLength(1);
    const next = pickNextSticker(profile.unlockedStickers);
    expect(next).not.toBeNull();
    expect(profile.unlockedStickers).not.toContain(next);

    const allIds = STICKERS.map((s) => s.id);
    expect(pickNextSticker(allIds)).toBeNull();
  });

  it('generates v2 word builder, order/size, association, and animal sound questions', () => {
    const wb = generateWordBuilderQuestions('3-4', 4);
    expect(wb).toHaveLength(4);
    for (const q of wb) {
      expect(q.letters.map((l) => l.char).sort()).toEqual(q.target.name.split('').sort());
    }

    const os34 = generateOrderSizeQuestions('3-4', 3);
    expect(os34[0].mode).toBe('sizes');
    expect(os34[0].expectedOrder).toEqual([1, 2, 3]);

    const os56 = generateOrderSizeQuestions('5-6', 3);
    expect(os56[0].mode).toBe('numbers');
    expect(os56[0].expectedOrder).toHaveLength(4);

    const assoc = generateAssociationQuestions('3-4', 4);
    expect(assoc).toHaveLength(4);
    for (const a of assoc) {
      expect(a.options.some((o) => o.id === a.match.id)).toBe(true);
    }

    const sounds = generateAnimalSoundQuestions('5-6', 4);
    expect(sounds).toHaveLength(4);
    for (const s of sounds) {
      expect(s.options).toHaveLength(4);
      expect(s.options.some((o) => o.id === s.target.id)).toBe(true);
    }
  });

  it('generates v3 expanded catalog and new activity generators', () => {
    expect(FIGURES.length).toBeGreaterThanOrEqual(36);
    expect(RHYME_PAIRS.length).toBeGreaterThanOrEqual(10);
    expect(TRACING_TEMPLATES.length).toBeGreaterThanOrEqual(40);

    const initSyl = generateInitialSyllableQuestions('3-4', 4);
    expect(initSyl).toHaveLength(4);
    for (const q of initSyl) {
      expect(q.options).toHaveLength(3);
      expect(q.options).toContain(q.correctSyllable);
    }

    const numQty = generateNumberQuantityQuestions('5-6', 4);
    expect(numQty).toHaveLength(4);
    for (const q of numQty) {
      expect(q.options).toHaveLength(4);
      expect(q.options.some((o) => o.count === q.targetNumber)).toBe(true);
    }

    const shapeObjs = generateShapeObjectQuestions('3-4', 4);
    expect(shapeObjs).toHaveLength(4);
    for (const q of shapeObjs) {
      expect(q.options).toHaveLength(3);
      expect(q.options.some((o) => o.id === q.shape.id)).toBe(true);
    }

    const matrices = generateMatrixLogicQuestions('5-6', 8);
    expect(matrices).toHaveLength(8);
    for (const m of matrices) {
      expect(m.options).toHaveLength(4);
      expect(m.options.some((o) => o.id === m.answer.id)).toBe(true);
      const validRowMatch = m.topLeft.id === m.topRight.id && m.bottomLeft.id === m.answer.id;
      const validColMatch = m.topLeft.id === m.bottomLeft.id && m.topRight.id === m.answer.id;
      expect(validRowMatch || validColMatch).toBe(true);
    }
  });
});
