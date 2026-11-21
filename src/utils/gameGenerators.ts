import type { AgeLevel, ColorInfo, FigureId, FigureItem, ShapeInfo } from '../types';
import { COLOR_MIXES, COLORS, FIGURES, RHYME_PAIRS, SHAPES } from '../data/catalog';

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Literacy ---
export interface LiteracyQuestion {
  mode: 'initial-letter' | 'complete-word';
  target: FigureItem;
  options: FigureItem[]; // used in initial-letter
  letterOptions: string[]; // used in complete-word
  missingIndex: number;
  promptText: string;
  spokenPrompt: string;
}

const ALL_LETTERS = 'ABCDEFGHIJLMNOPRSTUV'.split('');

export function generateLiteracyQuestions(
  ageLevel: AgeLevel,
  count = 5,
  forcedMode?: 'initial-letter' | 'complete-word'
): LiteracyQuestion[] {
  const pool = ageLevel === '3-4' ? FIGURES.filter((f) => f.isVowel) : FIGURES;
  const selected = shuffle(pool).slice(0, count);

  return selected.map((target, idx) => {
    const useCompleteWord =
      forcedMode === 'complete-word' ||
      (forcedMode === undefined && ageLevel === '5-6' && idx % 2 === 1);

    if (useCompleteWord) {
      const missingIndex = target.missingLetterIndex;
      const correctChar = target.name[missingIndex];
      const distractors = shuffle(
        ALL_LETTERS.filter((l) => l !== correctChar)
      ).slice(0, 3);
      return {
        mode: 'complete-word',
        target,
        options: [],
        letterOptions: shuffle([correctChar, ...distractors]),
        missingIndex,
        promptText: `Complete a palavra: ${target.name
          .split('')
          .map((ch, i) => (i === missingIndex ? '_' : ch))
          .join(' ')}`,
        spokenPrompt: `Qual letra falta na palavra ${target.name.toLowerCase()}?`,
      };
    }

    const optionCount = ageLevel === '3-4' ? 3 : 4;
    const distractors = shuffle(
      FIGURES.filter((f) => f.letter !== target.letter && f.id !== target.id)
    ).slice(0, optionCount - 1);

    return {
      mode: 'initial-letter',
      target,
      options: shuffle([target, ...distractors]),
      letterOptions: [],
      missingIndex: 0,
      promptText: `Qual figura começa com a letra ${target.letter}?`,
      spokenPrompt: `Qual figura começa com a letra ${target.letter}?`,
    };
  });
}

export interface RhymeQuestion {
  anchor: FigureItem;
  match: FigureItem;
  options: FigureItem[];
  promptText: string;
  spokenPrompt: string;
}

export function generateRhymeQuestions(ageLevel: AgeLevel, count = 4): RhymeQuestion[] {
  const optionCount = ageLevel === '3-4' ? 3 : 4;
  const pairs = shuffle(RHYME_PAIRS).slice(0, count);
  const byId = new Map<FigureId, FigureItem>(FIGURES.map((f) => [f.id, f]));

  return pairs.map(([aId, bId]) => {
    const swap = Math.random() > 0.5;
    const anchor = byId.get(swap ? bId : aId)!;
    const match = byId.get(swap ? aId : bId)!;
    const excludedIds = new Set<FigureId>([anchor.id, match.id]);
    // Exclude other figures that also rhyme with anchor
    for (const [x, y] of RHYME_PAIRS) {
      if (x === anchor.id) excludedIds.add(y);
      if (y === anchor.id) excludedIds.add(x);
    }
    const distractors = shuffle(FIGURES.filter((f) => !excludedIds.has(f.id))).slice(
      0,
      optionCount - 1
    );
    return {
      anchor,
      match,
      options: shuffle([match, ...distractors]),
      promptText: `O que rima com ${anchor.name}?`,
      spokenPrompt: `Qual figura rima com ${anchor.name.toLowerCase()}?`,
    };
  });
}

export interface SyllableQuestion {
  target: FigureItem;
  syllableCount: number;
  options: number[];
  promptText: string;
  spokenPrompt: string;
}

export function generateSyllableQuestions(ageLevel: AgeLevel, count = 4): SyllableQuestion[] {
  const pool =
    ageLevel === '3-4'
      ? FIGURES.filter((f) => f.syllables.length <= 3)
      : FIGURES;
  const selected = shuffle(pool).slice(0, count);

  return selected.map((target) => ({
    target,
    syllableCount: target.syllables.length,
    options: [1, 2, 3, 4],
    promptText: `Quantas sílabas tem ${target.name}?`,
    spokenPrompt: `Vamos bater palmas! Quantos pedacinhos tem a palavra ${target.name.toLowerCase()}?`,
  }));
}

// --- Math ---
export interface MathQuestion {
  mode: 'count' | 'addition';
  figure: FigureItem;
  countA: number;
  countB: number;
  answer: number;
  options: number[];
  promptText: string;
  spokenPrompt: string;
}

const COUNTABLE_FIGURES = FIGURES.filter((f) =>
  ['maca', 'morango', 'banana', 'bola', 'flor', 'pato', 'peixe', 'abelha', 'gato', 'carro'].includes(f.id)
);

export function generateMathQuestions(
  ageLevel: AgeLevel,
  count = 5,
  forcedMode?: 'count' | 'addition'
): MathQuestion[] {
  const questions: MathQuestion[] = [];
  const maxNum = ageLevel === '3-4' ? 5 : 9;

  for (let i = 0; i < count; i++) {
    const figure = pickRandom(COUNTABLE_FIGURES);
    const isAddition =
      forcedMode === 'addition' ||
      (forcedMode === undefined && ageLevel === '5-6' && i % 2 === 1);

    if (isAddition) {
      const maxTerm = ageLevel === '3-4' ? 3 : 4;
      const countA = 1 + Math.floor(Math.random() * maxTerm);
      const countB = 1 + Math.floor(Math.random() * maxTerm);
      const answer = countA + countB;
      const optionSet = new Set<number>([answer]);
      while (optionSet.size < 4) {
        const candidate = Math.max(1, answer + Math.floor(Math.random() * 5) - 2);
        optionSet.add(candidate);
      }
      questions.push({
        mode: 'addition',
        figure,
        countA,
        countB,
        answer,
        options: shuffle(Array.from(optionSet)),
        promptText: `Quanto é ${countA} + ${countB}?`,
        spokenPrompt: `Vamos somar! Quanto é ${countA} mais ${countB}?`,
      });
    } else {
      const answer = 1 + Math.floor(Math.random() * maxNum);
      const optionCount = ageLevel === '3-4' ? 3 : 4;
      const optionSet = new Set<number>([answer]);
      while (optionSet.size < optionCount) {
        const candidate = 1 + Math.floor(Math.random() * (maxNum + 1));
        optionSet.add(candidate);
      }
      questions.push({
        mode: 'count',
        figure,
        countA: answer,
        countB: 0,
        answer,
        options: shuffle(Array.from(optionSet)),
        promptText: 'Quantos você vê?',
        spokenPrompt: 'Vamos contar! Quantas figuras aparecem na tela?',
      });
    }
  }

  return questions;
}

export interface CompareQuestion {
  figure: FigureItem;
  leftCount: number;
  rightCount: number;
  askMost: boolean; // true = "mais", false = "menos"
  correctSide: 'left' | 'right';
  promptText: string;
  spokenPrompt: string;
}

export function generateCompareQuestions(ageLevel: AgeLevel, count = 4): CompareQuestion[] {
  const maxN = ageLevel === '3-4' ? 5 : 8;
  return Array.from({ length: count }, (_, idx) => {
    const figure = pickRandom(COUNTABLE_FIGURES);
    const leftCount = 1 + Math.floor(Math.random() * maxN);
    let rightCount = 1 + Math.floor(Math.random() * maxN);
    while (rightCount === leftCount) {
      rightCount = 1 + Math.floor(Math.random() * maxN);
    }
    const askMost = ageLevel === '3-4' ? true : idx % 2 === 0;
    const correctSide = askMost
      ? leftCount > rightCount
        ? 'left'
        : 'right'
      : leftCount < rightCount
        ? 'left'
        : 'right';
    return {
      figure,
      leftCount,
      rightCount,
      askMost,
      correctSide,
      promptText: askMost ? 'Qual grupo tem MAIS?' : 'Qual grupo tem MENOS?',
      spokenPrompt: askMost
        ? 'Toque no grupo que tem mais figuras!'
        : 'Toque no grupo que tem menos figuras!',
    };
  });
}

export interface SubtractionQuestion {
  figure: FigureItem;
  startCount: number;
  removeCount: number;
  answer: number;
  options: number[];
  promptText: string;
  spokenPrompt: string;
}

export function generateSubtractionQuestions(ageLevel: AgeLevel, count = 4): SubtractionQuestion[] {
  const maxStart = ageLevel === '3-4' ? 5 : 8;
  return Array.from({ length: count }, () => {
    const figure = pickRandom(COUNTABLE_FIGURES);
    const startCount = 2 + Math.floor(Math.random() * (maxStart - 1));
    const removeCount = 1 + Math.floor(Math.random() * (startCount - 1));
    const answer = startCount - removeCount;
    const optionCount = ageLevel === '3-4' ? 3 : 4;
    const optionSet = new Set<number>([answer]);
    let spread = 5;
    while (optionSet.size < optionCount) {
      const candidate = Math.max(1, answer + Math.floor(Math.random() * spread) - 2);
      optionSet.add(candidate);
      spread += 1;
    }
    return {
      figure,
      startCount,
      removeCount,
      answer,
      options: shuffle(Array.from(optionSet)),
      promptText: `Tinha ${startCount}, saíram ${removeCount}. Ficaram quantos?`,
      spokenPrompt: `Tinha ${startCount}, saíram ${removeCount}. Quantos ficaram?`,
    };
  });
}

export interface SequenceQuestion {
  items: (number | null)[];
  missingIndex: number;
  answer: number;
  options: number[];
  promptText: string;
  spokenPrompt: string;
}

export function generateSequenceQuestions(ageLevel: AgeLevel, count = 4): SequenceQuestion[] {
  return Array.from({ length: count }, () => {
    const step = ageLevel === '5-6' && Math.random() > 0.65 ? 2 : 1;
    const start = ageLevel === '3-4' ? 1 : 1 + Math.floor(Math.random() * 5);
    const full = [start, start + step, start + step * 2, start + step * 3];
    const missingIndex = 1 + Math.floor(Math.random() * 2); // index 1 or 2
    const answer = full[missingIndex];
    const items = full.map((n, idx) => (idx === missingIndex ? null : n));
    const optionCount = ageLevel === '3-4' ? 3 : 4;
    const optionSet = new Set<number>([answer]);
    let spread = 5;
    while (optionSet.size < optionCount) {
      const candidate = Math.max(1, answer + Math.floor(Math.random() * spread) - 2);
      optionSet.add(candidate);
      spread += 1;
    }
    return {
      items,
      missingIndex,
      answer,
      options: shuffle(Array.from(optionSet)),
      promptText: 'Qual número falta na sequência?',
      spokenPrompt: 'Qual número está faltando na sequência?',
    };
  });
}

// --- Shapes & Colors ---
export interface ColorSortRound {
  targetColor: ColorInfo;
  items: { figure: FigureItem; isMatch: boolean }[];
}

export function generateShapeRound(ageLevel: AgeLevel): ShapeInfo[] {
  const count = ageLevel === '3-4' ? 3 : 4;
  return shuffle(SHAPES).slice(0, count);
}

export function generateColorRound(ageLevel: AgeLevel): ColorSortRound {
  const availableColors = COLORS.filter(
    (c) => FIGURES.filter((f) => f.colorId === c.id).length >= 2
  );
  const targetColor = pickRandom(availableColors);
  const matching = shuffle(FIGURES.filter((f) => f.colorId === targetColor.id)).slice(
    0,
    ageLevel === '3-4' ? 2 : 3
  );
  const others = shuffle(FIGURES.filter((f) => f.colorId !== targetColor.id)).slice(
    0,
    ageLevel === '3-4' ? 2 : 3
  );
  return {
    targetColor,
    items: shuffle([
      ...matching.map((figure) => ({ figure, isMatch: true })),
      ...others.map((figure) => ({ figure, isMatch: false })),
    ]),
  };
}

export interface ColorMixRound {
  colorA: ColorInfo;
  colorB: ColorInfo;
  result: ColorInfo;
  options: ColorInfo[];
}

export function generateColorMixRounds(): ColorMixRound[] {
  const colorMap = new Map(COLORS.map((c) => [c.id, c]));
  return shuffle(COLOR_MIXES).map((mix) => {
    const colorA = colorMap.get(mix.colorA)!;
    const colorB = colorMap.get(mix.colorB)!;
    const result = colorMap.get(mix.result)!;
    const distractors = shuffle(
      COLORS.filter((c) => c.id !== result.id && c.id !== colorA.id && c.id !== colorB.id)
    ).slice(0, 2);
    return {
      colorA,
      colorB,
      result,
      options: shuffle([result, ...distractors]),
    };
  });
}

export interface PatternQuestion {
  sequence: ShapeInfo[];
  answer: ShapeInfo;
  options: ShapeInfo[];
  promptText: string;
  spokenPrompt: string;
}

export function generatePatternQuestions(ageLevel: AgeLevel, count = 4): PatternQuestion[] {
  return Array.from({ length: count }, () => {
    if (ageLevel === '3-4') {
      const [a, b, c] = shuffle(SHAPES).slice(0, 3);
      return {
        sequence: [a, b, a],
        answer: b,
        options: shuffle([a, b, c]),
        promptText: 'Qual forma vem depois?',
        spokenPrompt: 'Observe a sequência! Qual forma vem depois?',
      };
    }
    // 5-6: ABCAB -> C or AABAAB -> ?
    const [a, b, c, d] = shuffle(SHAPES).slice(0, 4);
    const useThree = Math.random() > 0.4;
    if (useThree) {
      return {
        sequence: [a, b, c, a, b],
        answer: c,
        options: shuffle([a, b, c, d]),
        promptText: 'Qual forma completa o padrão?',
        spokenPrompt: 'Observe o padrão! Qual forma vem depois?',
      };
    }
    return {
      sequence: [a, a, b, a, a],
      answer: b,
      options: shuffle([a, b, c, d]),
      promptText: 'Qual forma completa o padrão?',
      spokenPrompt: 'Observe o padrão! Qual forma vem depois?',
    };
  });
}

// --- Figures & Logic ---
export interface ShadowQuestion {
  target: FigureItem;
  options: FigureItem[];
}

export function generateShadowQuestions(ageLevel: AgeLevel, count = 4): ShadowQuestion[] {
  const optionCount = ageLevel === '3-4' ? 3 : 4;
  const targets = shuffle(FIGURES).slice(0, count);
  return targets.map((target) => {
    const distractors = shuffle(FIGURES.filter((f) => f.id !== target.id)).slice(
      0,
      optionCount - 1
    );
    return {
      target,
      options: shuffle([target, ...distractors]),
    };
  });
}

export interface OddOneOutQuestion {
  commonFigure: FigureItem;
  oddFigure: FigureItem;
  items: { figure: FigureItem; isOdd: boolean; key: string }[];
}

export function generateOddOneOutQuestions(ageLevel: AgeLevel, count = 4): OddOneOutQuestion[] {
  const totalSlots = ageLevel === '3-4' ? 4 : 6;
  const maxPairs = Math.floor(FIGURES.length / 2);
  const safeCount = Math.max(0, Math.min(count, maxPairs));
  const questions: OddOneOutQuestion[] = [];
  const shuffled = shuffle(FIGURES);

  for (let i = 0; i < safeCount; i++) {
    const commonFigure = shuffled[i * 2];
    const oddFigure = shuffled[i * 2 + 1];
    const raw = [
      { figure: oddFigure, isOdd: true, key: `odd-${i}` },
      ...Array.from({ length: totalSlots - 1 }, (_, k) => ({
        figure: commonFigure,
        isOdd: false,
        key: `common-${i}-${k}`,
      })),
    ];
    questions.push({
      commonFigure,
      oddFigure,
      items: shuffle(raw),
    });
  }

  return questions;
}

export interface CategoryGroup {
  id: 'animal' | 'fruta' | 'natureza' | 'objeto';
  label: string;
  colorHex: string;
}

export interface CategorySortRound {
  groupA: CategoryGroup;
  groupB: CategoryGroup;
  items: FigureItem[];
}

const CATEGORY_META: Record<CategoryGroup['id'], CategoryGroup> = {
  animal: { id: 'animal', label: 'Animais', colorHex: '#FF924C' },
  fruta: { id: 'fruta', label: 'Frutas', colorHex: '#FF595E' },
  natureza: { id: 'natureza', label: 'Natureza', colorHex: '#52B788' },
  objeto: { id: 'objeto', label: 'Objetos', colorHex: '#3A86FF' },
};

export function generateCategoryRound(ageLevel: AgeLevel): CategorySortRound {
  const pairs: [CategoryGroup['id'], CategoryGroup['id']][] = [
    ['animal', 'fruta'],
    ['animal', 'objeto'],
    ['natureza', 'objeto'],
  ];
  const [idA, idB] = pickRandom(pairs);
  const perGroup = ageLevel === '3-4' ? 2 : 3;
  const itemsA = shuffle(FIGURES.filter((f) => f.category === idA)).slice(0, perGroup);
  const itemsB = shuffle(FIGURES.filter((f) => f.category === idB)).slice(0, perGroup);

  return {
    groupA: CATEGORY_META[idA],
    groupB: CATEGORY_META[idB],
    items: shuffle([...itemsA, ...itemsB]),
  };
}
