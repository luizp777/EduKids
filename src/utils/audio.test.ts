import { describe, expect, it } from 'vitest';
import { formatSpeechText, getSpeechRate, resolveAudioClips } from './audio';

describe('audio speech helpers', () => {
  it('formats isolated vowels and math operators for clearer pt-BR pronunciation', () => {
    expect(formatSpeechText('Qual figura começa com a letra A?')).toBe(
      'Qual figura começa com a letra, Á?'
    );
    expect(formatSpeechText('Qual figura começa com a letra O?')).toBe(
      'Qual figura começa com a letra, Ó?'
    );
    expect(formatSpeechText('Quanto é 2 + 3 = 5?')).toBe(
      'Quanto é 2 mais 3 é igual a 5?'
    );
    expect(formatSpeechText('Quanto é 5 - 2 e 5-2?')).toBe(
      'Quanto é 5 menos 2 e 5 menos 2?'
    );
    expect(formatSpeechText('Use o dedinho para traçar o zigue-zague!')).toBe(
      'Use o dedinho para traçar o zigue-zague!'
    );
  });

  it('computes age-aware speech rates', () => {
    expect(getSpeechRate('slow', '3-4')).toBeLessThan(getSpeechRate('normal', '3-4'));
    expect(getSpeechRate('normal', '3-4')).toBeLessThan(getSpeechRate('normal', '5-6'));
    expect(getSpeechRate('fast', '5-6')).toBeGreaterThan(1);
  });

  it('resolves exercise prompts to pre-generated neural MP3 clips', () => {
    expect(resolveAudioClips('Qual figura começa com a letra A?')).toEqual([
      'p-letra-inicial',
      'letter-a',
    ]);
    expect(resolveAudioClips('Qual letra falta na palavra abelha?')).toEqual([
      'p-letra-falta',
      'fig-abelha',
    ]);
    expect(resolveAudioClips('Vamos somar! Quanto é 2 mais 3?')).toEqual([
      'p-somar',
      'num-2',
      'mais',
      'num-3',
    ]);
    expect(resolveAudioClips('Tinha 5, saíram 2. Quantos ficaram?')).toEqual([
      'p-tinha',
      'num-5',
      'sairam',
      'num-2',
      'quantos-ficaram',
    ]);
    expect(resolveAudioClips('Use o dedinho para traçar o zigue-zague!')).toEqual([
      'p-tracar',
      'tr-zigue-zague',
    ]);
    expect(resolveAudioClips('Parabéns! Incrível! Você desenhou a letra A!')).toEqual([
      'cel-1',
      'voce-desenhou',
      'tr-letra-a',
    ]);
    expect(resolveAudioClips('Olá Explorador! Eu sou a Lumi! Escolha uma atividade divertida para brincar!')).toEqual([
      'lumi-home',
    ]);
    expect(resolveAudioClips('Abelha Zuzu')).toEqual(['stk-abelha']);
    expect(resolveAudioClips('Muito bem! Você acertou! A de abelha!')).toEqual([
      'cel-0',
      'letter-a',
      'de',
      'fig-abelha',
    ]);
    expect(resolveAudioClips('Parabéns! Incrível! 2 mais 3 é igual a 5!')).toEqual([
      'cel-1',
      'num-2',
      'mais',
      'num-3',
      'igual-a',
      'num-5',
    ]);
    expect(resolveAudioClips('Isso mesmo! Você brilhou! Ficaram 3!')).toEqual([
      'cel-2',
      'ficaram',
      'num-3',
    ]);
    expect(resolveAudioClips('Arrasou! Que esperteza! gato rima com pato!')).toEqual([
      'cel-3',
      'fig-gato',
      'rima-com',
      'fig-pato',
    ]);
    expect(resolveAudioClips('Muito bem! Você acertou! bola tem 2 sílabas!')).toEqual([
      'cel-0',
      'fig-bola',
      'tem',
      'num-2',
      'silabas',
    ]);
    expect(resolveAudioClips('Parabéns! Incrível! Esse grupo tem 5, que é mais!')).toEqual([
      'cel-1',
      'esse-grupo-tem',
      'num-5',
      'que-e-mais',
    ]);
    expect(resolveAudioClips('Muito bem! Você acertou! Forma laranja!')).toEqual([
      'cel-0',
      'forma',
      'color-laranja',
    ]);
    expect(resolveAudioClips('Toque nas letras na ordem certa para montar a palavra sol!')).toEqual([
      'p-montar-palavra',
      'fig-sol',
    ]);
    expect(resolveAudioClips('Quem faz Miau, Miau?')).toEqual(['p-som-gato']);
    expect(resolveAudioClips('Quem combina com abelha?')).toEqual(['p-combinar', 'fig-abelha']);
    expect(resolveAudioClips('Ganhou um abraço bem apertado! Qual rostinho combina com essa situação?')).toEqual([
      'sit-abraco',
      'p-emocao',
    ]);
    expect(resolveAudioClips('Sol brilhando! Isso acontece de dia ou de noite?')).toEqual([
      'dn-sol',
      'p-dia-noite',
    ]);
    expect(resolveAudioClips('Onde este bichinho mora? PEIXE!')).toEqual([
      'p-habitat',
      'fig-peixe',
    ]);
    expect(resolveAudioClips('Dia de Chuva! O que devemos usar neste clima?')).toEqual([
      'cli-chuva',
      'p-clima',
    ]);
  });
});
