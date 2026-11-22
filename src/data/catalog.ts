import type {
  ColorId,
  ColorInfo,
  FigureId,
  FigureItem,
  PillarId,
  ShapeInfo,
  StickerItem,
  TracingTemplate,
} from '../types';

export interface PillarMeta {
  id: PillarId;
  title: string;
  subtitle: string;
  spokenIntro: string;
  bgGradient: string;
  borderColor: string;
  badgeColor: string;
}

export const PILLARS: PillarMeta[] = [
  {
    id: 'literacy',
    title: 'Alfabetização',
    subtitle: 'Vogais, rimas, sílabas e palavras',
    spokenIntro: 'Vamos brincar com as letras, rimas e palavras!',
    bgGradient: 'from-[#FF6B6B] to-[#FF8E72]',
    borderColor: '#D94848',
    badgeColor: '#FFE3E3',
  },
  {
    id: 'math',
    title: 'Matemática',
    subtitle: 'Contar, somar, comparar e sequências',
    spokenIntro: 'Hora de contar e brincar com os números!',
    bgGradient: 'from-[#4D96FF] to-[#6BC5FF]',
    borderColor: '#2B6FD9',
    badgeColor: '#E0F0FF',
  },
  {
    id: 'shapes-colors',
    title: 'Formas e Cores',
    subtitle: 'Encaixar, misturar cores e padrões',
    spokenIntro: 'Vamos descobrir cores, misturas e formas!',
    bgGradient: 'from-[#6BCB77] to-[#4ADE80]',
    borderColor: '#3D9E49',
    badgeColor: '#E3FCE8',
  },
  {
    id: 'figures-logic',
    title: 'Figuras e Lógica',
    subtitle: 'Memória, grupos e quebra-cabeça',
    spokenIntro: 'Vamos exercitar a memória, lógica e quebra-cabeça!',
    bgGradient: 'from-[#9B5DE5] to-[#B57BFF]',
    borderColor: '#7235B8',
    badgeColor: '#F3E8FF',
  },
  {
    id: 'tracing',
    title: 'Traçado Mágico',
    subtitle: 'Caminhos, formas, letras e números',
    spokenIntro: 'Use o dedinho para desenhar no traçado mágico!',
    bgGradient: 'from-[#FF9F43] to-[#FFC048]',
    borderColor: '#D67B1F',
    badgeColor: '#FFF3DC',
  },
  {
    id: 'music-sounds',
    title: 'Música e Sons',
    subtitle: 'Xilofone, melodia e sons dos bichos',
    spokenIntro: 'Vamos fazer música e descobrir os sons!',
    bgGradient: 'from-[#F15BB5] to-[#FF85A1]',
    borderColor: '#C9368C',
    badgeColor: '#FFE5F1',
  },
  {
    id: 'emotions-routine',
    title: 'Emoções e Rotina',
    subtitle: 'Sentimentos, dia, noite e hábitos',
    spokenIntro: 'Vamos aprender sobre emoções e nossa rotina!',
    bgGradient: 'from-[#00BBF9] to-[#4CC9F0]',
    borderColor: '#0091C2',
    badgeColor: '#E0F7FF',
  },
  {
    id: 'nature-habitats',
    title: 'Natureza e Habitats',
    subtitle: 'Onde os bichos moram e o clima',
    spokenIntro: 'Vamos explorar a natureza, o clima e os animais!',
    bgGradient: 'from-[#10B981] to-[#34D399]',
    borderColor: '#059669',
    badgeColor: '#DCFCE7',
  },
];

export const COLORS: ColorInfo[] = [
  {
    id: 'vermelho',
    name: 'Vermelho',
    hex: '#FF595E',
    darkHex: '#C9383D',
    bgClass: 'bg-[#FF595E]',
    borderClass: 'border-[#C9383D]',
    textClass: 'text-[#C9383D]',
  },
  {
    id: 'azul',
    name: 'Azul',
    hex: '#3A86FF',
    darkHex: '#1D5FD1',
    bgClass: 'bg-[#3A86FF]',
    borderClass: 'border-[#1D5FD1]',
    textClass: 'text-[#1D5FD1]',
  },
  {
    id: 'amarelo',
    name: 'Amarelo',
    hex: '#FFCA3A',
    darkHex: '#D19A08',
    bgClass: 'bg-[#FFCA3A]',
    borderClass: 'border-[#D19A08]',
    textClass: 'text-[#A67800]',
  },
  {
    id: 'verde',
    name: 'Verde',
    hex: '#52B788',
    darkHex: '#2D8A60',
    bgClass: 'bg-[#52B788]',
    borderClass: 'border-[#2D8A60]',
    textClass: 'text-[#2D8A60]',
  },
  {
    id: 'laranja',
    name: 'Laranja',
    hex: '#FF924C',
    darkHex: '#D1651F',
    bgClass: 'bg-[#FF924C]',
    borderClass: 'border-[#D1651F]',
    textClass: 'text-[#C25914]',
  },
  {
    id: 'roxo',
    name: 'Roxo',
    hex: '#8338EC',
    darkHex: '#5E1DB8',
    bgClass: 'bg-[#8338EC]',
    borderClass: 'border-[#5E1DB8]',
    textClass: 'text-[#5E1DB8]',
  },
];

export interface ColorMixRecipe {
  colorA: ColorId;
  colorB: ColorId;
  result: ColorId;
}

export const COLOR_MIXES: ColorMixRecipe[] = [
  { colorA: 'vermelho', colorB: 'amarelo', result: 'laranja' },
  { colorA: 'azul', colorB: 'amarelo', result: 'verde' },
  { colorA: 'vermelho', colorB: 'azul', result: 'roxo' },
];

export const SHAPES: ShapeInfo[] = [
  { id: 'circulo', name: 'Círculo', colorHex: '#FF595E', accentHex: '#FF8A8E' },
  { id: 'quadrado', name: 'Quadrado', colorHex: '#3A86FF', accentHex: '#7FB2FF' },
  { id: 'triangulo', name: 'Triângulo', colorHex: '#FFCA3A', accentHex: '#FFE085' },
  { id: 'estrela', name: 'Estrela', colorHex: '#FF924C', accentHex: '#FFB685' },
  { id: 'coracao', name: 'Coração', colorHex: '#FF5C8D', accentHex: '#FF94B5' },
  { id: 'retangulo', name: 'Retângulo', colorHex: '#52B788', accentHex: '#84D4AE' },
];

export const FIGURES: FigureItem[] = [
  { id: 'abelha', name: 'ABELHA', letter: 'A', isVowel: true, colorId: 'amarelo', category: 'animal', missingLetterIndex: 0, syllables: ['A', 'BE', 'LHA'] },
  { id: 'elefante', name: 'ELEFANTE', letter: 'E', isVowel: true, colorId: 'azul', category: 'animal', missingLetterIndex: 0, syllables: ['E', 'LE', 'FAN', 'TE'] },
  { id: 'ilha', name: 'ILHA', letter: 'I', isVowel: true, colorId: 'verde', category: 'natureza', missingLetterIndex: 0, syllables: ['I', 'LHA'] },
  { id: 'ovelha', name: 'OVELHA', letter: 'O', isVowel: true, colorId: 'roxo', category: 'animal', missingLetterIndex: 0, syllables: ['O', 'VE', 'LHA'] },
  { id: 'urso', name: 'URSO', letter: 'U', isVowel: true, colorId: 'laranja', category: 'animal', missingLetterIndex: 0, syllables: ['UR', 'SO'] },
  { id: 'bola', name: 'BOLA', letter: 'B', isVowel: false, colorId: 'azul', category: 'objeto', missingLetterIndex: 1, syllables: ['BO', 'LA'] },
  { id: 'casa', name: 'CASA', letter: 'C', isVowel: false, colorId: 'vermelho', category: 'objeto', missingLetterIndex: 1, syllables: ['CA', 'SA'] },
  { id: 'dado', name: 'DADO', letter: 'D', isVowel: false, colorId: 'roxo', category: 'objeto', missingLetterIndex: 1, syllables: ['DA', 'DO'] },
  { id: 'flor', name: 'FLOR', letter: 'F', isVowel: false, colorId: 'roxo', category: 'natureza', missingLetterIndex: 2, syllables: ['FLOR'] },
  { id: 'gato', name: 'GATO', letter: 'G', isVowel: false, colorId: 'laranja', category: 'animal', missingLetterIndex: 1, syllables: ['GA', 'TO'] },
  { id: 'lua', name: 'LUA', letter: 'L', isVowel: false, colorId: 'amarelo', category: 'natureza', missingLetterIndex: 1, syllables: ['LU', 'A'] },
  { id: 'maca', name: 'MAÇÃ', letter: 'M', isVowel: false, colorId: 'vermelho', category: 'fruta', missingLetterIndex: 0, syllables: ['MA', 'ÇÃ'] },
  { id: 'nuvem', name: 'NUVEM', letter: 'N', isVowel: false, colorId: 'azul', category: 'natureza', missingLetterIndex: 0, syllables: ['NU', 'VEM'] },
  { id: 'pato', name: 'PATO', letter: 'P', isVowel: false, colorId: 'amarelo', category: 'animal', missingLetterIndex: 1, syllables: ['PA', 'TO'] },
  { id: 'sapo', name: 'SAPO', letter: 'S', isVowel: false, colorId: 'verde', category: 'animal', missingLetterIndex: 1, syllables: ['SA', 'PO'] },
  { id: 'sol', name: 'SOL', letter: 'S', isVowel: false, colorId: 'amarelo', category: 'natureza', missingLetterIndex: 1, syllables: ['SOL'] },
  { id: 'peixe', name: 'PEIXE', letter: 'P', isVowel: false, colorId: 'azul', category: 'animal', missingLetterIndex: 0, syllables: ['PEI', 'XE'] },
  { id: 'morango', name: 'MORANGO', letter: 'M', isVowel: false, colorId: 'vermelho', category: 'fruta', missingLetterIndex: 0, syllables: ['MO', 'RAN', 'GO'] },
  { id: 'banana', name: 'BANANA', letter: 'B', isVowel: false, colorId: 'amarelo', category: 'fruta', missingLetterIndex: 0, syllables: ['BA', 'NA', 'NA'] },
  { id: 'borboleta', name: 'BORBOLETA', letter: 'B', isVowel: false, colorId: 'roxo', category: 'animal', missingLetterIndex: 0, syllables: ['BOR', 'BO', 'LE', 'TA'] },
  { id: 'carro', name: 'CARRO', letter: 'C', isVowel: false, colorId: 'vermelho', category: 'objeto', missingLetterIndex: 0, syllables: ['CAR', 'RO'] },
  { id: 'foguete', name: 'FOGUETE', letter: 'F', isVowel: false, colorId: 'laranja', category: 'objeto', missingLetterIndex: 0, syllables: ['FO', 'GUE', 'TE'] },
  { id: 'rato', name: 'RATO', letter: 'R', isVowel: false, colorId: 'azul', category: 'animal', missingLetterIndex: 0, syllables: ['RA', 'TO'] },
  { id: 'pao', name: 'PÃO', letter: 'P', isVowel: false, colorId: 'laranja', category: 'objeto', missingLetterIndex: 0, syllables: ['PÃO'] },
  { id: 'mao', name: 'MÃO', letter: 'M', isVowel: false, colorId: 'laranja', category: 'objeto', missingLetterIndex: 0, syllables: ['MÃO'] },
  { id: 'uva', name: 'UVA', letter: 'U', isVowel: true, colorId: 'roxo', category: 'fruta', missingLetterIndex: 0, syllables: ['U', 'VA'] },
  { id: 'arvore', name: 'ÁRVORE', letter: 'A', isVowel: true, colorId: 'verde', category: 'natureza', missingLetterIndex: 2, syllables: ['ÁR', 'VO', 'RE'] },
  { id: 'estrela', name: 'ESTRELA', letter: 'E', isVowel: true, colorId: 'amarelo', category: 'natureza', missingLetterIndex: 0, syllables: ['ES', 'TRE', 'LA'] },
];

export const RHYME_PAIRS: [FigureId, FigureId][] = [
  ['gato', 'pato'],
  ['gato', 'rato'],
  ['pato', 'rato'],
  ['pao', 'mao'],
  ['abelha', 'ovelha'],
];

export const STICKERS: StickerItem[] = [
  { id: 'stk-abelha', name: 'Abelha Zuzu', theme: 'Animais', figureId: 'abelha', bgHex: '#FFF3BF' },
  { id: 'stk-elefante', name: 'Elefante Dudu', theme: 'Animais', figureId: 'elefante', bgHex: '#D0EBFF' },
  { id: 'stk-gato', name: 'Gatinho Mimi', theme: 'Animais', figureId: 'gato', bgHex: '#FFE8CC' },
  { id: 'stk-sapo', name: 'Sapo Pipoca', theme: 'Animais', figureId: 'sapo', bgHex: '#D3F9D8' },
  { id: 'stk-urso', name: 'Urso Mel', theme: 'Animais', figureId: 'urso', bgHex: '#FFE3E3' },
  { id: 'stk-borboleta', name: 'Borboleta Lili', theme: 'Animais', figureId: 'borboleta', bgHex: '#F3D9FA' },
  { id: 'stk-pato', name: 'Patinho Quá', theme: 'Animais', figureId: 'pato', bgHex: '#FFF9DB' },
  { id: 'stk-peixe', name: 'Peixe Bolha', theme: 'Animais', figureId: 'peixe', bgHex: '#C5F6FA' },
  { id: 'stk-rato', name: 'Ratinho Tico', theme: 'Animais', figureId: 'rato', bgHex: '#E9ECEF' },
  { id: 'stk-foguete', name: 'Foguete Turbo', theme: 'Espaço', figureId: 'foguete', bgHex: '#FFE8CC' },
  { id: 'stk-lua', name: 'Lua Soneca', theme: 'Espaço', figureId: 'lua', bgHex: '#E5DBFF' },
  { id: 'stk-sol', name: 'Sol Brilhante', theme: 'Espaço', figureId: 'sol', bgHex: '#FFF3BF' },
  { id: 'stk-estrela', name: 'Estrela Guia', theme: 'Espaço', figureId: 'estrela', bgHex: '#FFF9DB' },
  { id: 'stk-nuvem', name: 'Nuvem Fofa', theme: 'Natureza', figureId: 'nuvem', bgHex: '#D0EBFF' },
  { id: 'stk-flor', name: 'Flor Mágica', theme: 'Natureza', figureId: 'flor', bgHex: '#F3D9FA' },
  { id: 'stk-ilha', name: 'Ilha Feliz', theme: 'Natureza', figureId: 'ilha', bgHex: '#D3F9D8' },
  { id: 'stk-arvore', name: 'Árvore Viva', theme: 'Natureza', figureId: 'arvore', bgHex: '#D3F9D8' },
  { id: 'stk-maca', name: 'Maçã Doce', theme: 'Frutas', figureId: 'maca', bgHex: '#FFE3E3' },
  { id: 'stk-morango', name: 'Moranguinho', theme: 'Frutas', figureId: 'morango', bgHex: '#FFD8E4' },
  { id: 'stk-banana', name: 'Banana Pop', theme: 'Frutas', figureId: 'banana', bgHex: '#FFF3BF' },
  { id: 'stk-uva', name: 'Uva Roxinha', theme: 'Frutas', figureId: 'uva', bgHex: '#F3D9FA' },
  { id: 'stk-carro', name: 'Carrinho Vrum', theme: 'Espaço', figureId: 'carro', bgHex: '#FFE3E3' },
];

export const TRACING_TEMPLATES: TracingTemplate[] = [
  // Caminhos Motores
  {
    id: 'trace-linha',
    label: 'Linha Reta',
    spokenName: 'a linha reta',
    category: 'caminho',
    minLevel: '3-4',
    svgPath: 'M 14 50 L 86 50',
    checkpoints: [
      { x: 14, y: 50 }, { x: 32, y: 50 }, { x: 50, y: 50 }, { x: 68, y: 50 }, { x: 86, y: 50 },
    ],
  },
  {
    id: 'trace-onda',
    label: 'Ondinha',
    spokenName: 'a ondinha',
    category: 'caminho',
    minLevel: '3-4',
    svgPath: 'M 12 52 Q 30 22 50 52 T 88 52',
    checkpoints: [
      { x: 12, y: 52 }, { x: 30, y: 37 }, { x: 50, y: 52 }, { x: 70, y: 67 }, { x: 88, y: 52 },
    ],
  },
  {
    id: 'trace-zigue',
    label: 'Zigue-zague',
    spokenName: 'o zigue-zague',
    category: 'caminho',
    minLevel: '3-4',
    svgPath: 'M 14 70 L 38 30 L 62 70 L 86 30',
    checkpoints: [
      { x: 14, y: 70 }, { x: 38, y: 30 }, { x: 62, y: 70 }, { x: 86, y: 30 },
    ],
  },

  // Formas
  {
    id: 'trace-circulo',
    label: 'Círculo',
    spokenName: 'o Círculo',
    category: 'forma',
    minLevel: '3-4',
    svgPath: 'M 50 15 A 35 35 0 1 1 49.9 15 Z',
    checkpoints: [
      { x: 50, y: 15 }, { x: 75, y: 25 }, { x: 85, y: 50 }, { x: 75, y: 75 },
      { x: 50, y: 85 }, { x: 25, y: 75 }, { x: 15, y: 50 }, { x: 25, y: 25 },
    ],
  },
  {
    id: 'trace-quadrado',
    label: 'Quadrado',
    spokenName: 'o Quadrado',
    category: 'forma',
    minLevel: '3-4',
    svgPath: 'M 20 20 L 80 20 L 80 80 L 20 80 Z',
    checkpoints: [
      { x: 20, y: 20 }, { x: 50, y: 20 }, { x: 80, y: 20 }, { x: 80, y: 50 },
      { x: 80, y: 80 }, { x: 50, y: 80 }, { x: 20, y: 80 }, { x: 20, y: 50 },
    ],
  },
  {
    id: 'trace-triangulo',
    label: 'Triângulo',
    spokenName: 'o Triângulo',
    category: 'forma',
    minLevel: '3-4',
    svgPath: 'M 50 16 L 84 82 L 16 82 Z',
    checkpoints: [
      { x: 50, y: 16 }, { x: 67, y: 49 }, { x: 84, y: 82 },
      { x: 50, y: 82 }, { x: 16, y: 82 }, { x: 33, y: 49 },
    ],
  },
  {
    id: 'trace-coracao',
    label: 'Coração',
    spokenName: 'o Coração',
    category: 'forma',
    minLevel: '5-6',
    svgPath: 'M 50 82 C 22 64 14 44 20 30 C 26 16 42 18 50 30 C 58 18 74 16 80 30 C 86 44 78 64 50 82 Z',
    checkpoints: [
      { x: 50, y: 30 }, { x: 26, y: 22 }, { x: 20, y: 46 },
      { x: 50, y: 82 }, { x: 80, y: 46 }, { x: 74, y: 22 },
    ],
  },
  {
    id: 'trace-estrela',
    label: 'Estrela',
    spokenName: 'a Estrela',
    category: 'forma',
    minLevel: '5-6',
    svgPath: 'M 50 14 L 60 38 L 86 40 L 66 57 L 72 84 L 50 70 L 28 84 L 34 57 L 14 40 L 40 38 Z',
    checkpoints: [
      { x: 50, y: 14 }, { x: 86, y: 40 }, { x: 72, y: 84 },
      { x: 28, y: 84 }, { x: 14, y: 40 },
    ],
  },

  // Letras (5 Vogais para 3-4 + Consoantes para 5-6)
  {
    id: 'trace-A',
    label: 'A',
    spokenName: 'a letra A',
    category: 'letra',
    minLevel: '3-4',
    svgPath: 'M 22 84 L 50 16 L 78 84 M 32 60 L 68 60',
    checkpoints: [
      { x: 22, y: 84 }, { x: 36, y: 50 }, { x: 50, y: 16 },
      { x: 64, y: 50 }, { x: 78, y: 84 }, { x: 50, y: 60 },
    ],
  },
  {
    id: 'trace-E',
    label: 'E',
    spokenName: 'a letra E',
    category: 'letra',
    minLevel: '3-4',
    svgPath: 'M 72 18 L 28 18 L 28 82 L 72 82 M 28 50 L 64 50',
    checkpoints: [
      { x: 72, y: 18 }, { x: 28, y: 18 }, { x: 28, y: 50 },
      { x: 28, y: 82 }, { x: 72, y: 82 }, { x: 60, y: 50 },
    ],
  },
  {
    id: 'trace-I',
    label: 'I',
    spokenName: 'a letra I',
    category: 'letra',
    minLevel: '3-4',
    svgPath: 'M 34 18 L 66 18 M 50 18 L 50 82 M 34 82 L 66 82',
    checkpoints: [
      { x: 50, y: 18 }, { x: 50, y: 40 }, { x: 50, y: 60 }, { x: 50, y: 82 },
    ],
  },
  {
    id: 'trace-O',
    label: 'O',
    spokenName: 'a letra O',
    category: 'letra',
    minLevel: '3-4',
    svgPath: 'M 50 16 C 74 16 80 34 80 50 C 80 66 74 84 50 84 C 26 84 20 66 20 50 C 20 34 26 16 50 16 Z',
    checkpoints: [
      { x: 50, y: 16 }, { x: 76, y: 34 }, { x: 80, y: 50 }, { x: 76, y: 68 },
      { x: 50, y: 84 }, { x: 24, y: 68 }, { x: 20, y: 50 }, { x: 24, y: 34 },
    ],
  },
  {
    id: 'trace-U',
    label: 'U',
    spokenName: 'a letra U',
    category: 'letra',
    minLevel: '3-4',
    svgPath: 'M 26 18 L 26 58 C 26 84 74 84 74 58 L 74 18',
    checkpoints: [
      { x: 26, y: 20 }, { x: 26, y: 58 }, { x: 50, y: 80 }, { x: 74, y: 58 }, { x: 74, y: 20 },
    ],
  },
  {
    id: 'trace-B',
    label: 'B',
    spokenName: 'a letra B',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 30 16 L 30 84 M 30 16 L 58 16 C 74 16 74 48 56 48 L 30 48 M 30 48 L 60 48 C 78 48 78 84 58 84 L 30 84',
    checkpoints: [
      { x: 30, y: 18 }, { x: 30, y: 50 }, { x: 30, y: 82 },
      { x: 68, y: 32 }, { x: 56, y: 48 }, { x: 70, y: 66 }, { x: 54, y: 84 },
    ],
  },
  {
    id: 'trace-C',
    label: 'C',
    spokenName: 'a letra C',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 74 28 C 60 12 24 16 24 50 C 24 84 60 88 74 72',
    checkpoints: [
      { x: 70, y: 24 }, { x: 42, y: 18 }, { x: 24, y: 50 }, { x: 42, y: 82 }, { x: 70, y: 74 },
    ],
  },
  {
    id: 'trace-L',
    label: 'L',
    spokenName: 'a letra L',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 30 18 L 30 82 L 74 82',
    checkpoints: [
      { x: 30, y: 20 }, { x: 30, y: 50 }, { x: 30, y: 82 }, { x: 54, y: 82 }, { x: 74, y: 82 },
    ],
  },
  {
    id: 'trace-M',
    label: 'M',
    spokenName: 'a letra M',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 20 84 L 20 18 L 50 56 L 80 18 L 80 84',
    checkpoints: [
      { x: 20, y: 82 }, { x: 20, y: 48 }, { x: 20, y: 18 },
      { x: 50, y: 54 }, { x: 80, y: 18 }, { x: 80, y: 50 }, { x: 80, y: 82 },
    ],
  },
  {
    id: 'trace-S',
    label: 'S',
    spokenName: 'a letra S',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 72 26 C 58 12 26 16 26 34 C 26 50 74 48 74 66 C 74 84 40 88 26 74',
    checkpoints: [
      { x: 68, y: 22 }, { x: 34, y: 26 }, { x: 50, y: 50 }, { x: 70, y: 68 }, { x: 32, y: 78 },
    ],
  },

  // Números 0 a 9
  {
    id: 'trace-0',
    label: '0',
    spokenName: 'o número 0',
    category: 'numero',
    minLevel: '3-4',
    svgPath: 'M 50 16 C 72 16 74 36 74 50 C 74 64 72 84 50 84 C 28 84 26 64 26 50 C 26 36 28 16 50 16 Z',
    checkpoints: [
      { x: 50, y: 16 }, { x: 74, y: 50 }, { x: 50, y: 84 }, { x: 26, y: 50 },
    ],
  },
  {
    id: 'trace-1',
    label: '1',
    spokenName: 'o número 1',
    category: 'numero',
    minLevel: '3-4',
    svgPath: 'M 36 32 L 54 16 L 54 84',
    checkpoints: [
      { x: 38, y: 30 }, { x: 54, y: 18 }, { x: 54, y: 40 },
      { x: 54, y: 62 }, { x: 54, y: 82 },
    ],
  },
  {
    id: 'trace-2',
    label: '2',
    spokenName: 'o número 2',
    category: 'numero',
    minLevel: '3-4',
    svgPath: 'M 26 32 C 26 14 74 14 74 34 C 74 52 26 68 26 84 L 76 84',
    checkpoints: [
      { x: 28, y: 30 }, { x: 50, y: 16 }, { x: 72, y: 34 },
      { x: 50, y: 60 }, { x: 28, y: 82 }, { x: 74, y: 84 },
    ],
  },
  {
    id: 'trace-3',
    label: '3',
    spokenName: 'o número 3',
    category: 'numero',
    minLevel: '3-4',
    svgPath: 'M 28 24 C 48 12 74 20 74 34 C 74 46 56 50 44 50 C 60 50 76 56 76 70 C 76 84 48 90 26 78',
    checkpoints: [
      { x: 32, y: 22 }, { x: 68, y: 26 }, { x: 50, y: 50 },
      { x: 74, y: 68 }, { x: 50, y: 84 }, { x: 28, y: 78 },
    ],
  },
  {
    id: 'trace-4',
    label: '4',
    spokenName: 'o número 4',
    category: 'numero',
    minLevel: '3-4',
    svgPath: 'M 64 84 L 64 16 L 22 60 L 78 60',
    checkpoints: [
      { x: 64, y: 20 }, { x: 42, y: 40 }, { x: 24, y: 60 }, { x: 64, y: 60 }, { x: 64, y: 82 },
    ],
  },
  {
    id: 'trace-5',
    label: '5',
    spokenName: 'o número 5',
    category: 'numero',
    minLevel: '3-4',
    svgPath: 'M 70 18 L 32 18 L 30 46 C 54 40 76 50 74 68 C 72 84 44 88 26 76',
    checkpoints: [
      { x: 68, y: 18 }, { x: 32, y: 18 }, { x: 30, y: 46 }, { x: 70, y: 62 }, { x: 42, y: 82 },
    ],
  },
  {
    id: 'trace-6',
    label: '6',
    spokenName: 'o número 6',
    category: 'numero',
    minLevel: '5-6',
    svgPath: 'M 64 18 C 36 18 24 44 26 66 C 28 84 72 84 74 64 C 76 46 34 46 28 62',
    checkpoints: [
      { x: 60, y: 18 }, { x: 32, y: 42 }, { x: 30, y: 70 }, { x: 68, y: 74 }, { x: 52, y: 50 },
    ],
  },
  {
    id: 'trace-7',
    label: '7',
    spokenName: 'o número 7',
    category: 'numero',
    minLevel: '5-6',
    svgPath: 'M 24 18 L 76 18 L 40 84',
    checkpoints: [
      { x: 26, y: 18 }, { x: 52, y: 18 }, { x: 74, y: 18 }, { x: 56, y: 52 }, { x: 40, y: 82 },
    ],
  },
  {
    id: 'trace-8',
    label: '8',
    spokenName: 'o número 8',
    category: 'numero',
    minLevel: '5-6',
    svgPath: 'M 50 48 C 28 48 28 16 50 16 C 72 16 72 48 50 48 C 24 48 24 84 50 84 C 76 84 76 48 50 48 Z',
    checkpoints: [
      { x: 50, y: 16 }, { x: 32, y: 32 }, { x: 50, y: 48 }, { x: 68, y: 66 }, { x: 50, y: 84 },
    ],
  },
  {
    id: 'trace-9',
    label: '9',
    spokenName: 'o número 9',
    category: 'numero',
    minLevel: '5-6',
    svgPath: 'M 72 38 C 72 16 28 16 28 38 C 28 56 68 56 72 38 L 72 84',
    checkpoints: [
      { x: 50, y: 18 }, { x: 28, y: 38 }, { x: 52, y: 52 }, { x: 72, y: 38 }, { x: 72, y: 82 },
    ],
  },
];

export const ENCOURAGE_PHRASES = [
  'Quase lá! Tente de novo!',
  'Você consegue! Vamos tentar mais uma vez!',
  'Ops, tente outra opção!',
  'Muito bem por tentar! Qual será a certa?',
];

export const CELEBRATE_PHRASES = [
  'Muito bem! Você acertou!',
  'Parabéns! Incrível!',
  'Isso mesmo! Você brilhou!',
  'Arrasou! Que esperteza!',
];
