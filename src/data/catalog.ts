import type {
  ColorId,
  ColorInfo,
  FigureId,
  FigureItem,
  LumiAccessoryInfo,
  PaintDrawing,
  PillarId,
  ShapeInfo,
  StickerItem,
  TracingTemplate,
} from '../types';

/** Metadados visuais e pedagógicos de um pilar na tela inicial. */
export interface PillarMeta {
  /** Identificador do pilar. */
  id: PillarId;
  /** Título exibido no cartão. */
  title: string;
  /** Subtítulo resumindo os modos disponíveis. */
  subtitle: string;
  /** Saudação falada pela Lumi ao apresentar o pilar. */
  spokenIntro: string;
  /** Classes Tailwind de gradiente de fundo. */
  bgGradient: string;
  /** Cor hexadecimal de borda. */
  borderColor: string;
  /** Cor hexadecimal do selo de destaque. */
  badgeColor: string;
}

/** Catálogo dos 9 pilares pedagógicos do EduKids. */
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
  {
    id: 'languages',
    title: 'Idiomas',
    subtitle: 'Inglês e Espanhol com voz nativa',
    spokenIntro: 'Vamos aprender palavras em inglês e espanhol!',
    bgGradient: 'from-[#0EA5E9] to-[#6366F1]',
    borderColor: '#4F46E5',
    badgeColor: '#E0E7FF',
  },
];

/** Paleta principal de cores usadas nos modos de classificação, pintura e mistura. */
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

/** Receita de mistura entre duas cores primárias e a cor secundária resultante. */
export interface ColorMixRecipe {
  /** Primeira cor da mistura. */
  colorA: ColorId;
  /** Segunda cor da mistura. */
  colorB: ColorId;
  /** Cor resultante da combinação. */
  result: ColorId;
}

/** Receitas de mistura de cores disponíveis no modo "Misturar". */
export const COLOR_MIXES: ColorMixRecipe[] = [
  { colorA: 'vermelho', colorB: 'amarelo', result: 'laranja' },
  { colorA: 'azul', colorB: 'amarelo', result: 'verde' },
  { colorA: 'vermelho', colorB: 'azul', result: 'roxo' },
];

/** Formas geométricas suportadas nos jogos de encaixe, padrões e objetos do mundo. */
export const SHAPES: ShapeInfo[] = [
  { id: 'circulo', name: 'Círculo', colorHex: '#FF595E', accentHex: '#FF8A8E' },
  { id: 'quadrado', name: 'Quadrado', colorHex: '#3A86FF', accentHex: '#7FB2FF' },
  { id: 'triangulo', name: 'Triângulo', colorHex: '#FFCA3A', accentHex: '#FFE085' },
  { id: 'estrela', name: 'Estrela', colorHex: '#FF924C', accentHex: '#FFB685' },
  { id: 'coracao', name: 'Coração', colorHex: '#FF5C8D', accentHex: '#FF94B5' },
  { id: 'retangulo', name: 'Retângulo', colorHex: '#52B788', accentHex: '#84D4AE' },
];

/** Catálogo completo das 36 figuras ilustradas usadas transversalmente nos pilares. */
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
  { id: 'cachorro', name: 'CACHORRO', letter: 'C', isVowel: false, colorId: 'laranja', category: 'animal', missingLetterIndex: 0, syllables: ['CA', 'CHOR', 'RO'] },
  { id: 'leao', name: 'LEÃO', letter: 'L', isVowel: false, colorId: 'amarelo', category: 'animal', missingLetterIndex: 0, syllables: ['LE', 'ÃO'] },
  { id: 'passaro', name: 'PÁSSARO', letter: 'P', isVowel: false, colorId: 'azul', category: 'animal', missingLetterIndex: 0, syllables: ['PÁS', 'SA', 'RO'] },
  { id: 'tartaruga', name: 'TARTARUGA', letter: 'T', isVowel: false, colorId: 'verde', category: 'animal', missingLetterIndex: 0, syllables: ['TAR', 'TA', 'RU', 'GA'] },
  { id: 'aviao', name: 'AVIÃO', letter: 'A', isVowel: true, colorId: 'azul', category: 'objeto', missingLetterIndex: 0, syllables: ['A', 'VI', 'ÃO'] },
  { id: 'livro', name: 'LIVRO', letter: 'L', isVowel: false, colorId: 'vermelho', category: 'objeto', missingLetterIndex: 0, syllables: ['LI', 'VRO'] },
  { id: 'arcoiris', name: 'ARCO-ÍRIS', letter: 'A', isVowel: true, colorId: 'roxo', category: 'natureza', missingLetterIndex: 0, syllables: ['AR', 'CO', 'Í', 'RIS'] },
  { id: 'melancia', name: 'MELANCIA', letter: 'M', isVowel: false, colorId: 'vermelho', category: 'fruta', missingLetterIndex: 0, syllables: ['ME', 'LAN', 'CI', 'A'] },
];

/** Pares de rimas fonéticas corretas usados no modo "Rimas". */
export const RHYME_PAIRS: [FigureId, FigureId][] = [
  ['gato', 'pato'],
  ['gato', 'rato'],
  ['pato', 'rato'],
  ['pao', 'mao'],
  ['abelha', 'ovelha'],
  ['leao', 'aviao'],
  ['leao', 'pao'],
  ['leao', 'mao'],
  ['aviao', 'pao'],
  ['aviao', 'mao'],
];

/** Catálogo completo das 36 figurinhas colecionáveis do Álbum de Figurinhas. */
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
  { id: 'stk-ovelha', name: 'Ovelha Nuvem', theme: 'Animais', figureId: 'ovelha', bgHex: '#F3D9FA' },
  { id: 'stk-cachorro', name: 'Cachorrinho Au', theme: 'Animais', figureId: 'cachorro', bgHex: '#FFE8CC' },
  { id: 'stk-leao', name: 'Leão Juba', theme: 'Animais', figureId: 'leao', bgHex: '#FFF3BF' },
  { id: 'stk-passaro', name: 'Passarinho Azul', theme: 'Animais', figureId: 'passaro', bgHex: '#D0EBFF' },
  { id: 'stk-tartaruga', name: 'Tartaruga Tina', theme: 'Animais', figureId: 'tartaruga', bgHex: '#D3F9D8' },
  { id: 'stk-foguete', name: 'Foguete Turbo', theme: 'Espaço', figureId: 'foguete', bgHex: '#FFE8CC' },
  { id: 'stk-lua', name: 'Lua Soneca', theme: 'Espaço', figureId: 'lua', bgHex: '#E5DBFF' },
  { id: 'stk-sol', name: 'Sol Brilhante', theme: 'Espaço', figureId: 'sol', bgHex: '#FFF3BF' },
  { id: 'stk-estrela', name: 'Estrela Guia', theme: 'Espaço', figureId: 'estrela', bgHex: '#FFF9DB' },
  { id: 'stk-aviao', name: 'Avião Veloz', theme: 'Espaço', figureId: 'aviao', bgHex: '#D0EBFF' },
  { id: 'stk-nuvem', name: 'Nuvem Fofa', theme: 'Natureza', figureId: 'nuvem', bgHex: '#D0EBFF' },
  { id: 'stk-flor', name: 'Flor Mágica', theme: 'Natureza', figureId: 'flor', bgHex: '#F3D9FA' },
  { id: 'stk-ilha', name: 'Ilha Feliz', theme: 'Natureza', figureId: 'ilha', bgHex: '#D3F9D8' },
  { id: 'stk-arvore', name: 'Árvore Viva', theme: 'Natureza', figureId: 'arvore', bgHex: '#D3F9D8' },
  { id: 'stk-arcoiris', name: 'Arco-íris Vivo', theme: 'Natureza', figureId: 'arcoiris', bgHex: '#F3D9FA' },
  { id: 'stk-maca', name: 'Maçã Doce', theme: 'Frutas', figureId: 'maca', bgHex: '#FFE3E3' },
  { id: 'stk-morango', name: 'Moranguinho', theme: 'Frutas', figureId: 'morango', bgHex: '#FFD8E4' },
  { id: 'stk-banana', name: 'Banana Pop', theme: 'Frutas', figureId: 'banana', bgHex: '#FFF3BF' },
  { id: 'stk-uva', name: 'Uva Roxinha', theme: 'Frutas', figureId: 'uva', bgHex: '#F3D9FA' },
  { id: 'stk-melancia', name: 'Melancia Doce', theme: 'Frutas', figureId: 'melancia', bgHex: '#FFE3E3' },
  { id: 'stk-carro', name: 'Carrinho Vrum', theme: 'Objetos e Amigos', figureId: 'carro', bgHex: '#FFE3E3' },
  { id: 'stk-bola', name: 'Bola Pula-Pula', theme: 'Objetos e Amigos', figureId: 'bola', bgHex: '#D0EBFF' },
  { id: 'stk-casa', name: 'Casinha Feliz', theme: 'Objetos e Amigos', figureId: 'casa', bgHex: '#FFE8CC' },
  { id: 'stk-dado', name: 'Dado Mágico', theme: 'Objetos e Amigos', figureId: 'dado', bgHex: '#E5DBFF' },
  { id: 'stk-pao', name: 'Pãozinho Quente', theme: 'Objetos e Amigos', figureId: 'pao', bgHex: '#FFF3BF' },
  { id: 'stk-mao', name: 'Mãozinha Amiga', theme: 'Objetos e Amigos', figureId: 'mao', bgHex: '#FFD8E4' },
  { id: 'stk-livro', name: 'Livro de Histórias', theme: 'Objetos e Amigos', figureId: 'livro', bgHex: '#D3F9D8' },
];

/** Acessórios visuais da mascote Lumi desbloqueados por marcos de estrelas (sem gastar saldo). */
export const LUMI_ACCESSORIES: LumiAccessoryInfo[] = [
  { id: 'none', name: 'Lumi Clássica', minStars: 0, description: 'Visual original da Lumi' },
  { id: 'bow', name: 'Lacinho Mágico', minStars: 10, description: 'Desbloqueia com 10 estrelas' },
  { id: 'crown', name: 'Coroa Dourada', minStars: 25, description: 'Desbloqueia com 25 estrelas' },
  { id: 'glasses', name: 'Óculos de Estrela', minStars: 45, description: 'Desbloqueia com 45 estrelas' },
  { id: 'wizard', name: 'Chapéu de Mago', minStars: 70, description: 'Desbloqueia com 70 estrelas' },
  { id: 'cape', name: 'Gravatinha Real', minStars: 100, description: 'Desbloqueia com 100 estrelas' },
];

/** 10 desenhos interativos compartilhados entre a Pintura Mágica e a Galeria do Álbum. */
export const PAINT_DRAWINGS: PaintDrawing[] = [
  {
    id: 'casa',
    label: 'Casa',
    parts: [
      { id: 'telhado', label: 'Telhado', d: 'M 12 50 L 50 16 L 88 50 Z' },
      { id: 'parede', label: 'Parede', d: 'M 22 50 H 78 V 86 H 22 Z' },
      { id: 'porta', label: 'Porta', d: 'M 42 60 H 58 V 86 H 42 Z' },
      { id: 'janela', label: 'Janela', d: 'M 27 58 H 37 V 68 H 27 Z' },
    ],
  },
  {
    id: 'foguete',
    label: 'Foguete',
    parts: [
      { id: 'corpo', label: 'Corpo', d: 'M 50 12 C 68 28 68 58 62 74 H 38 C 32 58 32 28 50 12 Z' },
      { id: 'asa-e', label: 'Asa esquerda', d: 'M 36 72 L 20 84 L 28 58 Z' },
      { id: 'asa-d', label: 'Asa direita', d: 'M 64 72 L 80 84 L 72 58 Z' },
      { id: 'fogo', label: 'Fogo', d: 'M 42 74 L 50 94 L 58 74 Z' },
    ],
  },
  {
    id: 'borboleta',
    label: 'Borboleta',
    parts: [
      { id: 'asa-sup-e', label: 'Asa superior esquerda', d: 'M 46 46 C 22 14 10 38 24 54 C 32 60 44 54 46 46 Z' },
      { id: 'asa-sup-d', label: 'Asa superior direita', d: 'M 54 46 C 78 14 90 38 76 54 C 68 60 56 54 54 46 Z' },
      { id: 'asa-inf-e', label: 'Asa inferior esquerda', d: 'M 46 54 C 24 56 18 82 36 82 C 44 82 46 66 46 54 Z' },
      { id: 'asa-inf-d', label: 'Asa inferior direita', d: 'M 54 54 C 76 56 82 82 64 82 C 56 82 54 66 54 54 Z' },
      { id: 'corpo', label: 'Corpo', d: 'M 45 28 H 55 V 80 H 45 Z' },
    ],
  },
  {
    id: 'carro',
    label: 'Carro',
    parts: [
      { id: 'teto', label: 'Teto', d: 'M 28 50 L 36 28 H 64 L 72 50 Z' },
      { id: 'lataria', label: 'Lataria', d: 'M 14 50 H 86 V 72 H 14 Z' },
      { id: 'roda-e', label: 'Roda esquerda', d: 'M 22 72 A 10 10 0 1 0 42 72 A 10 10 0 1 0 22 72 Z' },
      { id: 'roda-d', label: 'Roda direita', d: 'M 58 72 A 10 10 0 1 0 78 72 A 10 10 0 1 0 58 72 Z' },
    ],
  },
  {
    id: 'flor',
    label: 'Flor',
    parts: [
      { id: 'petala-1', label: 'Pétala cima', d: 'M 50 12 A 12 12 0 1 0 50 36 A 12 12 0 1 0 50 12 Z' },
      { id: 'petala-2', label: 'Pétala esquerda', d: 'M 28 32 A 12 12 0 1 0 28 56 A 12 12 0 1 0 28 32 Z' },
      { id: 'petala-3', label: 'Pétala direita', d: 'M 72 32 A 12 12 0 1 0 72 56 A 12 12 0 1 0 72 32 Z' },
      { id: 'miolo', label: 'Miolo', d: 'M 50 34 A 12 12 0 1 0 50 58 A 12 12 0 1 0 50 34 Z' },
      { id: 'caule', label: 'Caule', d: 'M 46 58 H 54 V 88 H 46 Z' },
    ],
  },
  {
    id: 'barco',
    label: 'Barquinho',
    parts: [
      { id: 'vela-e', label: 'Vela esquerda', d: 'M 48 16 L 22 58 H 48 Z' },
      { id: 'vela-d', label: 'Vela direita', d: 'M 52 24 L 76 58 H 52 Z' },
      { id: 'casco', label: 'Casco', d: 'M 14 62 H 86 L 74 84 H 26 Z' },
    ],
  },
  {
    id: 'sol',
    label: 'Sol',
    parts: [
      { id: 'raio-cima', label: 'Raio cima', d: 'M 44 26 L 50 8 L 56 26 Z' },
      { id: 'raio-baixo', label: 'Raio baixo', d: 'M 44 74 L 50 92 L 56 74 Z' },
      { id: 'raio-esq', label: 'Raio esquerda', d: 'M 26 44 L 8 50 L 26 56 Z' },
      { id: 'raio-dir', label: 'Raio direita', d: 'M 74 44 L 92 50 L 74 56 Z' },
      { id: 'centro', label: 'Centro do Sol', d: 'M 28 50 A 22 22 0 1 0 72 50 A 22 22 0 1 0 28 50 Z' },
    ],
  },
  {
    id: 'peixe',
    label: 'Peixinho',
    parts: [
      { id: 'cauda', label: 'Cauda', d: 'M 68 50 L 90 32 V 68 Z' },
      { id: 'barbatana', label: 'Barbatana', d: 'M 38 30 L 52 16 L 58 32 Z' },
      { id: 'corpo', label: 'Corpo', d: 'M 16 50 C 26 26 58 26 70 50 C 58 74 26 74 16 50 Z' },
      { id: 'cabeca', label: 'Cabeça', d: 'M 16 50 C 20 38 30 33 36 33 V 67 C 30 67 20 62 16 50 Z' },
    ],
  },
  {
    id: 'arvore',
    label: 'Árvore',
    parts: [
      { id: 'tronco', label: 'Tronco', d: 'M 42 58 H 58 V 88 H 42 Z' },
      { id: 'copa-e', label: 'Folhas esquerda', d: 'M 18 46 A 18 18 0 1 0 54 46 A 18 18 0 1 0 18 46 Z' },
      { id: 'copa-d', label: 'Folhas direita', d: 'M 46 46 A 18 18 0 1 0 82 46 A 18 18 0 1 0 46 46 Z' },
      { id: 'copa-topo', label: 'Folhas topo', d: 'M 30 30 A 20 20 0 1 0 70 30 A 20 20 0 1 0 30 30 Z' },
    ],
  },
  {
    id: 'sorvete',
    label: 'Sorvete',
    parts: [
      { id: 'casquinha', label: 'Casquinha', d: 'M 34 52 H 66 L 50 90 Z' },
      { id: 'bola-e', label: 'Bola esquerda', d: 'M 24 44 A 14 14 0 1 0 52 44 A 14 14 0 1 0 24 44 Z' },
      { id: 'bola-d', label: 'Bola direita', d: 'M 48 44 A 14 14 0 1 0 76 44 A 14 14 0 1 0 48 44 Z' },
      { id: 'bola-topo', label: 'Bola topo', d: 'M 36 28 A 14 14 0 1 0 64 28 A 14 14 0 1 0 36 28 Z' },
    ],
  },
];

/** Modelos de traçado (caminhos, formas, letras e números) ordenados por categoria e nível. */
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
  {
    id: 'trace-montanha',
    label: 'Montanha',
    spokenName: 'a montanha',
    category: 'caminho',
    minLevel: '3-4',
    svgPath: 'M 14 76 L 50 22 L 86 76',
    checkpoints: [
      { x: 14, y: 76 }, { x: 32, y: 49 }, { x: 50, y: 22 }, { x: 68, y: 49 }, { x: 86, y: 76 },
    ],
  },
  {
    id: 'trace-curva',
    label: 'Curva Dupla',
    spokenName: 'a curva dupla',
    category: 'caminho',
    minLevel: '3-4',
    svgPath: 'M 16 24 C 82 24 18 76 84 76',
    checkpoints: [
      { x: 16, y: 24 }, { x: 52, y: 28 }, { x: 50, y: 50 }, { x: 48, y: 72 }, { x: 84, y: 76 },
    ],
  },
  {
    id: 'trace-castelo',
    label: 'Castelo',
    spokenName: 'o castelo',
    category: 'caminho',
    minLevel: '5-6',
    svgPath: 'M 14 74 L 30 74 L 30 34 L 50 34 L 50 74 L 70 74 L 70 34 L 86 34',
    checkpoints: [
      { x: 14, y: 74 }, { x: 30, y: 54 }, { x: 30, y: 34 }, { x: 50, y: 34 },
      { x: 50, y: 74 }, { x: 70, y: 54 }, { x: 86, y: 34 },
    ],
  },
  {
    id: 'trace-espiral',
    label: 'Caracol',
    spokenName: 'o caracol',
    category: 'caminho',
    minLevel: '5-6',
    svgPath: 'M 50 50 C 58 50 58 38 48 38 C 34 38 34 64 52 64 C 74 64 74 22 48 22 C 20 22 20 80 54 80',
    checkpoints: [
      { x: 50, y: 50 }, { x: 48, y: 38 }, { x: 52, y: 64 }, { x: 48, y: 22 }, { x: 22, y: 50 }, { x: 54, y: 80 },
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
  {
    id: 'trace-retangulo',
    label: 'Retângulo',
    spokenName: 'o Retângulo',
    category: 'forma',
    minLevel: '3-4',
    svgPath: 'M 14 28 L 86 28 L 86 72 L 14 72 Z',
    checkpoints: [
      { x: 14, y: 28 }, { x: 50, y: 28 }, { x: 86, y: 28 },
      { x: 86, y: 72 }, { x: 50, y: 72 }, { x: 14, y: 72 },
    ],
  },
  {
    id: 'trace-losango',
    label: 'Diamante',
    spokenName: 'o Diamante',
    category: 'forma',
    minLevel: '5-6',
    svgPath: 'M 50 14 L 82 50 L 50 86 L 18 50 Z',
    checkpoints: [
      { x: 50, y: 14 }, { x: 82, y: 50 }, { x: 50, y: 86 }, { x: 18, y: 50 },
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
  {
    id: 'trace-D',
    label: 'D',
    spokenName: 'a letra D',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 28 16 L 28 84 M 28 16 L 52 16 C 80 16 80 84 52 84 L 28 84',
    checkpoints: [
      { x: 28, y: 18 }, { x: 28, y: 50 }, { x: 28, y: 82 }, { x: 64, y: 30 }, { x: 74, y: 50 }, { x: 64, y: 70 },
    ],
  },
  {
    id: 'trace-F',
    label: 'F',
    spokenName: 'a letra F',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 72 18 L 28 18 L 28 84 M 28 50 L 64 50',
    checkpoints: [
      { x: 70, y: 18 }, { x: 28, y: 18 }, { x: 28, y: 50 }, { x: 28, y: 82 }, { x: 62, y: 50 },
    ],
  },
  {
    id: 'trace-G',
    label: 'G',
    spokenName: 'a letra G',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 74 28 C 60 12 24 16 24 50 C 24 84 60 88 74 72 L 74 52 L 54 52',
    checkpoints: [
      { x: 70, y: 24 }, { x: 42, y: 18 }, { x: 24, y: 50 }, { x: 44, y: 82 }, { x: 74, y: 56 }, { x: 56, y: 52 },
    ],
  },
  {
    id: 'trace-P',
    label: 'P',
    spokenName: 'a letra P',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 30 16 L 30 84 M 30 16 L 58 16 C 78 16 78 52 56 52 L 30 52',
    checkpoints: [
      { x: 30, y: 18 }, { x: 30, y: 50 }, { x: 30, y: 82 }, { x: 68, y: 34 }, { x: 54, y: 52 },
    ],
  },
  {
    id: 'trace-R',
    label: 'R',
    spokenName: 'a letra R',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 30 16 L 30 84 M 30 16 L 58 16 C 76 16 76 50 56 50 L 30 50 M 50 50 L 74 84',
    checkpoints: [
      { x: 30, y: 18 }, { x: 30, y: 50 }, { x: 30, y: 82 }, { x: 68, y: 34 }, { x: 52, y: 50 }, { x: 72, y: 82 },
    ],
  },
  {
    id: 'trace-T',
    label: 'T',
    spokenName: 'a letra T',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 20 18 L 80 18 M 50 18 L 50 84',
    checkpoints: [
      { x: 22, y: 18 }, { x: 50, y: 18 }, { x: 78, y: 18 }, { x: 50, y: 50 }, { x: 50, y: 82 },
    ],
  },
  {
    id: 'trace-V',
    label: 'V',
    spokenName: 'a letra V',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 22 18 L 50 84 L 78 18',
    checkpoints: [
      { x: 22, y: 18 }, { x: 36, y: 50 }, { x: 50, y: 84 }, { x: 64, y: 50 }, { x: 78, y: 18 },
    ],
  },
  {
    id: 'trace-H',
    label: 'H',
    spokenName: 'a letra H',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 26 18 L 26 84 M 74 18 L 74 84 M 26 50 L 74 50',
    checkpoints: [
      { x: 26, y: 20 }, { x: 26, y: 50 }, { x: 26, y: 82 },
      { x: 50, y: 50 }, { x: 74, y: 20 }, { x: 74, y: 50 }, { x: 74, y: 82 },
    ],
  },
  {
    id: 'trace-J',
    label: 'J',
    spokenName: 'a letra J',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 64 18 L 64 64 C 64 84 32 86 26 68',
    checkpoints: [
      { x: 64, y: 20 }, { x: 64, y: 46 }, { x: 64, y: 66 }, { x: 46, y: 82 }, { x: 28, y: 70 },
    ],
  },
  {
    id: 'trace-K',
    label: 'K',
    spokenName: 'a letra K',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 28 18 L 28 84 M 74 18 L 28 52 L 74 84',
    checkpoints: [
      { x: 28, y: 20 }, { x: 28, y: 52 }, { x: 28, y: 82 }, { x: 72, y: 20 }, { x: 72, y: 82 },
    ],
  },
  {
    id: 'trace-N',
    label: 'N',
    spokenName: 'a letra N',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 26 84 L 26 18 L 74 84 L 74 18',
    checkpoints: [
      { x: 26, y: 82 }, { x: 26, y: 50 }, { x: 26, y: 20 },
      { x: 50, y: 50 }, { x: 74, y: 82 }, { x: 74, y: 20 },
    ],
  },
  {
    id: 'trace-Q',
    label: 'Q',
    spokenName: 'a letra Q',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 50 16 C 74 16 80 34 80 50 C 80 66 74 82 50 82 C 26 82 20 66 20 50 C 20 34 26 16 50 16 Z M 56 64 L 82 86',
    checkpoints: [
      { x: 50, y: 16 }, { x: 78, y: 50 }, { x: 50, y: 82 }, { x: 22, y: 50 }, { x: 78, y: 84 },
    ],
  },
  {
    id: 'trace-W',
    label: 'W',
    spokenName: 'a letra W',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 14 20 L 30 82 L 50 42 L 70 82 L 86 20',
    checkpoints: [
      { x: 16, y: 22 }, { x: 30, y: 80 }, { x: 50, y: 44 }, { x: 70, y: 80 }, { x: 84, y: 22 },
    ],
  },
  {
    id: 'trace-X',
    label: 'X',
    spokenName: 'a letra X',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 22 18 L 78 82 M 78 18 L 22 82',
    checkpoints: [
      { x: 24, y: 20 }, { x: 50, y: 50 }, { x: 76, y: 80 }, { x: 76, y: 20 }, { x: 24, y: 80 },
    ],
  },
  {
    id: 'trace-Y',
    label: 'Y',
    spokenName: 'a letra Y',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 22 18 L 50 50 L 78 18 M 50 50 L 50 84',
    checkpoints: [
      { x: 24, y: 20 }, { x: 50, y: 50 }, { x: 76, y: 20 }, { x: 50, y: 82 },
    ],
  },
  {
    id: 'trace-Z',
    label: 'Z',
    spokenName: 'a letra Z',
    category: 'letra',
    minLevel: '5-6',
    svgPath: 'M 22 20 L 78 20 L 22 82 L 78 82',
    checkpoints: [
      { x: 24, y: 20 }, { x: 76, y: 20 }, { x: 50, y: 50 }, { x: 24, y: 82 }, { x: 76, y: 82 },
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

/** Frases de incentivo gentil exibidas e faladas quando a criança erra uma tentativa. */
export const ENCOURAGE_PHRASES = [
  'Quase lá! Tente de novo!',
  'Você consegue! Vamos tentar mais uma vez!',
  'Ops, tente outra opção!',
  'Muito bem por tentar! Qual será a certa?',
];

/** Frases de celebração exibidas e faladas a cada acerto. */
export const CELEBRATE_PHRASES = [
  'Muito bem! Você acertou!',
  'Parabéns! Incrível!',
  'Isso mesmo! Você brilhou!',
  'Arrasou! Que esperteza!',
];
