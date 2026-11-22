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

/** Calcula o `playbackRate` dos clipes MP3 neurais por idade e velocidade selecionada. */
export function getAudioPlaybackRate(speed: VoiceSpeed = 'normal', _ageLevel: AgeLevel = '3-4'): number {
  if (speed === 'slow') return 0.9;
  if (speed === 'fast') return 1.12;
  return 1.0;
}

function slug(text: string): string {
  const s = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return s === 'arco-iris' ? 'arcoiris' : s;
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
  'quem faz au, au!': 'p-som-cachorro',
  'quem ruge forte: roar!': 'p-som-leao',
  'quem faz piu, piu?': 'p-som-passaro',
  'quem faz piu, piu!': 'p-som-passaro',
  'quem faz grrr, grrr?': 'p-som-urso',
  'quem faz grrr, grrr!': 'p-som-urso',
  'ouça o som! ele é grave como o elefante ou agudo como o passarinho?': 'p-grave-agudo-1',
  'ouça com atenção! esse som é grave ou agudo?': 'p-grave-agudo-2',
  'observe o quadro! qual figura está faltando?': 'p-matriz',
  'a florzinha está com sede! o que ajuda ela a crescer?': 'p-cuidar-agua',
  'a árvore precisa de luz e calor! quem ajuda?': 'p-cuidar-sol',
  'quem ajuda a levar o pólen de flor em flor?': 'p-cuidar-polen',
  'qual bichinho também mora e cuida do jardim?': 'p-cuidar-jardim',
  // Complete composite sentences for Emotions, Day/Night, Habits, Routine, Weather
  'ganhou um abraço bem apertado! qual rostinho combina com essa situação?': 'emo-abraco',
  'o sorvete caiu no chão! qual rostinho combina com essa situação?': 'emo-sorvete',
  'abriu um presente surpresa! qual rostinho combina com essa situação?': 'emo-presente',
  'hora de dormir na caminha! qual rostinho combina com essa situação?': 'emo-dormir',
  'respirar fundo olhando o jardim! qual rostinho combina com essa situação?': 'emo-jardim',
  'o brinquedo quebrou sem querer! qual rostinho combina com essa situação?': 'emo-quebrou',
  'brincar no parque com os amigos! qual rostinho combina com essa situação?': 'emo-parque',
  'o amigo foi embora mais cedo! qual rostinho combina com essa situação?': 'emo-amigo',
  'viu um arco-íris gigante no céu! qual rostinho combina com essa situação?': 'emo-arcoiris',
  'ouvir uma historinha calminha antes de dormir! qual rostinho combina com essa situação?': 'emo-historia',
  'sol brilhando! isso acontece de dia ou de noite?': 'dn-full-sol',
  'brincar com a bola! isso acontece de dia ou de noite?': 'dn-full-bola',
  'lua no céu! isso acontece de dia ou de noite?': 'dn-full-lua',
  'ver as estrelas! isso acontece de dia ou de noite?': 'dn-full-estrela',
  'passear no jardim! isso acontece de dia ou de noite?': 'dn-full-flor',
  'ver o arco-íris! isso acontece de dia ou de noite?': 'dn-full-arcoiris',
  'ouvir os passarinhos! isso acontece de dia ou de noite?': 'dn-full-passaro',
  'andar de carro ao passeio! isso acontece de dia ou de noite?': 'dn-full-carro',
  'ler historinha na cama! isso acontece de dia ou de noite?': 'dn-full-livro',
  'dormir com o ursinho! isso acontece de dia ou de noite?': 'dn-full-urso',
  'hora do lanchinho saudável! o que usamos para cuidar da nossa saúde?': 'hab-full-lanche',
  'vamos comer uma fruta gostosa! o que usamos para cuidar da nossa saúde?': 'hab-full-fruta',
  'lavar as mãos antes de comer! o que usamos para cuidar da nossa saúde?': 'hab-full-maos',
  'brincar ao ar livre faz bem! o que usamos para cuidar da nossa saúde?': 'hab-full-ar-livre',
  'comer frutas refrescantes no calor! o que usamos para cuidar da nossa saúde?': 'hab-full-melancia',
  'aprender e descansar com uma história! o que usamos para cuidar da nossa saúde?': 'hab-full-livro',
  'comer uvas docinhas no lanche! o que usamos para cuidar da nossa saúde?': 'hab-full-uva',
  'tomar café da manhã saudável! o que usamos para cuidar da nossa saúde?': 'hab-full-pao',
  'rotina da manhã: do começo ao fim! toque do primeiro ao último passo!': 'rt-manha',
  'rotina da noite: antes de dormir! toque do primeiro ao último passo!': 'rt-noite',
  'ciclo da florzinha no jardim! toque do primeiro ao último passo!': 'rt-flor',
  'dia de passeio feliz! toque do primeiro ao último passo!': 'rt-passeio',
  'dia de sol! o que devemos usar neste clima?': 'cli-full-sol',
  'dia de chuva! o que devemos usar neste clima?': 'cli-full-chuva',
  'passeio na ilha! o que devemos usar neste clima?': 'cli-full-ilha',
  'dia de arco-íris! o que devemos usar neste clima?': 'cli-full-arcoiris',
  'noite fresca! o que devemos usar neste clima?': 'cli-full-noite-fresca',
  'dia nublado! o que devemos usar neste clima?': 'cli-full-nublado',
  'noite estrelada! o que devemos usar neste clima?': 'cli-full-estrelada',
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

function resolveTracingClip(prefix: 'q-tracar' | 'ans-desenhou', spokenName: string): string | null {
  const s = slug(spokenName);
  let m = s.match(/^a-letra-([a-z])$/);
  if (m && AUDIO_CLIP_IDS.has(`${prefix}-letra-${m[1]}`)) return `${prefix}-letra-${m[1]}`;
  m = s.match(/^o-numero-(\d)$/);
  if (m && AUDIO_CLIP_IDS.has(`${prefix}-num-${m[1]}`)) return `${prefix}-num-${m[1]}`;
  const clean = s.replace(/^(a|o)-/, '');
  if (AUDIO_CLIP_IDS.has(`${prefix}-${clean}`)) return `${prefix}-${clean}`;
  return null;
}

/**
 * Mapeia textos de exercícios para os IDs de clipes MP3 neurais completos em `public/audio/pt-br/`.
 * Prioriza frases inteiras pré-geradas para manter entonação e prosódia naturais.
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

  // Split praise prefix + detail (e.g. "Parabéns! Incrível!" + "C de cachorro!")
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

  // Literacy full-sentence prompts
  let m = trimmed.match(/^Qual figura começa com a letra ([A-Z])\??$/i);
  if (m) {
    const id = `q-letra-inicial-${m[1].toLowerCase()}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Qual letra falta na palavra (.+?)\??$/i);
  if (m) {
    const id = `q-letra-falta-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Qual figura rima com (.+?)\??$/i);
  if (m) {
    const id = `q-rima-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Vamos bater palmas! Quantos pedacinhos tem a palavra (.+?)\??$/i);
  if (m) {
    const id = `q-silabas-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Com qual pedacinho começa a palavra (.+?)\??$/i);
  if (m) {
    const id = `q-silaba-inicial-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Toque nas letras na ordem certa para montar a palavra (.+?)!?$/i);
  if (m) {
    const id = `q-montar-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Quem combina com (.+?)\??$/i);
  if (m) {
    const id = `q-combinar-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^(.+?) parece com qual forma\??$/i);
  if (m) {
    const id = `q-parece-forma-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Onde encontramos (.+?)\??$/i);
  if (m) {
    const id = `q-onde-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Onde este bichinho mora\?\s*(.+?)!?$/i);
  if (m) {
    const id = `q-habitat-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  // Math full-sentence prompts
  m = trimmed.match(/^Vamos somar! Quanto é (\d+) mais (\d+)\??$/i);
  if (m) {
    const id = `q-somar-${m[1]}-${m[2]}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Tinha (\d+), saíram (\d+)\. Quantos ficaram\??$/i);
  if (m) {
    const id = `q-sub-${m[1]}-${m[2]}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Toque no grupo que tem (\d+) figuras?\!?$/i);
  if (m) {
    const id = `q-grupo-tem-${m[1]}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  // Shapes & Colors full-sentence prompts
  m = trimmed.match(/^Toque nas figuras da cor (.+?)!?$/i);
  if (m) {
    const id = `q-toque-cor-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Qual cor aparece quando misturamos (.+?) com (.+?)\??$/i);
  if (m) {
    const id = `q-mistura-${slug(m[1])}-${slug(m[2])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Isso!\s*(.+?)!?$/i);
  if (m) {
    const id = `ans-isso-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  // Figures & Logic full-sentence prompts
  m = trimmed.match(/^Par de (.+?)!?$/i);
  if (m) {
    const id = `ans-par-de-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^(.+?) pertence a qual grupo\??$/i);
  if (m) {
    const id = `q-pertence-grupo-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Toque em duas peças para trocar e montar:\s*(.+?)!?$/i);
  if (m) {
    const id = `q-puzzle-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Você montou (.+?)!?$/i);
  if (m) {
    const id = `ans-montou-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  // Tracing full-sentence prompts
  m = trimmed.match(/^Use o dedinho para traçar (.+?)!?$/i);
  if (m) {
    const id = resolveTracingClip('q-tracar', m[1]);
    if (id) return [id];
  }

  m = trimmed.match(/^Você desenhou (.+?)!?$/i);
  if (m) {
    const id = resolveTracingClip('ans-desenhou', m[1]);
    if (id) return [id];
  }

  // Post-praise details (full continuous sentences)
  m = trimmed.match(/^([A-Z]) de (.+?)!?$/i);
  if (m) {
    const id = `ans-letra-de-${slug(m[2])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^(\d+) mais (\d+) é igual a (\d+)!?$/i);
  if (m) {
    const id = `ans-somar-${m[1]}-${m[2]}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^São (\d+)!?$/i);
  if (m) {
    const id = `ans-sao-${m[1]}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Ficaram (\d+)!?$/i);
  if (m) {
    const id = `ans-ficaram-${m[1]}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^O número (\d+)!?$/i);
  if (m) {
    const id = `ans-o-numero-${m[1]}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^(.+?) rima com (.+?)!?$/i);
  if (m) {
    const id = `ans-rima-${slug(m[1])}-${slug(m[2])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^(.+?) tem (\d+) sílabas?!?$/i);
  if (m) {
    const id = `ans-silabas-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Esse grupo tem (\d+), que é (mais|menos)!?$/i);
  if (m) {
    const id = `ans-grupo-${m[2].toLowerCase()}-${m[1]}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  m = trimmed.match(/^Forma (.+?)!?$/i);
  if (m) {
    const id = `ans-forma-cor-${slug(m[1])}`;
    if (AUDIO_CLIP_IDS.has(id)) return [id];
  }

  return null;
}

type SpeakingListener = (speaking: boolean) => void;
const listeners = new Set<SpeakingListener>();
let currentAudio: HTMLAudioElement | null = null;
let preloadedAudio: HTMLAudioElement | null = null;
let clipQueue: string[] = [];
let playbackSession = 0;
let onPlaybackEnd: (() => void) | null = null;
let queueTimerId: number | null = null;

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
  /** Se `true`, enfileira após a fala atual em vez de interrompê-la. */
  queue?: boolean;
  /** Callback executado ao término da reprodução. */
  onEnd?: () => void;
}

function playNextClip(session: number, rate: number): void {
  if (session !== playbackSession) return;
  const nextId = clipQueue.shift();
  if (!nextId) {
    currentAudio = null;
    preloadedAudio = null;
    notifySpeaking(false);
    flushPlaybackEnd();
    return;
  }

  const audio =
    preloadedAudio && preloadedAudio.src.endsWith(`/${nextId}.mp3`)
      ? preloadedAudio
      : new Audio(`/audio/pt-br/${nextId}.mp3`);
  preloadedAudio = null;

  // Preload the next clip in parallel for gapless natural transitions
  if (clipQueue.length > 0) {
    const upcoming = new Audio(`/audio/pt-br/${clipQueue[0]}.mp3`);
    upcoming.preload = 'auto';
    preloadedAudio = upcoming;
  }

  audio.playbackRate = rate;
  audio.volume = getNormalizedVoiceVolume();
  currentAudio = audio;
  notifySpeaking(true);

  audio.onended = () => {
    if (session !== playbackSession) return;
    if (clipQueue.length > 0) {
      queueTimerId = window.setTimeout(() => {
        queueTimerId = null;
        playNextClip(session, rate);
      }, 85);
    } else {
      playNextClip(session, rate);
    }
  };

  audio.onerror = () => {
    if (session !== playbackSession) return;
    currentAudio = null;
    preloadedAudio = null;
    clipQueue = [];
    notifySpeaking(false);
    flushPlaybackEnd();
  };

  audio.play().catch(() => {
    if (session !== playbackSession) return;
    currentAudio = null;
    preloadedAudio = null;
    clipQueue = [];
    notifySpeaking(false);
    flushPlaybackEnd();
  });
}

/**
 * Reproduz a narração de um texto em português usando exclusivamente os clipes
 * MP3 neurais pré-gerados (`pt-BR-FranciscaNeural`), sem vozes robóticas.
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
    playNextClip(session, rate);
    return;
  }

  // No robotic speechSynthesis fallback: finish cleanly without speaking robotic voices
  notifySpeaking(false);
  opts.onEnd?.();
}

/** Interrompe imediatamente qualquer clipe MP3 em andamento. */
export function stopSpeaking(): void {
  playbackSession += 1;
  onPlaybackEnd = null;
  clipQueue = [];
  preloadedAudio = null;
  if (queueTimerId !== null) {
    window.clearTimeout(queueTimerId);
    queueTimerId = null;
  }
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio = null;
  }
  notifySpeaking(false);
}
