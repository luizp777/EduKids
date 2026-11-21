import type { AgeLevel, VoiceSpeed } from '../types';
import { AUDIO_CLIP_IDS } from '../data/audioClips';

let audioCtx: AudioContext | null = null;
let audioUnlocked = false;

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

  const now = ctx.currentTime;

  const playTone = (
    freq: number,
    startOffset: number,
    duration: number,
    wave: OscillatorType = 'sine',
    volume = 0.16
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now + startOffset);
    gain.gain.setValueAtTime(0.001, now + startOffset);
    gain.gain.exponentialRampToValueAtTime(volume, now + startOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration + 0.02);
  };

  switch (type) {
    case 'pop':
      playTone(520, 0, 0.08, 'sine', 0.14);
      playTone(680, 0.03, 0.07, 'triangle', 0.1);
      break;
    case 'draw':
      playTone(760, 0, 0.05, 'sine', 0.06);
      break;
    case 'success':
      playTone(523.25, 0, 0.14, 'triangle', 0.18);
      playTone(659.25, 0.09, 0.14, 'triangle', 0.18);
      playTone(783.99, 0.18, 0.24, 'triangle', 0.2);
      break;
    case 'encourage':
      playTone(349.23, 0, 0.14, 'sine', 0.12);
      playTone(329.63, 0.11, 0.18, 'sine', 0.1);
      break;
    case 'celebration':
      playTone(523.25, 0, 0.12, 'triangle', 0.18);
      playTone(659.25, 0.1, 0.12, 'triangle', 0.18);
      playTone(783.99, 0.2, 0.14, 'triangle', 0.2);
      playTone(1046.5, 0.32, 0.36, 'triangle', 0.22);
      break;
  }
}

const VOWEL_PRONUNCIATION: Record<string, string> = {
  A: 'Á',
  E: 'É',
  I: 'Í',
  O: 'Ó',
  U: 'Ú',
};

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

export function getSpeechRate(speed: VoiceSpeed = 'normal', ageLevel: AgeLevel = '3-4'): number {
  if (speed === 'slow') return ageLevel === '3-4' ? 0.76 : 0.82;
  if (speed === 'fast') return 1.05;
  return ageLevel === '3-4' ? 0.86 : 0.94;
}

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

  return null;
}

const NATURAL_VOICE_RE = /google|natural|neural|luciana|francisca|thalita|maria|antonio/i;

export function getAvailablePtVoices(): SpeechSynthesisVoice[] {
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

function notifySpeaking(speaking: boolean) {
  for (const fn of listeners) fn(speaking);
}

export function subscribeSpeaking(fn: SpeakingListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export interface SpeakOptions {
  enabled?: boolean;
  speed?: VoiceSpeed;
  ageLevel?: AgeLevel;
  voiceURI?: string;
  queue?: boolean;
}

function playNextClip(session: number, rate: number, fallbackText: string, opts: SpeakOptions): void {
  if (session !== playbackSession) return;
  const nextId = clipQueue.shift();
  if (!nextId) {
    currentAudio = null;
    notifySpeaking(false);
    return;
  }

  const audio = new Audio(`/audio/pt-br/${nextId}.mp3`);
  audio.playbackRate = rate;
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
  });
}

function speakWithWebSpeech(text: string, opts: SpeakOptions): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const cleanText = formatSpeechText(text);
  if (!cleanText) return;

  const runSpeak = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = getSpeechRate(opts.speed, opts.ageLevel);
      utterance.pitch = 1.06;
      const voice = resolveVoice(opts.voiceURI);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => notifySpeaking(true);
      utterance.onend = () => notifySpeaking(false);
      utterance.onerror = () => notifySpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      notifySpeaking(false);
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
  if (!enabled || typeof window === 'undefined') return;

  const clips = resolveAudioClips(text);
  if (clips && clips.length > 0) {
    const rate = getAudioPlaybackRate(opts.speed, opts.ageLevel);
    if (opts.queue && (currentAudio || clipQueue.length > 0)) {
      clipQueue.push(...clips);
      return;
    }

    stopSpeaking();
    const session = ++playbackSession;
    clipQueue = [...clips];
    playNextClip(session, rate, text, opts);
    return;
  }

  speakWithWebSpeech(text, opts);
}

/** Interrompe imediatamente qualquer clipe MP3 ou síntese de voz em andamento. */
export function stopSpeaking(): void {
  playbackSession += 1;
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
