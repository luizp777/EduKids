/** Faixas etárias suportadas pelo EduKids (3–4: Exploradores, 5–6: Descobridores). */
export type AgeLevel = '3-4' | '5-6';

/** Identificadores dos 8 pilares pedagógicos do aplicativo. */
export type PillarId =
  | 'literacy'
  | 'math'
  | 'shapes-colors'
  | 'figures-logic'
  | 'tracing'
  | 'music-sounds'
  | 'emotions-routine'
  | 'nature-habitats';

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
  /** Quantidade de rodadas concluídas neste pilar. */
  completedRounds: number;
  /** Total de acertos individuais acumulados. */
  correctAnswers: number;
  /** Total de estrelas ganhas neste pilar. */
  starsEarned: number;
  /** Data/hora ISO da última atividade concluída. */
  lastPlayedAt?: string;
}

/** Acessórios visuais da mascote Lumi desbloqueados por marcos de estrelas. */
export type LumiAccessoryId = 'none' | 'bow' | 'crown' | 'glasses' | 'wizard' | 'cape';

/** Desenho pintado pela criança e salvo na galeria do álbum. */
export interface SavedPainting {
  /** Identificador único da pintura salva. */
  id: string;
  /** Identificador do desenho base em `PAINT_DRAWINGS`. */
  drawingId: string;
  /** Nome amigável do desenho (ex.: `"Casa"`, `"Foguete"`). */
  label: string;
  /** Mapa de cor hexadecimal por ID de parte do SVG. */
  parts: Record<string, string>;
  /** Data/hora ISO em que a pintura foi salva. */
  createdAt: string;
}

/** Registro recente de rodada concluída para o histórico da Área dos Pais. */
export interface ActivityHistoryEntry {
  /** Pilar pedagógico da rodada concluída. */
  pillar: PillarId;
  /** Data/hora ISO da conclusão. */
  completedAt: string;
  /** Estrelas concedidas na rodada (incluindo bônus diário, se houver). */
  starsEarned: number;
}

/** Configuração e controle diário do temporizador gentil de tempo de tela. */
export interface ScreenTimeSettings {
  /** Limite diário em minutos (`0` = sem limite). */
  limitMinutes: number;
  /** Segundos acumulados em atividades na data atual (`usageDate`). */
  usedSecondsToday: number;
  /** Data local (`YYYY-MM-DD`) da contabilização atual. */
  usageDate: string;
  /** Minutos extras liberados pelos pais hoje via Parental Gate. */
  extraMinutesToday: number;
}

/** Perfil local de uma criança armazenado no navegador. */
export interface ChildProfile {
  /** Identificador único do perfil. */
  id: string;
  /** Nome de exibição da criança. */
  name: string;
  /** Identificador do avatar SVG selecionado. */
  avatar: AvatarId;
  /** Faixa etária que calibra a dificuldade dos jogos. */
  ageLevel: AgeLevel;
  /** Saldo acumulado de estrelas do perfil. */
  stars: number;
  /** Lista de IDs das figurinhas já desbloqueadas no álbum. */
  unlockedStickers: string[];
  /** Lista de IDs das figurinhas evoluídas para Dourada Brilhante. */
  goldenStickers: string[];
  /** Acessório visual equipado na mascote Lumi. */
  lumiAccessory: LumiAccessoryId;
  /** Galeria de pinturas mágicas salvas pela criança (máx. 12). */
  savedPaintings: SavedPainting[];
  /** Quantidade de dias seguidos brincando (ofensiva). */
  streakDays: number;
  /** Última data (`YYYY-MM-DD`) em que a criança completou uma rodada. */
  lastActiveDate?: string;
  /** Últimas rodadas concluídas (máx. 10) para exibição na Área dos Pais. */
  recentHistory: ActivityHistoryEntry[];
  /** Métricas acumuladas indexadas por pilar pedagógico. */
  stats: Record<PillarId, PillarStats>;
  /** Data (YYYY-MM-DD) do último bônus diário de Aventura do Dia resgatado. */
  dailyBonusDate?: string;
  /** Pilar concluído no último bônus diário de Aventura do Dia. */
  dailyBonusPillar?: PillarId;
  /** Data/hora ISO de criação do perfil. */
  createdAt: string;
}

/** Velocidade de reprodução da narração dos exercícios. */
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

/** Preferências globais de áudio e bem-estar sensorial do aplicativo. */
export interface AudioSettings {
  /** Indica se a narração em voz está ativa. */
  voiceEnabled: boolean;
  /** Indica se os efeitos sonoros e notas musicais estão ativos. */
  sfxEnabled: boolean;
  /** Velocidade da leitura em voz alta. */
  voiceSpeed?: VoiceSpeed;
  /** Volume global normalizado (0.0 a 1.0) aplicado a voz, melodia e efeitos. */
  volume?: number;
  /** Modo Calmo / Sensorial: reduz estímulos visuais (confetes/trepidação) e suaviza sons. */
  calmMode?: boolean;
}

/** Estado raiz persistido em `localStorage`. */
export interface AppState {
  /** Versão do esquema de persistência. */
  version: number;
  /** ID do perfil infantil selecionado no momento. */
  activeProfileId: string;
  /** Lista de todos os perfis cadastrados no dispositivo. */
  profiles: ChildProfile[];
  /** Preferências globais de áudio compartilhadas entre os perfis. */
  audio: AudioSettings;
  /** Configuração e controle diário do temporizador gentil de tempo de tela. */
  screenTime?: ScreenTimeSettings;
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
  | 'estrela'
  | 'cachorro'
  | 'leao'
  | 'passaro'
  | 'tartaruga'
  | 'aviao'
  | 'livro'
  | 'arcoiris'
  | 'melancia';

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

/** Metadados pedagógicos e visuais de uma figura do catálogo. */
export interface FigureItem {
  /** Identificador único da figura. */
  id: FigureId;
  /** Nome da figura em maiúsculas para exibição nos cartões. */
  name: string;
  /** Letra inicial da palavra. */
  letter: string;
  /** Indica se a palavra começa com vogal (usado no nível `3-4`). */
  isVowel: boolean;
  /** Cor predominante associada à figura. */
  colorId: ColorId;
  /** Categoria semântica para agrupamento lógico. */
  category: 'animal' | 'natureza' | 'fruta' | 'objeto';
  /** Índice da letra oculta no modo "Completar Palavra". */
  missingLetterIndex: number;
  /** Divisão silábica da palavra. */
  syllables: string[];
}

/** Definição de uma cor com paleta e classes utilitárias Tailwind. */
export interface ColorInfo {
  /** Identificador único da cor. */
  id: ColorId;
  /** Nome da cor em português. */
  name: string;
  /** Código hexadecimal principal. */
  hex: string;
  /** Tom escuro para bordas e contraste. */
  darkHex: string;
  /** Classe Tailwind de fundo. */
  bgClass: string;
  /** Classe Tailwind de borda. */
  borderClass: string;
  /** Classe Tailwind de texto. */
  textClass: string;
}

/** Definição de uma forma geométrica do catálogo. */
export interface ShapeInfo {
  /** Identificador único da forma. */
  id: ShapeId;
  /** Nome da forma em português. */
  name: string;
  /** Cor de preenchimento principal. */
  colorHex: string;
  /** Cor de destaque auxiliar. */
  accentHex: string;
}

/** Tema de organização das figurinhas no álbum. */
export type StickerTheme = 'Animais' | 'Espaço' | 'Natureza' | 'Frutas' | 'Objetos e Amigos';

/** Item colecionável do Álbum de Figurinhas. */
export interface StickerItem {
  /** Identificador único da figurinha. */
  id: string;
  /** Nome carinhoso da figurinha. */
  name: string;
  /** Tema da coleção no álbum. */
  theme: StickerTheme;
  /** Figura SVG associada à figurinha. */
  figureId: FigureId;
  /** Cor de fundo do cartão desbloqueado. */
  bgHex: string;
}

/** Desenho interativo disponível na Pintura Mágica e na Galeria do Álbum. */
export interface PaintDrawing {
  /** Identificador único do desenho. */
  id: string;
  /** Nome exibido no seletor e na galeria. */
  label: string;
  /** Partes SVG pintáveis que compõem o desenho. */
  parts: { id: string; d: string; label: string }[];
}

/** Metadados de um acessório visual da mascote Lumi. */
export interface LumiAccessoryInfo {
  /** Identificador único do acessório. */
  id: LumiAccessoryId;
  /** Nome exibido nos seletores da Home e do Álbum. */
  name: string;
  /** Quantidade mínima de estrelas acumuladas para desbloquear. */
  minStars: number;
  /** Descrição curta do requisito de desbloqueio. */
  description: string;
}

/** Coordenada normalizada (`0..100`) de um checkpoint no Traçado Mágico. */
export interface TracingPoint {
  /** Posição horizontal normalizada (`0..100`). */
  x: number;
  /** Posição vertical normalizada (`0..100`). */
  y: number;
}

/** Modelo de exercício de traçado motor, forma, letra ou número. */
export interface TracingTemplate {
  /** Identificador único do modelo. */
  id: string;
  /** Rótulo curto exibido nos botões e badges. */
  label: string;
  /** Nome falado pela Lumi com artigo (ex.: `"a letra A"`). */
  spokenName: string;
  /** Categoria do traçado. */
  category: 'caminho' | 'forma' | 'letra' | 'numero';
  /** Faixa etária mínima para exibição. */
  minLevel: AgeLevel;
  /** Caminho SVG em viewBox `0 0 100 100`. */
  svgPath: string;
  /** Sequência de checkpoints que a criança deve percorrer. */
  checkpoints: TracingPoint[];
}

/** Expressão facial e estado de animação da mascote Lumi. */
export type MascotMood = 'happy' | 'excited' | 'encouraging' | 'thinking' | 'sleepy';
