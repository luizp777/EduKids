import { useCallback, useState } from 'react';
import { ENCOURAGE_PHRASES } from '../data/catalog';
import type { RoundReward } from '../state/AppContext';
import type { MascotMood } from '../types';
import { pickRandom } from './gameGenerators';
import { useTimers } from './useTimers';

/** Opções de áudio fornecidas ao hook `useActivityFeedback`. */
interface UseActivityFeedbackOptions {
  /** Função de narração da Lumi (`useApp().say`). */
  say: (text: string) => void;
  /** Função de efeitos sonoros (`useApp().sfx`). */
  sfx: (type: 'pop' | 'success' | 'encourage' | 'celebration' | 'draw') => void;
}

/**
 * Gerencia o estado padronizado de feedback, dica gentil, bloqueio e recompensa
 * compartilhado pelos módulos de atividades interativas do EduKids.
 */
export function useActivityFeedback({ say, sfx }: UseActivityFeedbackOptions) {
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [manualHint, setManualHint] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState<RoundReward | null>(null);
  const { schedule, clearAll } = useTimers();

  const showHint = (wrongAttempts >= 2 || manualHint) && !locked;

  const resetFeedbackState = useCallback(() => {
    clearAll();
    setMood('happy');
    setFeedback('');
    setWrongId(null);
    setWrongAttempts(0);
    setManualHint(false);
    setLocked(false);
    setReward(null);
  }, [clearAll]);

  const clearStepFeedback = useCallback(() => {
    setMood('happy');
    setFeedback('');
    setWrongAttempts(0);
    setManualHint(false);
    setLocked(false);
  }, []);

  const requestManualHint = useCallback(() => {
    sfx('pop');
    setManualHint(true);
  }, [sfx]);

  const triggerWrongFeedback = useCallback(
    (id: string, customFeedback?: string) => {
      sfx('encourage');
      setMood('encouraging');
      setWrongId(id);
      setWrongAttempts((c) => c + 1);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(customFeedback ?? phrase);
      say(phrase);
      schedule(() => setWrongId(null), 480);
    },
    [say, schedule, sfx]
  );

  return {
    mood,
    setMood,
    feedback,
    setFeedback,
    wrongId,
    setWrongId,
    wrongAttempts,
    setWrongAttempts,
    manualHint,
    setManualHint,
    locked,
    setLocked,
    reward,
    setReward,
    showHint,
    schedule,
    clearAll,
    resetFeedbackState,
    clearStepFeedback,
    requestManualHint,
    triggerWrongFeedback,
  };
}
