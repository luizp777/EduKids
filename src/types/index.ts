/** Faixas etárias suportadas pelo EduKids (3–4: Exploradores, 5–6: Descobridores). */
export type AgeLevel = '3-4' | '5-6';

/** Identificadores dos 5 pilares pedagógicos do aplicativo. */
export type PillarId =
  | 'literacy'
  | 'math'
  | 'shapes-colors'
  | 'figures-logic'
  | 'tracing';

/** Avatares SVG disponíveis para o perfil da criança. */
export type AvatarId =
  | 'owl'
  | 'bear'
  | 'cat'
  | 'bunny'
  | 'fox'
  | 'dino';

/** Estatísticas acumuladas de um perfil em um pilar específico. */
export interface PillarStats {
  completedRounds: number;
  correctAnswers: number;
  starsEarned: number;
  lastPlayedAt?: string;
}

/** Perfil local de uma criança armazenado no navegador. */
export interface ChildProfile {
  id: string;
  name: string;
  avatar: AvatarId;
  ageLevel: AgeLevel;
  stars: number;
  unlockedStickers: string[];
  stats: Record<PillarId, PillarStats>;
  createdAt: string;
}

/** Velocidade de reprodução da narração dos exercícios. */
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

/** Preferências globais de áudio do aplicativo. */
export interface AudioSettings {
  voiceEnabled: boolean;
  sfxEnabled: boolean;
  voiceSpeed?: VoiceSpeed;
  voiceURI?: string;
}

/** Estado raiz persistido em `localStorage`. */
export interface AppState {
  version: number;
  activeProfileId: string;
  profiles: ChildProfile[];
  audio: AudioSettings;
}

export type FigureId =
  | 'abelha'
  | 'elefante'
  | 'ilha'
  | 'ovelha'
  | 'urso'
  | 'bola'
  | 'casa'
  | 'dado'
  | 'flor'
  | 'gato'
  | 'lua'
  | 'maca'
  | 'nuvem'
  | 'pato'
  | 'sapo'
  | 'sol'
  | 'peixe'
  | 'morango'
  | 'banana'
  | 'borboleta'
  | 'carro'
  | 'foguete'
  | 'rato'
  | 'pao'
  | 'mao'
  | 'uva'
  | 'arvore'
  | 'estrela';

export type ColorId =
  | 'vermelho'
  | 'azul'
  | 'amarelo'
  | 'verde'
  | 'laranja'
  | 'roxo';

export type ShapeId =
  | 'circulo'
  | 'quadrado'
  | 'triangulo'
  | 'estrela'
  | 'coracao'
  | 'retangulo';

export interface FigureItem {
  id: FigureId;
  name: string;
  letter: string;
  isVowel: boolean;
  colorId: ColorId;
  category: 'animal' | 'natureza' | 'fruta' | 'objeto';
  missingLetterIndex: number;
  syllables: string[];
}

export interface ColorInfo {
  id: ColorId;
  name: string;
  hex: string;
  darkHex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export interface ShapeInfo {
  id: ShapeId;
  name: string;
  colorHex: string;
  accentHex: string;
}

export interface StickerItem {
  id: string;
  name: string;
  theme: 'Animais' | 'Espaço' | 'Natureza' | 'Frutas';
  figureId: FigureId;
  bgHex: string;
}

export interface TracingPoint {
  x: number;
  y: number;
}

export interface TracingTemplate {
  id: string;
  label: string;
  spokenName: string;
  category: 'caminho' | 'forma' | 'letra' | 'numero';
  minLevel: AgeLevel;
  svgPath: string;
  checkpoints: TracingPoint[];
}

export type MascotMood = 'happy' | 'excited' | 'encouraging' | 'thinking';
