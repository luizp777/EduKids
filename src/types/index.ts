export type AgeLevel = '3-4' | '5-6';

export type PillarId =
  | 'literacy'
  | 'math'
  | 'shapes-colors'
  | 'figures-logic'
  | 'tracing';

export type AvatarId =
  | 'owl'
  | 'bear'
  | 'cat'
  | 'bunny'
  | 'fox'
  | 'dino';

export interface PillarStats {
  completedRounds: number;
  correctAnswers: number;
  starsEarned: number;
  lastPlayedAt?: string;
}

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

export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export interface AudioSettings {
  voiceEnabled: boolean;
  sfxEnabled: boolean;
  voiceSpeed?: VoiceSpeed;
  voiceURI?: string;
}

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
