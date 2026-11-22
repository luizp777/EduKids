import type { AgeLevel, VoiceSpeed } from '../types';
import { AUDIO_CLIP_IDS } from '../data/audioClips';

let audioCtx: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let masterCompressorNode: DynamicsCompressorNode | null = null;
let masterVolume = 0.85;
let audioUnlocked = false;

/**
 * Define o volume mestre global (0.0 a 1.0) para voz, melodia e efeitos sonoros.
 */
export function setMasterVolume(volume: number): void {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0.85));
  masterVolume = clamped;
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setTargetAtTime(clamped, audioCtx.currentTime, 0.015);
  }
  if (currentAudio) {
    currentAudio.volume = getNormalizedVoiceVolume();
  }
}

/** Retorna o volume mestre global atual (0.0 a 1.0). */
export function getMasterVolume(): number {
  return masterVolume;
}

/**
 * Retorna o volume calibrado para narração (MP3/TTS) mantendo equilíbrio
 * perceptivo com as notas musicais sintetizadas.
 */
export function getNormalizedVoiceVolume(): number {
  return Math.max(0, Math.min(1, masterVolume * 0.85));
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getMasterOutput(ctx: AudioContext): AudioNode {
  if (!masterGainNode) {
    masterGainNode = ctx.createGain();
    masterGainNode.gain.setValueAtTime(masterVolume, ctx.currentTime);
    masterGainNode.connect(ctx.destination);
  }
  if (!masterCompressorNode) {
    masterCompressorNode = ctx.createDynamicsCompressor();
    masterCompressorNode.threshold.setValueAtTime(-14, ctx.currentTime);
    masterCompressorNode.knee.setValueAtTime(12, ctx.currentTime);
    masterCompressorNode.ratio.setValueAtTime(4, ctx.currentTime);
    masterCompressorNode.attack.setValueAtTime(0.005, ctx.currentTime);
    masterCompressorNode.release.setValueAtTime(0.15, ctx.currentTime);
    masterCompressorNode.connect(masterGainNode);
  }
  return masterCompressorNode;
}

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (audioUnlocked) return;
    audioUnlocked = true;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
}

export type SfxType = 'pop' | 'success' | 'encourage' | 'celebration' | 'draw';

/**
 * Reproduz um efeito sonoro sintetizado via Web Audio API.
 *
 * @param type - Tipo do efeito (`pop`, `success`, `encourage`, `celebration` ou `draw`).
 * @param enabled - Se `false`, não reproduz som.
 */
export function playSfx(type: SfxType, enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const output = getMasterOutput(ctx);

  const now = ctx.currentTime;

  const playTone = (
    freq: number,
    startOffset: number,
    duration: number,
    wave: OscillatorType = 'sine',
    volume = 0.42
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now + startOffset);
    gain.gain.setValueAtTime(0.001, now + startOffset);
    gain.gain.exponentialRampToValueAtTime(volume, now + startOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
    osc.connect(gain);
    gain.connect(output);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration + 0.02);
  };

  switch (type) {
    case 'pop':
      playTone(520, 0, 0.08, 'sine', 0.36);
      playTone(680, 0.03, 0.07, 'triangle', 0.28);
      break;
    case 'draw':
      playTone(760, 0, 0.05, 'sine', 0.22);
      break;
    case 'success':
      playTone(523.25, 0, 0.14, 'triangle', 0.45);
      playTone(659.25, 0.09, 0.14, 'triangle', 0.45);
      playTone(783.99, 0.18, 0.24, 'triangle', 0.5);
      break;
    case 'encourage':
      playTone(349.23, 0, 0.14, 'sine', 0.34);
      playTone(329.63, 0.11, 0.18, 'sine', 0.3);
      break;
    case 'celebration':
      playTone(523.25, 0, 0.12, 'triangle', 0.45);
      playTone(659.25, 0.1, 0.12, 'triangle', 0.45);
      playTone(783.99, 0.2, 0.14, 'triangle', 0.48);
      playTone(1046.5, 0.32, 0.36, 'triangle', 0.52);
      break;
  }
}

const XYLOPHONE_FREQS = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];

/**
 * Toca uma nota musical normalizada (escala de Dó maior) para o Xilofone e Memória Musical,
 * com corpo harmônico e sustentação calibrados para igualar o volume da narração.
 */
export function playMusicalNote(noteIndex: number, enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const output = getMasterOutput(ctx);

  const freq = XYLOPHONE_FREQS[noteIndex % XYLOPHONE_FREQS.length];
  const now = ctx.currentTime;

  // Fundamental oscillator with brief sustain plateau for perceived loudness parity
  const oscMain = ctx.createOscillator();
  const gainMain = ctx.createGain();
  oscMain.type = 'triangle';
  oscMain.frequency.setValueAtTime(freq, now);
  gainMain.gain.setValueAtTime(0.001, now);
  gainMain.gain.exponentialRampToValueAtTime(0.78, now + 0.015);
  gainMain.gain.setValueAtTime(0.72, now + 0.12);
  gainMain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
  oscMain.connect(gainMain);
  gainMain.connect(output);
  oscMain.start(now);
  oscMain.stop(now + 0.55);

  // Soft octave harmonic for clarity on small mobile speakers
  const oscHarmonic = ctx.createOscillator();
  const gainHarmonic = ctx.createGain();
  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.setValueAtTime(freq * 2, now);
  gainHarmonic.gain.setValueAtTime(0.001, now);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.24, now + 0.01);
  gainHarmonic.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  oscHarmonic.connect(gainHarmonic);
  gainHarmonic.connect(output);
  oscHarmonic.start(now);
  oscHarmonic.stop(now + 0.28);
}

/**
 * Toca um som grave (elefante/urso) ou agudo (passarinho/abelha) para discriminação auditiva.
 */
export function playPitchSound(kind: 'low' | 'high', enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const output = getMasterOutput(ctx);

  const now = ctx.currentTime;
  const freqs = kind === 'low' ? [130.81, 110.0] : [783.99, 987.77];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === 'low' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.22);
    gain.gain.setValueAtTime(0.001, now + idx * 0.22);
    gain.gain.exponentialRampToValueAtTime(kind === 'low' ? 0.55 : 0.68, now + idx * 0.22 + 0.025);
    gain.gain.setValueAtTime(kind === 'low' ? 0.48 : 0.6, now + idx * 0.22 + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 0.34);
    osc.connect(gain);
    gain.connect(output);
    osc.start(now + idx * 0.22);
    osc.stop(now + idx * 0.22 + 0.36);
  });
}

const VOWEL_PRONUNCIATION: Record<string, string> = {
  A: 'Á',
  E: 'É',
  I: 'Í',
  O: 'Ó',
  U: 'Ú',
};

/** Normaliza operadores matemáticos e letras isoladas para pronúncia clara em `pt-BR`. */
export function formatSpeechText(raw: string): string {
  return raw
    .replace(/\bletra\s+([AEIOU])\b/gi, (_, ch: string) => {
      const upper = ch.toUpperCase();
      return `letra, ${VOWEL_PRONUNCIATION[upper] || upper}`;
    })
    .replace(/\bletra\s+([BCDFGHJKLMNPQRSTVWXYZ])\b/gi, (_, ch: string) => {
      return `letra, ${ch.toUpperCase()}`;
    })
    .replace(/\s*\+\s*/g, ' mais ')
    .replace(/(\d)\s*-\s*(\d)/g, '$1 menos $2')
    .replace(/\s+-\s+/g, ' menos ')
    .replace(/\s*=\s*/g, ' é igual a ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Calcula a taxa de velocidade da síntese de voz (`SpeechSynthesis`) por idade e preferência. */
export function getSpeechRate(speed: VoiceSpeed = 'normal', ageLevel: AgeLevel = '3-4'): number {
  if (speed === 'slow') return ageLevel === '3-4' ? 0.76 : 0.82;
  if (speed === 'fast') return 1.05;
  return ageLevel === '3-4' ? 0.86 : 0.94;
}

/** Calcula o `playbackRate` dos clipes MP3 neurais por idade e velocidade selecionada. */
export function getAudioPlaybackRate(speed: VoiceSpeed = 'normal', ageLevel: AgeLevel = '3-4'): number {
  if (speed === 'slow') return ageLevel === '3-4' ? 0.86 : 0.9;
  if (speed === 'fast') return 1.12;
  return ageLevel === '3-4' ? 0.95 : 1.0;
}

function slug(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const EXACT_CLIPS: Record<string, string> = {
  'som ligado!': 'som-ligado',
  'olá! eu sou a lumi e vou ler os exercícios com você!': 'lumi-teste',
  'jogue mais atividades para ganhar esta figurinha!': 'sticker-locked',
  'muito bem! você acertou!': 'cel-0',
  'parabéns! incrível!': 'cel-1',
  'isso mesmo! você brilhou!': 'cel-2',
  'arrasou! que esperteza!': 'cel-3',
  'quase lá! tente de novo!': 'enc-0',
  'você consegue! vamos tentar mais uma vez!': 'enc-1',
  'ops, tente outra opção!': 'enc-2',
  'muito bem por tentar! qual será a certa?': 'enc-3',
  'vamos contar! quantas figuras aparecem na tela?': 'p-contar',
  'toque no grupo que tem mais figuras!': 'p-mais',
  'toque no grupo que tem menos figuras!': 'p-menos',
  'qual número está faltando na sequência?': 'p-sequencia-num',
  'encaixe cada forma no seu lugar! você pode arrastar ou tocar.': 'p-encaixe-formas',
  'observe a sequência! qual forma vem depois?': 'p-padrao-seq',
  'observe o padrão! qual forma vem depois?': 'p-padrao-obs',
  'encontre os pares de figuras iguais!': 'p-memoria',
  'de qual figura é esta sombra?': 'p-sombra',
  'qual figura é diferente das outras?': 'p-diferente',
  'toque nas figuras do menor para o maior!': 'p-ordem-tamanhos',
  'toque nos números do menor para o maior!': 'p-ordem-numeros',
  'escolha uma cor e toque no desenho para pintar!': 'p-pintura-magica',
  'toque nas teclas coloridas para fazer música!': 'p-xilofone',
  'ouça a melodia com atenção!': 'p-simon-ouca',
  'agora é a sua vez! repita a melodia!': 'p-simon-sua-vez',
  'quem faz miau, miau?': 'p-som-gato',
  'quem faz quá, quá?': 'p-som-pato',
  'quem faz croac, croac?': 'p-som-sapo',
  'quem faz zum, zum?': 'p-som-abelha',
  'quem faz méé, méé?': 'p-som-ovelha',
  'quem faz au, au?': 'p-som-cachorro',
  'quem ruge forte: roar!': 'p-som-leao',
  'quem faz piu, piu?': 'p-som-passaro',
  'quem faz grrr, grrr?': 'p-som-urso',
  'ouça o som! ele é grave como o elefante ou agudo como o passarinho?': 'p-grave-agudo',
  'observe o quadro! qual figura está faltando?': 'p-matriz',
  'a florzinha está com sede! o que ajuda ela a crescer?': 'p-cuidar-agua',
  'a árvore precisa de luz e calor! quem ajuda?': 'p-cuidar-sol',
  'quem ajuda a levar o pólen de flor em flor?': 'p-cuidar-polen',
  'qual bichinho também mora e cuida do jardim?': 'p-cuidar-jardim',
  'qual rostinho combina com essa situação?': 'p-emocao',
  'isso acontece de dia ou de noite?': 'p-dia-noite',
  'o que usamos para cuidar da nossa saúde?': 'p-habitos',
  'onde este bichinho mora?': 'p-habitat',
  'o que devemos usar neste clima?': 'p-clima',
  // Situations & items for pre-readers
  'ganhou um abraço bem apertado!': 'sit-abraco',
  'o sorvete caiu no chão!': 'sit-sorvete',
  'abriu um presente surpresa!': 'sit-presente',
  'hora de dormir na caminha!': 'sit-dormir',
  'sol brilhando!': 'dn-sol',
  'brincar com a bola!': 'dn-bola',
  'lua no céu!': 'dn-lua',
  'ver as estrelas!': 'dn-estrela',
  'passear no jardim!': 'dn-flor',
  'hora do lanchinho saudável!': 'hab-lanche',
  'vamos comer uma fruta gostosa!': 'hab-fruta',
  'lavar as mãos antes de comer!': 'hab-maos',
  'brincar ao ar livre faz bem!': 'hab-ar-livre',
  'dia de sol!': 'cli-sol',
  'dia de chuva!': 'cli-chuva',
  'passeio na ilha!': 'cli-ilha',
  // Sticker names
  'abelha zuzu': 'stk-abelha',
  'elefante dudu': 'stk-elefante',
  'gatinho mimi': 'stk-gato',
  'sapo pipoca': 'stk-sapo',
  'urso mel': 'stk-urso',
  'borboleta lili': 'stk-borboleta',
  'patinho quá': 'stk-pato',
  'peixe bolha': 'stk-peixe',
  'ratinho tico': 'stk-rato',
  'foguete turbo': 'stk-foguete',
  'lua soneca': 'stk-lua',
  'sol brilhante': 'stk-sol',
  'estrela guia': 'stk-estrela',
  'nuvem fofa': 'stk-nuvem',
  'flor mágica': 'stk-flor',
  'ilha feliz': 'stk-ilha',
  'árvore viva': 'stk-arvore',
  'maçã doce': 'stk-maca',
  'moranguinho': 'stk-morango',
  'banana pop': 'stk-banana',
  'uva roxinha': 'stk-uva',
  'carrinho vrum': 'stk-carro',
  'cachorrinho au': 'stk-cachorro',
  'leão juba': 'stk-leao',
  'passarinho azul': 'stk-passaro',
  'tartaruga tina': 'stk-tartaruga',
  'avião veloz': 'stk-aviao',
  'arco-íris vivo': 'stk-arcoiris',
  'melancia doce': 'stk-melancia',
};

const PRAISE_PREFIXES = [
  'Muito bem! Você acertou!',
  'Parabéns! Incrível!',
  'Isso mesmo! Você brilhou!',
  'Arrasou! Que esperteza!',
];

function resolveSingleToken(token: string): string | null {
  const s = slug(token);
  if (!s) return null;
  if (/^\d+$/.test(s) && AUDIO_CLIP_IDS.has(`num-${s}`)) return `num-${s}`;
  if (/^[a-z]$/.test(s) && AUDIO_CLIP_IDS.has(`letter-${s}`)) return `letter-${s}`;
  for (const prefix of ['fig-', 'shape-', 'color-', 'cat-']) {
    if (AUDIO_CLIP_IDS.has(`${prefix}${s}`)) return `${prefix}${s}`;
  }
  return null;
}

function resolveTracingName(spokenName: string): string | null {
  const s = slug(spokenName);
  let m = s.match(/^a-letra-([a-z])$/);
  if (m && AUDIO_CLIP_IDS.has(`tr-letra-${m[1]}`)) return `tr-letra-${m[1]}`;
  m = s.match(/^o-numero-(\d)$/);
  if (m && AUDIO_CLIP_IDS.has(`tr-num-${m[1]}`)) return `tr-num-${m[1]}`;
  const clean = s.replace(/^(a|o)-/, '');
  if (AUDIO_CLIP_IDS.has(`tr-${clean}`)) return `tr-${clean}`;
  return null;
}

/**
 * Maps exercise text to pre-generated neural MP3 clip IDs in public/audio/pt-br/.
 * Returns null if no pre-generated mapping exists (triggers speechSynthesis fallback).
 */
export function resolveAudioClips(rawText: string): string[] | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  if (EXACT_CLIPS[lower] && AUDIO_CLIP_IDS.has(EXACT_CLIPS[lower])) {
    return [EXACT_CLIPS[lower]];
  }

  if (/^olá .*! eu sou a lumi!/i.test(trimmed)) {
    return AUDIO_CLIP_IDS.has('lumi-home') ? ['lumi-home'] : null;
  }

  // Split praise prefix + detail (e.g. "Parabéns! Incrível! 3 mais 2 é igual a 5!")
  for (const prefix of PRAISE_PREFIXES) {
    if (trimmed.startsWith(prefix) && trimmed.length > prefix.length) {
      const rest = trimmed.slice(prefix.length).trim();
      const restClips = resolveAudioClips(rest);
      const prefixClip = EXACT_CLIPS[prefix.toLowerCase()];
      if (restClips && prefixClip) {
        return [prefixClip, ...restClips];
      }
      if (prefixClip) {
        return [prefixClip];
      }
    }
  }

  // Single number, figure, shape, or color
  const single = resolveSingleToken(trimmed);
  if (single) return [single];

  // Literacy prompts
  let m = trimmed.match(/^Qual figura começa com a letra ([A-Z])\??$/i);
  if (m) {
    const l = `letter-${m[1].toLowerCase()}`;
    if (AUDIO_CLIP_IDS.has(l)) return ['p-letra-inicial', l];
  }

  m = trimmed.match(/^Qual letra falta na palavra (.+?)\??$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['p-letra-falta', fig];
  }

  m = trimmed.match(/^Qual figura rima com (.+?)\??$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['p-rima', fig];
  }

  m = trimmed.match(/^Vamos bater palmas! Quantos pedacinhos tem a palavra (.+?)\??$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['p-silabas', fig];
  }

  m = trimmed.match(/^Toque nas letras na ordem certa para montar a palavra (.+?)!?$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['p-montar-palavra', fig];
  }

  m = trimmed.match(/^Quem combina com (.+?)\??$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['p-combinar', fig];
  }

  m = trimmed.match(/^Com qual pedacinho começa a palavra (.+?)\??$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig && AUDIO_CLIP_IDS.has('p-silaba-inicial')) return ['p-silaba-inicial', fig];
  }

  m = trimmed.match(/^(.+?) parece com qual forma\??$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig && AUDIO_CLIP_IDS.has('p-parece-forma')) return [fig, 'p-parece-forma'];
  }

  m = trimmed.match(/^Onde encontramos (.+?)\??$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig && AUDIO_CLIP_IDS.has('p-onde-encontramos')) return ['p-onde-encontramos', fig];
  }

  // Pre-reader situation + question composite prompts
  const compositeEndings: [string, string][] = [
    ['Qual rostinho combina com essa situação?', 'p-emocao'],
    ['Isso acontece de dia ou de noite?', 'p-dia-noite'],
    ['O que usamos para cuidar da nossa saúde?', 'p-habitos'],
    ['O que devemos usar neste clima?', 'p-clima'],
  ];
  for (const [ending, endingClip] of compositeEndings) {
    if (trimmed.endsWith(ending) && trimmed.length > ending.length) {
      const lead = trimmed.slice(0, trimmed.length - ending.length).trim();
      const leadClip = EXACT_CLIPS[lead.toLowerCase()] || EXACT_CLIPS[`${lead.toLowerCase()}!`];
      if (leadClip && AUDIO_CLIP_IDS.has(leadClip)) {
        return [leadClip, endingClip];
      }
    }
  }

  m = trimmed.match(/^Onde este bichinho mora\?\s*(.+?)!?$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['p-habitat', fig];
  }

  // Math prompts
  m = trimmed.match(/^Vamos somar! Quanto é (\d+) mais (\d+)\??$/i);
  if (m) {
    const a = `num-${m[1]}`;
    const b = `num-${m[2]}`;
    if (AUDIO_CLIP_IDS.has(a) && AUDIO_CLIP_IDS.has(b)) {
      return ['p-somar', a, 'mais', b];
    }
  }

  m = trimmed.match(/^Tinha (\d+), saíram (\d+)\. Quantos ficaram\??$/i);
  if (m) {
    const a = `num-${m[1]}`;
    const b = `num-${m[2]}`;
    if (AUDIO_CLIP_IDS.has(a) && AUDIO_CLIP_IDS.has(b)) {
      return ['p-tinha', a, 'sairam', b, 'quantos-ficaram'];
    }
  }

  // Shapes & Colors prompts
  m = trimmed.match(/^Toque nas figuras da cor (.+?)!?$/i);
  if (m) {
    const col = `color-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(col)) return ['p-toque-cor', col];
  }

  m = trimmed.match(/^Qual cor aparece quando misturamos (.+?) com (.+?)\??$/i);
  if (m) {
    const cA = `color-${slug(m[1])}`;
    const cB = `color-${slug(m[2])}`;
    if (AUDIO_CLIP_IDS.has(cA) && AUDIO_CLIP_IDS.has(cB)) {
      return ['p-mistura-cores', cA, 'com', cB];
    }
  }

  m = trimmed.match(/^Isso!\s*(.+?)!?$/i);
  if (m) {
    const tok = resolveSingleToken(m[1]);
    if (tok) return ['isso', tok];
  }

  // Figures & Logic prompts
  m = trimmed.match(/^Par de (.+?)!?$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['par-de', fig];
  }

  m = trimmed.match(/^(.+?) pertence a qual grupo\??$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return [fig, 'pertence-grupo'];
  }

  m = trimmed.match(/^Toque em duas peças para trocar e montar:\s*(.+?)!?$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['p-puzzle', fig];
  }

  m = trimmed.match(/^Você montou (.+?)!?$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    if (fig) return ['voce-montou', fig];
  }

  // Tracing prompts
  m = trimmed.match(/^Use o dedinho para traçar (.+?)!?$/i);
  if (m) {
    const tr = resolveTracingName(m[1]);
    if (tr) return ['p-tracar', tr];
  }

  m = trimmed.match(/^Você desenhou (.+?)!?$/i);
  if (m) {
    const tr = resolveTracingName(m[1]);
    if (tr) return ['voce-desenhou', tr];
  }

  // Post-praise details
  m = trimmed.match(/^([A-Z]) de (.+?)!?$/i);
  if (m) {
    const l = `letter-${m[1].toLowerCase()}`;
    const fig = resolveSingleToken(m[2]);
    if (AUDIO_CLIP_IDS.has(l) && fig) return [l, 'de', fig];
  }

  m = trimmed.match(/^(\d+) mais (\d+) é igual a (\d+)!?$/i);
  if (m) {
    const a = `num-${m[1]}`;
    const b = `num-${m[2]}`;
    const c = `num-${m[3]}`;
    if (AUDIO_CLIP_IDS.has(a) && AUDIO_CLIP_IDS.has(b) && AUDIO_CLIP_IDS.has(c)) {
      return [a, 'mais', b, 'igual-a', c];
    }
  }

  m = trimmed.match(/^São (\d+)!?$/i);
  if (m && AUDIO_CLIP_IDS.has(`num-${m[1]}`)) return ['sao', `num-${m[1]}`];

  m = trimmed.match(/^Ficaram (\d+)!?$/i);
  if (m && AUDIO_CLIP_IDS.has(`num-${m[1]}`)) return ['ficaram', `num-${m[1]}`];

  m = trimmed.match(/^O número (\d+)!?$/i);
  if (m && AUDIO_CLIP_IDS.has(`num-${m[1]}`)) return ['o-numero', `num-${m[1]}`];

  m = trimmed.match(/^(.+?) rima com (.+?)!?$/i);
  if (m) {
    const figA = resolveSingleToken(m[1]);
    const figB = resolveSingleToken(m[2]);
    if (figA && figB) return [figA, 'rima-com', figB];
  }

  m = trimmed.match(/^(.+?) tem (\d+) sílabas?!?$/i);
  if (m) {
    const fig = resolveSingleToken(m[1]);
    const num = `num-${m[2]}`;
    const unit = Number(m[2]) === 1 ? 'silaba' : 'silabas';
    if (fig && AUDIO_CLIP_IDS.has(num)) return [fig, 'tem', num, unit];
  }

  m = trimmed.match(/^Esse grupo tem (\d+), que é (mais|menos)!?$/i);
  if (m && AUDIO_CLIP_IDS.has(`num-${m[1]}`)) {
    return ['esse-grupo-tem', `num-${m[1]}`, m[2].toLowerCase() === 'mais' ? 'que-e-mais' : 'que-e-menos'];
  }

  m = trimmed.match(/^Forma (.+?)!?$/i);
  if (m) {
    const col = `color-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(col)) return ['forma', col];
  }

  return null;
}

const NATURAL_VOICE_RE = /google|natural|neural|luciana|francisca|thalita|maria|antonio/i;

function getAvailablePtVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  const ptVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('pt'));
  return [...ptVoices].sort((a, b) => {
    const aBr = a.lang.toLowerCase() === 'pt-br' ? 1 : 0;
    const bBr = b.lang.toLowerCase() === 'pt-br' ? 1 : 0;
    if (aBr !== bBr) return bBr - aBr;
    const aNat = NATURAL_VOICE_RE.test(a.name) ? 1 : 0;
    const bNat = NATURAL_VOICE_RE.test(b.name) ? 1 : 0;
    return bNat - aNat;
  });
}

function resolveVoice(preferredURI?: string): SpeechSynthesisVoice | null {
  const voices = getAvailablePtVoices();
  if (voices.length === 0) return null;
  if (preferredURI) {
    const match = voices.find((v) => v.voiceURI === preferredURI);
    if (match) return match;
  }
  return voices[0];
}

type SpeakingListener = (speaking: boolean) => void;
const listeners = new Set<SpeakingListener>();
let speakTimerId: number | null = null;
let currentAudio: HTMLAudioElement | null = null;
let clipQueue: string[] = [];
let playbackSession = 0;
let onPlaybackEnd: (() => void) | null = null;

function flushPlaybackEnd() {
  const cb = onPlaybackEnd;
  onPlaybackEnd = null;
  if (cb) cb();
}

function notifySpeaking(speaking: boolean) {
  for (const fn of listeners) fn(speaking);
}

/** Registra um ouvinte para mudanças no estado de fala ativa da Lumi. */
export function subscribeSpeaking(fn: SpeakingListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Opções de reprodução de fala para `speak`. */
export interface SpeakOptions {
  /** Se `false`, não reproduz áudio e dispara `onEnd` imediatamente. */
  enabled?: boolean;
  /** Velocidade da narração (`slow`, `normal` ou `fast`). */
  speed?: VoiceSpeed;
  /** Faixa etária da criança para ajuste automático de ritmo. */
  ageLevel?: AgeLevel;
  /** URI opcional de voz para o fallback `speechSynthesis`. */
  voiceURI?: string;
  /** Se `true`, enfileira após a fala atual em vez de interrompê-la. */
  queue?: boolean;
  /** Callback executado ao término da reprodução. */
  onEnd?: () => void;
}

function playNextClip(session: number, rate: number, fallbackText: string, opts: SpeakOptions): void {
  if (session !== playbackSession) return;
  const nextId = clipQueue.shift();
  if (!nextId) {
    currentAudio = null;
    notifySpeaking(false);
    flushPlaybackEnd();
    return;
  }

  const audio = new Audio(`/audio/pt-br/${nextId}.mp3`);
  audio.playbackRate = rate;
  audio.volume = getNormalizedVoiceVolume();
  currentAudio = audio;
  notifySpeaking(true);

  audio.onended = () => {
    if (session !== playbackSession) return;
    playNextClip(session, rate, fallbackText, opts);
  };

  audio.onerror = () => {
    if (session !== playbackSession) return;
    currentAudio = null;
    clipQueue = [];
    speakWithWebSpeech(fallbackText, opts);
  };

  audio.play().catch(() => {
    if (session !== playbackSession) return;
    currentAudio = null;
    clipQueue = [];
    notifySpeaking(false);
    flushPlaybackEnd();
  });
}

function speakWithWebSpeech(text: string, opts: SpeakOptions): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    flushPlaybackEnd();
    return;
  }
  const cleanText = formatSpeechText(text);
  if (!cleanText) {
    flushPlaybackEnd();
    return;
  }

  const runSpeak = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = getSpeechRate(opts.speed, opts.ageLevel);
      utterance.pitch = 1.06;
      utterance.volume = getNormalizedVoiceVolume();
      const voice = resolveVoice(opts.voiceURI);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => notifySpeaking(true);
      utterance.onend = () => {
        notifySpeaking(false);
        flushPlaybackEnd();
      };
      utterance.onerror = () => {
        notifySpeaking(false);
        flushPlaybackEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      notifySpeaking(false);
      flushPlaybackEnd();
    }
  };

  if (opts.queue) {
    if (speakTimerId !== null) {
      window.setTimeout(runSpeak, 60);
    } else {
      runSpeak();
    }
    return;
  }

  if (speakTimerId !== null) {
    window.clearTimeout(speakTimerId);
    speakTimerId = null;
  }

  try {
    window.speechSynthesis.cancel();
    speakTimerId = window.setTimeout(() => {
      speakTimerId = null;
      runSpeak();
    }, 50);
  } catch {
    notifySpeaking(false);
  }
}

/**
 * Reproduz a narração de um texto em português usando os clipes MP3 neurais
 * pré-gerados e fazendo fallback para `speechSynthesis` apenas quando necessário.
 */
export function speak(text: string, options: SpeakOptions | boolean = true): void {
  const opts: SpeakOptions =
    typeof options === 'boolean' ? { enabled: options } : options;
  const enabled = opts.enabled ?? true;
  if (!enabled || typeof window === 'undefined') {
    opts.onEnd?.();
    return;
  }

  const clips = resolveAudioClips(text);
  if (clips && clips.length > 0) {
    const rate = getAudioPlaybackRate(opts.speed, opts.ageLevel);
    if (opts.queue && (currentAudio || clipQueue.length > 0)) {
      clipQueue.push(...clips);
      if (opts.onEnd) onPlaybackEnd = opts.onEnd;
      return;
    }

    stopSpeaking();
    onPlaybackEnd = opts.onEnd ?? null;
    const session = ++playbackSession;
    clipQueue = [...clips];
    playNextClip(session, rate, text, opts);
    return;
  }

  onPlaybackEnd = opts.onEnd ?? null;
  speakWithWebSpeech(text, opts);
}

/** Interrompe imediatamente qualquer clipe MP3 ou síntese de voz em andamento. */
export function stopSpeaking(): void {
  playbackSession += 1;
  onPlaybackEnd = null;
  clipQueue = [];
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio = null;
  }
  if (speakTimerId !== null) {
    window.clearTimeout(speakTimerId);
    speakTimerId = null;
  }
  notifySpeaking(false);
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
