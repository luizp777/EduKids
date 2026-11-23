import { describe, expect, it } from 'vitest';
import {
  getAudioPlaybackRate,
  getMasterVolume,
  getNormalizedVoiceVolume,
  resolveAudioClips,
  setMasterVolume,
} from './audio';
import { FIGURES, RHYME_PAIRS, STICKERS, TRACING_TEMPLATES } from '../data/catalog';
import {
  generateAnimalSoundQuestions,
  generateAssociationQuestions,
  generateCategoryIntruderQuestions,
  generateFinalLetterQuestions,
  generateInitialSyllableQuestions,
  generateLiteracyQuestions,
  generateMathQuestions,
  generateNumberQuantityQuestions,
  generateRhymeQuestions,
  generateShapeObjectQuestions,
  generateShareQuestions,
  generateSubtractionQuestions,
  generateSyllableQuestions,
  generateWordBuilderQuestions,
} from './gameGenerators';

describe('audio speech helpers', () => {
  it('computes neural MP3 playback rates for slow, normal, and fast speeds', () => {
    expect(getAudioPlaybackRate('slow', '3-4')).toBeLessThan(1);
    expect(getAudioPlaybackRate('normal', '3-4')).toBe(1);
    expect(getAudioPlaybackRate('normal', '5-6')).toBe(1);
    expect(getAudioPlaybackRate('fast', '5-6')).toBeGreaterThan(1);
  });

  it('resolves exercise prompts to complete natural neural MP3 clips', () => {
    expect(resolveAudioClips('Qual figura começa com a letra A?')).toEqual([
      'q-letra-inicial-a',
    ]);
    expect(resolveAudioClips('Qual letra falta na palavra abelha?')).toEqual([
      'q-letra-falta-abelha',
    ]);
    expect(resolveAudioClips('Vamos somar! Quanto é 2 mais 3?')).toEqual([
      'q-somar-2-3',
    ]);
    expect(resolveAudioClips('Tinha 5, saíram 2. Quantos ficaram?')).toEqual([
      'q-sub-5-2',
    ]);
    expect(resolveAudioClips('Use o dedinho para traçar o zigue-zague!')).toEqual([
      'q-tracar-zigue-zague',
    ]);
    expect(resolveAudioClips('Parabéns! Incrível! Você desenhou a letra A!')).toEqual([
      'cel-1',
      'ans-desenhou-letra-a',
    ]);
    expect(resolveAudioClips('Olá Explorador! Eu sou a Lumi! Escolha uma atividade divertida para brincar!')).toEqual([
      'lumi-home',
    ]);
    expect(resolveAudioClips('Abelha Zuzu')).toEqual(['stk-abelha']);
    expect(resolveAudioClips('Muito bem! Você acertou! A de abelha!')).toEqual([
      'cel-0',
      'ans-letra-de-abelha',
    ]);
    expect(resolveAudioClips('Parabéns! Incrível! 2 mais 3 é igual a 5!')).toEqual([
      'cel-1',
      'ans-somar-2-3',
    ]);
    expect(resolveAudioClips('Isso mesmo! Você brilhou! Ficaram 3!')).toEqual([
      'cel-2',
      'ans-ficaram-3',
    ]);
    expect(resolveAudioClips('Arrasou! Que esperteza! gato rima com pato!')).toEqual([
      'cel-3',
      'ans-rima-gato-pato',
    ]);
    expect(resolveAudioClips('Muito bem! Você acertou! bola tem 2 sílabas!')).toEqual([
      'cel-0',
      'ans-silabas-bola',
    ]);
    expect(resolveAudioClips('Parabéns! Incrível! Esse grupo tem 5, que é mais!')).toEqual([
      'cel-1',
      'ans-grupo-mais-5',
    ]);
    expect(resolveAudioClips('Muito bem! Você acertou! Forma laranja!')).toEqual([
      'cel-0',
      'ans-forma-cor-laranja',
    ]);
    expect(resolveAudioClips('Toque nas letras na ordem certa para montar a palavra sol!')).toEqual([
      'q-montar-sol',
    ]);
    expect(resolveAudioClips('Quem faz Miau, Miau?')).toEqual(['p-som-gato']);
    expect(resolveAudioClips('Quem combina com abelha?')).toEqual(['q-combinar-abelha']);
    expect(resolveAudioClips('Ganhou um abraço bem apertado! Qual rostinho combina com essa situação?')).toEqual([
      'emo-abraco',
    ]);
    expect(resolveAudioClips('Sol brilhando! Isso acontece de dia ou de noite?')).toEqual([
      'dn-full-sol',
    ]);
    expect(resolveAudioClips('Onde este bichinho mora? PEIXE!')).toEqual([
      'q-habitat-peixe',
    ]);
    expect(resolveAudioClips('Dia de Chuva! O que devemos usar neste clima?')).toEqual([
      'cli-full-chuva',
    ]);
    expect(resolveAudioClips('Muito bem! Você acertou! Isso! maçã!')).toEqual([
      'cel-0',
      'ans-isso-maca',
    ]);
    expect(resolveAudioClips('Parabéns! Incrível! Isso! peixe!')).toEqual([
      'cel-1',
      'ans-isso-peixe',
    ]);
  });

  it('covers 100% of figures, stickers, tracing templates, rhymes, and generators without robotic fallback', () => {
    for (const fig of FIGURES) {
      expect(resolveAudioClips(fig.name)).toBeTruthy();
      expect(resolveAudioClips(`Onde encontramos ${fig.name.toLowerCase()}?`)).toBeTruthy();
      expect(resolveAudioClips(`Com qual pedacinho começa a palavra ${fig.name.toLowerCase()}?`)).toBeTruthy();
    }
    for (const stk of STICKERS) {
      expect(resolveAudioClips(stk.name)).toBeTruthy();
    }
    for (const tr of TRACING_TEMPLATES) {
      expect(resolveAudioClips(`Use o dedinho para traçar ${tr.spokenName}!`)).toBeTruthy();
      expect(resolveAudioClips(`Você desenhou ${tr.spokenName}!`)).toBeTruthy();
    }
    for (const [a, b] of RHYME_PAIRS) {
      expect(resolveAudioClips(`${a} rima com ${b}!`)).toBeTruthy();
    }

    const allPrompts = [
      ...generateLiteracyQuestions('5-6', 10).map((q) => q.spokenPrompt),
      ...generateRhymeQuestions('5-6', 8).map((q) => q.spokenPrompt),
      ...generateSyllableQuestions('5-6', 10).map((q) => q.spokenPrompt),
      ...generateInitialSyllableQuestions('5-6', 10).map((q) => q.spokenPrompt),
      ...generateWordBuilderQuestions('5-6', 8).map((q) => q.spokenPrompt),
      ...generateMathQuestions('5-6', 10).map((q) => q.spokenPrompt),
      ...generateSubtractionQuestions('5-6', 8).map((q) => q.spokenPrompt),
      ...generateNumberQuantityQuestions('5-6', 8).map((q) => q.spokenPrompt),
      ...generateShapeObjectQuestions('5-6', 8).map((q) => q.spokenPrompt),
      ...generateAssociationQuestions('5-6', 10).map((q) => q.spokenPrompt),
      ...generateAnimalSoundQuestions('5-6', 9).map((q) => q.spokenPrompt),
      ...generateFinalLetterQuestions('5-6', 8).map((q) => q.spokenPrompt),
      ...generateShareQuestions('5-6', 6).map((q) => q.spokenPrompt),
      ...generateCategoryIntruderQuestions('5-6', 4).map((q) => q.spokenPrompt),
      'Ouça as batidas do tambor! Quantas batidas você ouviu?',
      'Hora da pausa! Você brincou muito bem hoje! Vamos descansar um pouquinho?',
      'O amigo caiu e ficou triste! Como podemos ajudar?',
      'Cada amigo ganha 3!',
      'bola fica na natureza ou devemos guardar?',
    ];

    for (const prompt of allPrompts) {
      expect(resolveAudioClips(prompt), `Missing clip for prompt: "${prompt}"`).not.toBeNull();
    }
  });

  it('normalizes master volume and clamps bounds consistently', () => {
    setMasterVolume(0.8);
    expect(getMasterVolume()).toBe(0.8);
    expect(getNormalizedVoiceVolume()).toBeCloseTo(0.68, 5);

    setMasterVolume(1.5);
    expect(getMasterVolume()).toBe(1);
    expect(getNormalizedVoiceVolume()).toBeCloseTo(0.85, 5);

    setMasterVolume(-0.2);
    expect(getMasterVolume()).toBe(0);
    expect(getNormalizedVoiceVolume()).toBe(0);

    // Restore default
    setMasterVolume(0.85);
  });
});
