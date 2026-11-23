import type { AgeLevel, ColorInfo, FigureId, FigureItem, ForeignLanguage, ShapeInfo } from '../types';
import { COLOR_MIXES, COLORS, FIGURES, RHYME_PAIRS, SHAPES } from '../data/catalog';
import {
  COLOR_TRANSLATIONS,
  FIGURE_TRANSLATIONS,
  GREETINGS,
  NUMBER_TRANSLATIONS,
  type GreetingItem,
} from '../data/languagesCatalog';

/** Embaralha uma cópia do array usando Fisher-Yates. */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Seleciona um item aleatório de um array não vazio. */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Literacy ---
/** Questão gerada para os modos de letra inicial e completar palavra. */
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

/**
 * Gera questões de alfabetização (som inicial ou completar palavra) adaptadas à faixa etária.
 *
 * @param ageLevel - Faixa etária (`'3-4'` usa apenas vogais; `'5-6'` inclui todo o catálogo).
 * @param count - Quantidade de questões da rodada.
 * @param forcedMode - Opcionalmente força `'initial-letter'` ou `'complete-word'`.
 */
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

/** Questão gerada para o modo de associação de rimas. */
export interface RhymeQuestion {
  anchor: FigureItem;
  match: FigureItem;
  options: FigureItem[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera rodadas de associação de rimas fonéticas entre figuras do catálogo. */
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

/** Questão gerada para o modo de contagem de sílabas. */
export interface SyllableQuestion {
  target: FigureItem;
  syllableCount: number;
  options: number[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera rodadas de contagem de sílabas (até 3 sílabas para `3-4`; todas para `5-6`). */
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
/** Questão gerada para contagem visual ou adição simples. */
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
  [
    'maca', 'morango', 'banana', 'bola', 'flor', 'pato', 'peixe',
    'abelha', 'gato', 'carro', 'cachorro', 'passaro', 'melancia', 'livro', 'estrela', 'uva',
  ].includes(f.id)
);

/** Gera rodadas de contagem ou soma visual conforme a faixa etária. */
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

/** Questão de comparação de quantidades entre dois grupos ("mais" ou "menos"). */
export interface CompareQuestion {
  figure: FigureItem;
  leftCount: number;
  rightCount: number;
  askMost: boolean; // true = "mais", false = "menos"
  correctSide: 'left' | 'right';
  promptText: string;
  spokenPrompt: string;
}

/** Gera comparações entre dois grupos de figuras ("mais" para `3-4`; alternado "mais"/"menos" para `5-6`). */
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

/** Questão visual de subtração simples. */
export interface SubtractionQuestion {
  figure: FigureItem;
  startCount: number;
  removeCount: number;
  answer: number;
  options: number[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera problemas visuais de subtração simples com itens saindo do grupo. */
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

/** Questão de sequência numérica com lacuna. */
export interface SequenceQuestion {
  items: (number | null)[];
  missingIndex: number;
  answer: number;
  options: number[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera sequências numéricas com um elemento oculto para completar. */
export function generateSequenceQuestions(ageLevel: AgeLevel, count = 4): SequenceQuestion[] {
  return Array.from({ length: count }, () => {
    const step = ageLevel === '5-6' && Math.random() > 0.65 ? 2 : 1;
    const start = ageLevel === '3-4' ? 1 : 1 + Math.floor(Math.random() * 5);
    const full = [start, start + step, start + step * 2, start + step * 3];
    const missingIndex =
      ageLevel === '3-4'
        ? 1 + Math.floor(Math.random() * 2)
        : Math.floor(Math.random() * 4);
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
/** Rodada de caça às figuras da cor selecionada. */
export interface ColorSortRound {
  targetColor: ColorInfo;
  items: { figure: FigureItem; isMatch: boolean }[];
}

/** Seleciona as formas geométricas de uma rodada de encaixe (`3` para `3-4`; `4` para `5-6`). */
export function generateShapeRound(ageLevel: AgeLevel): ShapeInfo[] {
  const count = ageLevel === '3-4' ? 3 : 4;
  return shuffle(SHAPES).slice(0, count);
}

/** Gera uma rodada de caça às figuras da cor alvo selecionada. */
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

/** Rodada de descoberta de mistura entre duas cores primárias. */
export interface ColorMixRound {
  colorA: ColorInfo;
  colorB: ColorInfo;
  result: ColorInfo;
  options: ColorInfo[];
}

/** Gera rodadas de mistura de cores primárias para descobrir a cor secundária resultante. */
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

/** Questão de sequência lógica com formas geométricas. */
export interface PatternQuestion {
  sequence: ShapeInfo[];
  answer: ShapeInfo;
  options: ShapeInfo[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera sequências lógicas de formas geométricas para completar o padrão. */
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
/** Questão de associação entre silhueta e figura. */
export interface ShadowQuestion {
  target: FigureItem;
  options: FigureItem[];
}

/** Gera desafios de correspondência entre silhuetas e figuras coloridas. */
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

/** Questão de identificação da figura diferente na grade. */
export interface OddOneOutQuestion {
  commonFigure: FigureItem;
  oddFigure: FigureItem;
  items: { figure: FigureItem; isOdd: boolean; key: string }[];
}

/** Gera grades onde apenas uma figura é diferente das demais. */
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

/** Metadados de uma categoria semântica no modo Grupos. */
export interface CategoryGroup {
  id: 'animal' | 'fruta' | 'natureza' | 'objeto';
  label: string;
  colorHex: string;
  sampleFigureId: FigureId;
}

/** Rodada de classificação entre dois grupos semânticos. */
export interface CategorySortRound {
  groupA: CategoryGroup;
  groupB: CategoryGroup;
  items: FigureItem[];
}

const CATEGORY_META: Record<CategoryGroup['id'], CategoryGroup> = {
  animal: { id: 'animal', label: 'Animais', colorHex: '#EA580C', sampleFigureId: 'urso' },
  fruta: { id: 'fruta', label: 'Frutas', colorHex: '#E11D48', sampleFigureId: 'maca' },
  natureza: { id: 'natureza', label: 'Natureza', colorHex: '#059669', sampleFigureId: 'arvore' },
  objeto: { id: 'objeto', label: 'Objetos', colorHex: '#2563EB', sampleFigureId: 'bola' },
};

/** Gera rodadas de classificação entre dois grupos semânticos (Animais, Frutas, Natureza, Objetos). */
export function generateCategoryRound(ageLevel: AgeLevel): CategorySortRound {
  const pairs: [CategoryGroup['id'], CategoryGroup['id']][] = [
    ['animal', 'fruta'],
    ['animal', 'objeto'],
    ['animal', 'natureza'],
    ['fruta', 'natureza'],
    ['fruta', 'objeto'],
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

// --- New v2 Generators ---

/** Questão de montagem de palavras com letras embaralhadas. */
export interface WordBuilderQuestion {
  target: FigureItem;
  letters: { uid: string; char: string }[];
  promptText: string;
  spokenPrompt: string;
}

const BUILDER_WORDS_3_4: FigureId[] = ['sol', 'lua', 'uva', 'pao', 'mao'];
const BUILDER_WORDS_5_6: FigureId[] = [
  'bola', 'casa', 'dado', 'gato', 'pato', 'sapo', 'flor', 'urso', 'rato', 'leao', 'livro',
];

/** Gera rodadas de montagem de palavras com letras embaralhadas conforme a faixa etária. */
export function generateWordBuilderQuestions(ageLevel: AgeLevel, count = 4): WordBuilderQuestion[] {
  const allowedIds = ageLevel === '3-4' ? BUILDER_WORDS_3_4 : BUILDER_WORDS_5_6;
  const pool = shuffle(FIGURES.filter((f) => allowedIds.includes(f.id))).slice(0, count);

  return pool.map((target) => {
    const chars = target.name.split('').map((char, idx) => ({
      uid: `${target.id}-${idx}-${char}`,
      char,
    }));
    let scrambled = shuffle(chars);
    if (scrambled.every((c, i) => c.char === chars[i].char) && chars.length > 1) {
      [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
    }
    return {
      target,
      letters: scrambled,
      promptText: `Monte a palavra: ${target.name}`,
      spokenPrompt: `Toque nas letras na ordem certa para montar a palavra ${target.name.toLowerCase()}!`,
    };
  });
}

/** Item ordenável por tamanho ou valor numérico. */
export interface OrderSizeItem {
  id: string;
  value: number;
  figure?: FigureItem;
}

/** Questão de ordenação crescente (tamanhos ou números). */
export interface OrderSizeQuestion {
  mode: 'sizes' | 'numbers';
  items: OrderSizeItem[];
  expectedOrder: number[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera questões de ordenação crescente (tamanhos para 3–4 anos; números para 5–6 anos). */
export function generateOrderSizeQuestions(ageLevel: AgeLevel, count = 4): OrderSizeQuestion[] {
  return Array.from({ length: count }, () => {
    if (ageLevel === '3-4') {
      const fig = pickRandom(COUNTABLE_FIGURES);
      const sizes = [1, 2, 3]; // 1 = pequeno, 2 = médio, 3 = grande
      const items = shuffle(sizes).map((val) => ({
        id: `size-${val}`,
        value: val,
        figure: fig,
      }));
      return {
        mode: 'sizes',
        items,
        expectedOrder: [1, 2, 3],
        promptText: 'Toque do MENOR para o MAIOR!',
        spokenPrompt: 'Toque nas figuras do menor para o maior!',
      };
    }

    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
    const expectedOrder = [...nums].sort((a, b) => a - b);
    return {
      mode: 'numbers',
      items: nums.map((n) => ({ id: `num-${n}`, value: n })),
      expectedOrder,
      promptText: 'Toque nos números do MENOR para o MAIOR!',
      spokenPrompt: 'Toque nos números do menor para o maior!',
    };
  });
}

/** Questão de associação lógica entre pares relacionados. */
export interface AssociationQuestion {
  anchor: FigureItem;
  match: FigureItem;
  options: FigureItem[];
  promptText: string;
  spokenPrompt: string;
}

const ASSOCIATION_PAIRS: [FigureId, FigureId][] = [
  ['abelha', 'flor'],
  ['peixe', 'ilha'],
  ['lua', 'estrela'],
  ['sol', 'nuvem'],
  ['gato', 'rato'],
  ['pato', 'sapo'],
  ['cachorro', 'casa'],
  ['passaro', 'arvore'],
  ['sol', 'arcoiris'],
  ['livro', 'estrela'],
  ['urso', 'abelha'],
  ['tartaruga', 'ilha'],
  ['aviao', 'nuvem'],
  ['morango', 'melancia'],
];

/** Gera pares de associação lógica entre figuras do catálogo. */
export function generateAssociationQuestions(ageLevel: AgeLevel, count = 4): AssociationQuestion[] {
  const byId = new Map<FigureId, FigureItem>(FIGURES.map((f) => [f.id, f]));
  const optionCount = ageLevel === '3-4' ? 3 : 4;
  const pairs = shuffle(ASSOCIATION_PAIRS).slice(0, count);

  return pairs.map(([aId, bId]) => {
    const anchor = byId.get(aId)!;
    const match = byId.get(bId)!;
    const distractors = shuffle(
      FIGURES.filter((f) => f.id !== anchor.id && f.id !== match.id)
    ).slice(0, optionCount - 1);
    return {
      anchor,
      match,
      options: shuffle([match, ...distractors]),
      promptText: `Quem combina com ${anchor.name}?`,
      spokenPrompt: `Quem combina com ${anchor.name.toLowerCase()}?`,
    };
  });
}

/** Questão de reconhecimento de onomatopeia animal. */
export interface AnimalSoundQuestion {
  target: FigureItem;
  onomatopoeia: string;
  spokenPrompt: string;
  options: FigureItem[];
}

const ANIMAL_SOUNDS: { id: FigureId; sound: string; prompt: string }[] = [
  { id: 'gato', sound: 'Miau, Miau!', prompt: 'Quem faz Miau, Miau?' },
  { id: 'pato', sound: 'Quá, Quá!', prompt: 'Quem faz Quá, Quá?' },
  { id: 'sapo', sound: 'Croac, Croac!', prompt: 'Quem faz Croac, Croac?' },
  { id: 'abelha', sound: 'Zum, Zum!', prompt: 'Quem faz Zum, Zum?' },
  { id: 'ovelha', sound: 'Méé, Méé!', prompt: 'Quem faz Méé, Méé?' },
  { id: 'cachorro', sound: 'Au, Au!', prompt: 'Quem faz Au, Au!' },
  { id: 'leao', sound: 'Roar, Uau!', prompt: 'Quem ruge forte: Roar!' },
  { id: 'passaro', sound: 'Piu, Piu!', prompt: 'Quem faz Piu, Piu?' },
  { id: 'urso', sound: 'Grrr, Grrr!', prompt: 'Quem faz Grrr, Grrr?' },
];

/** Gera rodadas de reconhecimento de sons de animais (onomatopeias faladas). */
export function generateAnimalSoundQuestions(ageLevel: AgeLevel, count = 4): AnimalSoundQuestion[] {
  const byId = new Map<FigureId, FigureItem>(FIGURES.map((f) => [f.id, f]));
  const optionCount = ageLevel === '3-4' ? 3 : 4;
  return shuffle(ANIMAL_SOUNDS)
    .slice(0, count)
    .map((entry) => {
      const target = byId.get(entry.id)!;
      const distractors = shuffle(
        FIGURES.filter((f) => f.category === 'animal' && f.id !== target.id)
      ).slice(0, optionCount - 1);
      return {
        target,
        onomatopoeia: entry.sound,
        spokenPrompt: entry.prompt,
        options: shuffle([target, ...distractors]),
      };
    });
}

// --- New v3 Generators ---

/** Questão de identificação da sílaba inicial da palavra. */
export interface InitialSyllableQuestion {
  target: FigureItem;
  correctSyllable: string;
  options: string[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera rodadas de identificação da sílaba inicial de cada palavra. */
export function generateInitialSyllableQuestions(
  ageLevel: AgeLevel,
  count = 4
): InitialSyllableQuestion[] {
  const pool = FIGURES.filter((f) => f.syllables.length >= 2);
  const selected = shuffle(pool).slice(0, count);
  const allFirstSyllables = Array.from(new Set(pool.map((f) => f.syllables[0])));
  const optionCount = ageLevel === '3-4' ? 3 : 4;

  return selected.map((target) => {
    const correctSyllable = target.syllables[0];
    const distractors = shuffle(
      allFirstSyllables.filter((s) => s !== correctSyllable)
    ).slice(0, optionCount - 1);
    return {
      target,
      correctSyllable,
      options: shuffle([correctSyllable, ...distractors]),
      promptText: `Qual pedacinho começa ${target.name}?`,
      spokenPrompt: `Com qual pedacinho começa a palavra ${target.name.toLowerCase()}?`,
    };
  });
}

/** Opção de grupo de figuras no modo Quantidades. */
export interface NumberQuantityOption {
  id: string;
  count: number;
}

/** Questão de correspondência entre numeral e quantidade de figuras. */
export interface NumberQuantityQuestion {
  targetNumber: number;
  figure: FigureItem;
  options: NumberQuantityOption[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera rodadas para associar um número ao grupo com a quantidade exata de figuras. */
export function generateNumberQuantityQuestions(
  ageLevel: AgeLevel,
  count = 4
): NumberQuantityQuestion[] {
  const maxNum = ageLevel === '3-4' ? 5 : 8;
  const optionCount = ageLevel === '3-4' ? 3 : 4;

  return Array.from({ length: count }, (_, qIdx) => {
    const figure = pickRandom(COUNTABLE_FIGURES);
    const targetNumber = 1 + Math.floor(Math.random() * maxNum);
    const counts = new Set<number>([targetNumber]);
    while (counts.size < optionCount) {
      counts.add(1 + Math.floor(Math.random() * maxNum));
    }
    const options = shuffle(Array.from(counts)).map((c, i) => ({
      id: `nq-${qIdx}-${i}-${c}`,
      count: c,
    }));
    return {
      targetNumber,
      figure,
      options,
      promptText: `Encontre o grupo com ${targetNumber}!`,
      spokenPrompt: `Toque no grupo que tem ${targetNumber} ${
        targetNumber === 1 ? 'figura' : 'figuras'
      }!`,
    };
  });
}

/** Questão de associação entre objeto cotidiano e forma geométrica. */
export interface ShapeObjectQuestion {
  figure: FigureItem;
  shape: ShapeInfo;
  options: ShapeInfo[];
  promptText: string;
  spokenPrompt: string;
}

const SHAPE_OBJECT_PAIRS: { figureId: FigureId; shapeId: ShapeInfo['id'] }[] = [
  { figureId: 'bola', shapeId: 'circulo' },
  { figureId: 'sol', shapeId: 'circulo' },
  { figureId: 'dado', shapeId: 'quadrado' },
  { figureId: 'casa', shapeId: 'quadrado' },
  { figureId: 'livro', shapeId: 'retangulo' },
  { figureId: 'estrela', shapeId: 'estrela' },
  { figureId: 'melancia', shapeId: 'triangulo' },
  { figureId: 'morango', shapeId: 'coracao' },
];

/** Gera rodadas associando objetos do cotidiano às suas formas geométricas. */
export function generateShapeObjectQuestions(
  ageLevel: AgeLevel,
  count = 4
): ShapeObjectQuestion[] {
  const figMap = new Map(FIGURES.map((f) => [f.id, f]));
  const shapeMap = new Map(SHAPES.map((s) => [s.id, s]));
  const optionCount = ageLevel === '3-4' ? 3 : 4;

  return shuffle(SHAPE_OBJECT_PAIRS)
    .slice(0, count)
    .map(({ figureId, shapeId }) => {
      const figure = figMap.get(figureId)!;
      const shape = shapeMap.get(shapeId)!;
      const distractors = shuffle(SHAPES.filter((s) => s.id !== shape.id)).slice(
        0,
        optionCount - 1
      );
      return {
        figure,
        shape,
        options: shuffle([shape, ...distractors]),
        promptText: `${figure.name} lembra qual forma?`,
        spokenPrompt: `${figure.name.toLowerCase()} parece com qual forma?`,
      };
    });
}

/** Questão de matriz lógica visual 2×2. */
export interface MatrixLogicQuestion {
  topLeft: FigureItem;
  topRight: FigureItem;
  bottomLeft: FigureItem;
  answer: FigureItem;
  options: FigureItem[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera matrizes lógicas 2x2 onde a criança completa o padrão visual (linha A-B / A-B ou A-A / B-B). */
export function generateMatrixLogicQuestions(
  ageLevel: AgeLevel,
  count = 4
): MatrixLogicQuestion[] {
  const optionCount = ageLevel === '3-4' ? 3 : 4;

  return Array.from({ length: count }, () => {
    const [a, b, c, d] = shuffle(FIGURES).slice(0, 4);
    const sameRowPattern = Math.random() > 0.5;
    const topLeft = a;
    const topRight = sameRowPattern ? a : b;
    const bottomLeft = sameRowPattern ? b : a;
    const answer = b;
    const distractors = [a, c, d].slice(0, optionCount - 1);

    return {
      topLeft,
      topRight,
      bottomLeft,
      answer,
      options: shuffle([answer, ...distractors]),
      promptText: 'Qual figura completa o quadro?',
      spokenPrompt: 'Observe o quadro! Qual figura está faltando?',
    };
  });
}

// --- New v4 Generators ---

/** Questão de identificação da letra final da palavra. */
export interface FinalLetterQuestion {
  target: FigureItem;
  correctLetter: string;
  options: string[];
  promptText: string;
  spokenPrompt: string;
}

const FINAL_LETTER_POOL = ['A', 'E', 'I', 'O', 'U', 'L', 'M', 'R', 'S'];

/** Gera rodadas para identificar a letra final de cada palavra. */
export function generateFinalLetterQuestions(
  ageLevel: AgeLevel,
  count = 4
): FinalLetterQuestion[] {
  const eligible = FIGURES.filter((f) => /^[A-Z]$/.test(f.name.slice(-1)));
  const pool =
    ageLevel === '3-4'
      ? eligible.filter((f) => ['A', 'E', 'O', 'U'].includes(f.name.slice(-1)))
      : eligible;
  const selected = shuffle(pool).slice(0, count);
  const optionCount = ageLevel === '3-4' ? 3 : 4;

  return selected.map((target) => {
    const correctLetter = target.name.slice(-1);
    const distractors = shuffle(
      FINAL_LETTER_POOL.filter((l) => l !== correctLetter)
    ).slice(0, optionCount - 1);
    return {
      target,
      correctLetter,
      options: shuffle([correctLetter, ...distractors]),
      promptText: `Com qual letra termina ${target.name}?`,
      spokenPrompt: `Com qual letra termina a palavra ${target.name.toLowerCase()}?`,
    };
  });
}

/** Questão visual de divisão igualitária entre 2 amigos (metade concreta). */
export interface ShareQuestion {
  figure: FigureItem;
  total: number;
  answer: number;
  options: number[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera problemas visuais de dividir figuras igualmente entre dois amigos. */
export function generateShareQuestions(ageLevel: AgeLevel, count = 4): ShareQuestion[] {
  const maxEach = ageLevel === '3-4' ? 3 : 5;
  const optionCount = ageLevel === '3-4' ? 3 : 4;

  return Array.from({ length: count }, () => {
    const figure = pickRandom(COUNTABLE_FIGURES);
    const answer = 1 + Math.floor(Math.random() * maxEach);
    const total = answer * 2;
    const optionSet = new Set<number>([answer]);
    let spread = 4;
    while (optionSet.size < optionCount) {
      const candidate = Math.max(1, answer + Math.floor(Math.random() * spread) - 1);
      optionSet.add(candidate);
      spread += 1;
    }
    return {
      figure,
      total,
      answer,
      options: shuffle(Array.from(optionSet)),
      promptText: `Divida ${total} igualmente para 2 amigos!`,
      spokenPrompt: `Vamos dividir ${total} figuras entre dois amigos! Quantas cada um ganha?`,
    };
  });
}

/** Questão semântica de encontrar o intruso da categoria (3 da mesma categoria + 1 diferente). */
export interface CategoryIntruderQuestion {
  majorityCategory: CategoryGroup;
  intruder: FigureItem;
  items: { figure: FigureItem; isIntruder: boolean }[];
  promptText: string;
  spokenPrompt: string;
}

/** Gera desafios semânticos com 3 figuras de uma categoria e 1 intruso de outra categoria. */
export function generateCategoryIntruderQuestions(
  _ageLevel: AgeLevel,
  count = 4
): CategoryIntruderQuestion[] {
  const categories: CategoryGroup['id'][] = ['animal', 'fruta', 'natureza', 'objeto'];
  const chosenCats = shuffle(categories);

  return Array.from({ length: count }, (_, idx) => {
    const majId = chosenCats[idx % chosenCats.length];
    const otherCatId = pickRandom(categories.filter((c) => c !== majId));
    const majorityItems = shuffle(FIGURES.filter((f) => f.category === majId)).slice(0, 3);
    const intruder = pickRandom(FIGURES.filter((f) => f.category === otherCatId));

    return {
      majorityCategory: CATEGORY_META[majId],
      intruder,
      items: shuffle([
        ...majorityItems.map((figure) => ({ figure, isIntruder: false })),
        { figure: intruder, isIntruder: true },
      ]),
      promptText: 'Qual figura NÃO pertence ao grupo?',
      spokenPrompt: 'Qual figura não pertence ao grupo das outras?',
    };
  });
}

// --- New v5 Generators (Foreign Languages: EN & ES) ---

/** Questão de vocabulário em idioma estrangeiro (Inglês ou Espanhol). */
export interface LangVocabQuestion {
  target: FigureItem;
  word: string;
  options: FigureItem[];
  promptClips: string[];
  nativeClipId: string;
  promptText: string;
}

/** Gera rodadas de vocabulário bilíngue (3 opções para `3-4`; 4 opções para `5-6`). */
export function generateLangVocabQuestions(
  lang: ForeignLanguage,
  ageLevel: AgeLevel,
  count = 5
): LangVocabQuestion[] {
  const optionCount = ageLevel === '3-4' ? 3 : 4;
  const targets = shuffle(FIGURES).slice(0, count);
  const langLabel = lang === 'en' ? 'inglês' : 'espanhol';

  return targets.map((target) => {
    const distractors = shuffle(FIGURES.filter((f) => f.id !== target.id)).slice(
      0,
      optionCount - 1
    );
    const word = FIGURE_TRANSLATIONS[target.id][lang];
    const nativeClipId = `lang-${lang}-fig-${target.id}`;
    return {
      target,
      word,
      options: shuffle([target, ...distractors]),
      promptClips: [`p-lang-toque-${lang}`, nativeClipId],
      nativeClipId,
      promptText: `Em ${langLabel}, toque em: ${word}!`,
    };
  });
}

/** Questão de reconhecimento de cores em idioma estrangeiro. */
export interface LangColorQuestion {
  target: ColorInfo;
  word: string;
  options: ColorInfo[];
  promptClips: string[];
  nativeClipId: string;
  promptText: string;
}

/** Gera rodadas de reconhecimento de cores em Inglês ou Espanhol. */
export function generateLangColorQuestions(
  lang: ForeignLanguage,
  ageLevel: AgeLevel,
  count = 4
): LangColorQuestion[] {
  const optionCount = ageLevel === '3-4' ? 3 : 4;
  const targets = shuffle(COLORS).slice(0, count);
  const langLabel = lang === 'en' ? 'inglês' : 'espanhol';

  return targets.map((target) => {
    const distractors = shuffle(COLORS.filter((c) => c.id !== target.id)).slice(
      0,
      optionCount - 1
    );
    const word = COLOR_TRANSLATIONS[target.id][lang];
    const nativeClipId = `lang-${lang}-color-${target.id}`;
    return {
      target,
      word,
      options: shuffle([target, ...distractors]),
      promptClips: [`p-lang-cor-${lang}`, nativeClipId],
      nativeClipId,
      promptText: `Qual é a cor em ${langLabel}: ${word}?`,
    };
  });
}

/** Questão de reconhecimento de números em idioma estrangeiro. */
export interface LangNumberQuestion {
  target: number;
  word: string;
  options: number[];
  promptClips: string[];
  nativeClipId: string;
  promptText: string;
}

/** Gera rodadas de números em Inglês ou Espanhol (`1–5` para `3-4`; `1–10` para `5-6`). */
export function generateLangNumberQuestions(
  lang: ForeignLanguage,
  ageLevel: AgeLevel,
  count = 5
): LangNumberQuestion[] {
  const maxNum = ageLevel === '3-4' ? 5 : 10;
  const optionCount = ageLevel === '3-4' ? 3 : 4;
  const pool = Array.from({ length: maxNum }, (_, i) => i + 1);
  const targets = shuffle(pool).slice(0, Math.min(count, pool.length));
  const langLabel = lang === 'en' ? 'inglês' : 'espanhol';

  return targets.map((target) => {
    const distractors = shuffle(pool.filter((n) => n !== target)).slice(0, optionCount - 1);
    const word = NUMBER_TRANSLATIONS[target][lang];
    const nativeClipId = `lang-${lang}-num-${target}`;
    return {
      target,
      word,
      options: shuffle([target, ...distractors]),
      promptClips: [`p-lang-num-${lang}`, nativeClipId],
      nativeClipId,
      promptText: `Toque no número em ${langLabel}: ${word}!`,
    };
  });
}

/** Questão de cumprimentos e expressões cotidianas em idioma estrangeiro. */
export interface LangGreetingQuestion {
  target: GreetingItem;
  word: string;
  options: GreetingItem[];
  promptClips: string[];
  nativeClipId: string;
  promptText: string;
}

/** Gera rodadas de associação entre cumprimentos em Inglês/Espanhol e cenas ilustradas. */
export function generateLangGreetingQuestions(
  lang: ForeignLanguage,
  ageLevel: AgeLevel,
  count = 4
): LangGreetingQuestion[] {
  const optionCount = ageLevel === '3-4' ? 3 : 4;
  const targets = shuffle(GREETINGS).slice(0, Math.min(count, GREETINGS.length));
  const langLabel = lang === 'en' ? 'inglês' : 'espanhol';

  return targets.map((target) => {
    const distractors = shuffle(GREETINGS.filter((g) => g.id !== target.id)).slice(
      0,
      optionCount - 1
    );
    const word = target.translations[lang];
    const nativeClipId = `lang-${lang}-greet-${target.id}`;
    return {
      target,
      word,
      options: shuffle([target, ...distractors]),
      promptClips: [`p-lang-greet-${lang}-${target.id}`, nativeClipId],
      nativeClipId,
      promptText: `Em ${langLabel}: "${word}" (${target.ptLabel})`,
    };
  });
}

