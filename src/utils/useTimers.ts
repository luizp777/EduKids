import { useCallback, useEffect, useRef } from 'react';

/**
 * Manages setTimeout handles and clears all pending timers on unmount or explicit reset.
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
