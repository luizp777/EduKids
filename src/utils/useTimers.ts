import { useCallback, useEffect, useRef } from 'react';

/**
 * Gerencia handles de `setTimeout` e limpa automaticamente todos os timers pendentes
 * ao desmontar o componente ou ao chamar `clearAll()`.
 */
export function useTimers() {
  const timersRef = useRef<number[]>([]);

  const clearAll = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => clearAll, [clearAll]);

  return { schedule, clearAll };
}
