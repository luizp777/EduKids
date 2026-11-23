import type { FigureId } from '../types';

/** Página individual de um conto ilustrado interativo. */
export interface StoryPage {
  /** Identificador único da página. */
  id: string;
  /** Texto narrado pela Lumi nesta página. */
  text: string;
  /** ID do clipe MP3 neural correspondente em `public/audio/pt-br/`. */
  clipId: string;
  /** Figuras ilustradas exibidas na cena da página. */
  sceneFigures: FigureId[];
  /** Figura alvo que a criança deve tocar para avançar a história. */
  magicTargetId: FigureId;
  /** Instrução visual curta incentivando o toque na figura alvo. */
  magicPrompt: string;
  /** Classes Tailwind de gradiente de fundo do cartão da página. */
  bgClass: string;
}

/** Definição de um conto ilustrado interativo completo. */
export interface InteractiveStory {
  /** Identificador único do conto. */
  id: string;
  /** Título exibido na pílula seletora. */
  title: string;
  /** Figura SVG exibida como ícone na pílula seletora para pré-leitores. */
  coverFigure: FigureId;
  /** Cor de destaque associada ao conto. */
  accentHex: string;
  /** Sequência ordenada de páginas do conto. */
  pages: StoryPage[];
}

/** Os 4 contos ilustrados interativos narrados pela Lumi. */
export const INTERACTIVE_STORIES: InteractiveStory[] = [
  {
    id: 'foguete',
    title: 'O Foguete Curioso',
    coverFigure: 'foguete',
    accentHex: '#6366F1',
    pages: [
      {
        id: 'foguete-1',
        text: 'O foguete curioso acordou animado e quis visitar o céu brilhante!',
        clipId: 'st-foguete-1',
        sceneFigures: ['foguete', 'nuvem'],
        magicTargetId: 'foguete',
        magicPrompt: 'Toque no foguete para decolar!',
        bgClass: 'from-indigo-100 to-sky-100',
      },
      {
        id: 'foguete-2',
        text: 'No espaço, ele encontrou a lua soneca descansando perto das estrelas.',
        clipId: 'st-foguete-2',
        sceneFigures: ['foguete', 'lua', 'estrela'],
        magicTargetId: 'lua',
        magicPrompt: 'Toque na lua para dar um oi!',
        bgClass: 'from-indigo-200 to-purple-100',
      },
      {
        id: 'foguete-3',
        text: 'A estrela guia iluminou o caminho de volta para casa com muito carinho!',
        clipId: 'st-foguete-3',
        sceneFigures: ['estrela', 'foguete', 'casa'],
        magicTargetId: 'estrela',
        magicPrompt: 'Toque na estrela para brilhar!',
        bgClass: 'from-amber-100 to-purple-100',
      },
    ],
  },
  {
    id: 'jardim',
    title: 'A Sementinha do Jardim',
    coverFigure: 'flor',
    accentHex: '#10B981',
    pages: [
      {
        id: 'jardim-1',
        text: 'No jardim encantado, uma florzinha acordou pedindo água fresquinha.',
        clipId: 'st-jardim-1',
        sceneFigures: ['flor', 'nuvem'],
        magicTargetId: 'nuvem',
        magicPrompt: 'Toque na nuvem para regar a flor!',
        bgClass: 'from-sky-100 to-emerald-100',
      },
      {
        id: 'jardim-2',
        text: 'Depois da chuva, o sol quentinho apareceu para ajudar a flor a crescer.',
        clipId: 'st-jardim-2',
        sceneFigures: ['sol', 'flor', 'arvore'],
        magicTargetId: 'sol',
        magicPrompt: 'Toque no sol para aquecer o jardim!',
        bgClass: 'from-amber-100 to-emerald-100',
      },
      {
        id: 'jardim-3',
        text: 'A abelha feliz chegou dançando e agradeceu pela flor tão cheirosa!',
        clipId: 'st-jardim-3',
        sceneFigures: ['abelha', 'flor', 'borboleta'],
        magicTargetId: 'abelha',
        magicPrompt: 'Toque na abelha para comemorar!',
        bgClass: 'from-yellow-100 to-pink-100',
      },
    ],
  },
  {
    id: 'piquenique',
    title: 'O Piquenique dos Amigos',
    coverFigure: 'urso',
    accentHex: '#F59E0B',
    pages: [
      {
        id: 'piquenique-1',
        text: 'O urso gentil preparou uma cesta cheia de frutas docinhas no parque.',
        clipId: 'st-piquenique-1',
        sceneFigures: ['urso', 'maca', 'banana'],
        magicTargetId: 'maca',
        magicPrompt: 'Toque na maçã para colocar na cesta!',
        bgClass: 'from-amber-100 to-lime-100',
      },
      {
        id: 'piquenique-2',
        text: 'O cachorrinho amigo chegou abanando o rabo para brincar junto!',
        clipId: 'st-piquenique-2',
        sceneFigures: ['urso', 'cachorro', 'bola'],
        magicTargetId: 'cachorro',
        magicPrompt: 'Toque no cachorrinho para cumprimentar!',
        bgClass: 'from-emerald-100 to-amber-100',
      },
      {
        id: 'piquenique-3',
        text: 'Eles dividiram uma melancia refrescante porque partilhar deixa tudo mais gostoso!',
        clipId: 'st-piquenique-3',
        sceneFigures: ['urso', 'melancia', 'cachorro'],
        magicTargetId: 'melancia',
        magicPrompt: 'Toque na melancia para partilhar!',
        bgClass: 'from-rose-100 to-emerald-100',
      },
    ],
  },
  {
    id: 'tartaruga',
    title: 'A Tartaruga e o Avião',
    coverFigure: 'tartaruga',
    accentHex: '#0EA5E9',
    pages: [
      {
        id: 'tartaruga-1',
        text: 'A tartaruga passeava devagarinho olhando cada detalhe do caminho.',
        clipId: 'st-tartaruga-1',
        sceneFigures: ['tartaruga', 'flor'],
        magicTargetId: 'tartaruga',
        magicPrompt: 'Toque na tartaruga para continuar!',
        bgClass: 'from-teal-100 to-emerald-100',
      },
      {
        id: 'tartaruga-2',
        text: 'Lá no alto, o avião veloz passou voando bem rápido pelas nuvens.',
        clipId: 'st-tartaruga-2',
        sceneFigures: ['aviao', 'nuvem'],
        magicTargetId: 'aviao',
        magicPrompt: 'Toque no avião para voar!',
        bgClass: 'from-sky-100 to-blue-100',
      },
      {
        id: 'tartaruga-3',
        text: 'No final, os dois se encontraram na ilha para admirar um lindo arco-íris!',
        clipId: 'st-tartaruga-3',
        sceneFigures: ['tartaruga', 'ilha', 'arcoiris'],
        magicTargetId: 'arcoiris',
        magicPrompt: 'Toque no arco-íris para celebrar!',
        bgClass: 'from-sky-100 to-pink-100',
      },
    ],
  },
];

/** Pergunta de compreensão sobre eventos e personagens dos contos. */
export interface StoryComprehensionItem {
  /** Identificador único da pergunta. */
  id: string;
  /** Enunciado exibido no banner da Lumi. */
  question: string;
  /** ID do clipe MP3 neural da pergunta. */
  clipId: string;
  /** Figura que representa a resposta correta. */
  answerId: FigureId;
  /** Figuras distratoras usadas nas alternativas. */
  distractorIds: FigureId[];
}

/** Perguntas de compreensão sobre os 4 contos ilustrados. */
export const STORY_COMPREHENSION: StoryComprehensionItem[] = [
  {
    id: 'sc-1',
    question: 'Quem viajou pelo espaço para visitar a Lua?',
    clipId: 'st-q-1',
    answerId: 'foguete',
    distractorIds: ['carro', 'peixe', 'sapo'],
  },
  {
    id: 'sc-2',
    question: 'Quem iluminou o caminho de volta do foguete?',
    clipId: 'st-q-2',
    answerId: 'estrela',
    distractorIds: ['bola', 'dado', 'gato'],
  },
  {
    id: 'sc-3',
    question: 'O que trouxe chuva fresquinha para a florzinha?',
    clipId: 'st-q-3',
    answerId: 'nuvem',
    distractorIds: ['aviao', 'pao', 'rato'],
  },
  {
    id: 'sc-4',
    question: 'Qual bichinho chegou dançando para agradecer à flor?',
    clipId: 'st-q-4',
    answerId: 'abelha',
    distractorIds: ['elefante', 'leao', 'peixe'],
  },
  {
    id: 'sc-5',
    question: 'Qual fruta refrescante os amigos dividiram no piquenique?',
    clipId: 'st-q-5',
    answerId: 'melancia',
    distractorIds: ['livro', 'carro', 'lua'],
  },
  {
    id: 'sc-6',
    question: 'O que a tartaruga e o avião admiraram juntos na ilha?',
    clipId: 'st-q-6',
    answerId: 'arcoiris',
    distractorIds: ['dado', 'pao', 'gato'],
  },
];

/** Desafio de ordenação narrativa em 3 etapas (Começo, Meio e Fim). */
export interface StorySequenceItem {
  /** Identificador único da sequência. */
  id: string;
  /** Título da narrativa exibido no enunciado. */
  title: string;
  /** ID do clipe MP3 neural da instrução. */
  clipId: string;
  /** Etapas ordenadas do começo ao fim. */
  steps: { id: string; label: string; figureId: FigureId }[];
}

/** Desafios de sequência narrativa (Começo, Meio e Fim). */
export const STORY_SEQUENCES: StorySequenceItem[] = [
  {
    id: 'seq-foguete',
    title: 'Viagem do Foguete',
    clipId: 'st-seq-prompt',
    steps: [
      { id: '1', label: '1. Decolar', figureId: 'foguete' },
      { id: '2', label: '2. Visitar a Lua', figureId: 'lua' },
      { id: '3', label: '3. Voltar pra Casa', figureId: 'casa' },
    ],
  },
  {
    id: 'seq-jardim',
    title: 'Flor do Jardim',
    clipId: 'st-seq-prompt',
    steps: [
      { id: '1', label: '1. Chuva da Nuvem', figureId: 'nuvem' },
      { id: '2', label: '2. Calor do Sol', figureId: 'sol' },
      { id: '3', label: '3. Flor Cresce', figureId: 'flor' },
    ],
  },
  {
    id: 'seq-piquenique',
    title: 'Piquenique Feliz',
    clipId: 'st-seq-prompt',
    steps: [
      { id: '1', label: '1. Preparar Frutas', figureId: 'maca' },
      { id: '2', label: '2. Chega o Amigo', figureId: 'cachorro' },
      { id: '3', label: '3. Dividir Melancia', figureId: 'melancia' },
    ],
  },
  {
    id: 'seq-tartaruga',
    title: 'Passeio na Ilha',
    clipId: 'st-seq-prompt',
    steps: [
      { id: '1', label: '1. Caminhar', figureId: 'tartaruga' },
      { id: '2', label: '2. Chegar à Ilha', figureId: 'ilha' },
      { id: '3', label: '3. Ver Arco-íris', figureId: 'arcoiris' },
    ],
  },
];

/** Elemento selecionável na Fábrica de Histórias (personagem, lugar ou surpresa). */
export interface StoryBuilderToken {
  /** Identificador único do elemento. */
  id: string;
  /** Trecho de texto que compõe a frase final da história. */
  label: string;
  /** Figura SVG exibida no seletor visual. */
  figureId: FigureId;
  /** ID do clipe MP3 neural narrado em sequência pela Lumi. */
  clipId: string;
}

/** Personagens disponíveis na coluna 1 da Fábrica de Histórias. */
export const STORY_BUILDER_HEROES: StoryBuilderToken[] = [
  { id: 'gato', label: 'O gatinho', figureId: 'gato', clipId: 'st-b-hero-gato' },
  { id: 'urso', label: 'O ursinho', figureId: 'urso', clipId: 'st-b-hero-urso' },
  { id: 'sapo', label: 'O sapinho', figureId: 'sapo', clipId: 'st-b-hero-sapo' },
  { id: 'pato', label: 'O patinho', figureId: 'pato', clipId: 'st-b-hero-pato' },
];

/** Lugares disponíveis na coluna 2 da Fábrica de Histórias. */
export const STORY_BUILDER_PLACES: StoryBuilderToken[] = [
  { id: 'ilha', label: 'foi até a ilha', figureId: 'ilha', clipId: 'st-b-place-ilha' },
  { id: 'lua', label: 'viajou até a lua', figureId: 'lua', clipId: 'st-b-place-lua' },
  { id: 'casa', label: 'chegou na casinha', figureId: 'casa', clipId: 'st-b-place-casa' },
  { id: 'arvore', label: 'brincou na floresta', figureId: 'arvore', clipId: 'st-b-place-arvore' },
];

/** Surpresas/objetos disponíveis na coluna 3 da Fábrica de Histórias. */
export const STORY_BUILDER_OBJECTS: StoryBuilderToken[] = [
  { id: 'estrela', label: 'e achou uma estrela mágica!', figureId: 'estrela', clipId: 'st-b-obj-estrela' },
  { id: 'bola', label: 'e jogou com uma bola colorida!', figureId: 'bola', clipId: 'st-b-obj-bola' },
  { id: 'livro', label: 'e leu um livro encantado!', figureId: 'livro', clipId: 'st-b-obj-livro' },
  { id: 'arcoiris', label: 'e viu um lindo arco-íris!', figureId: 'arcoiris', clipId: 'st-b-obj-arcoiris' },
];
