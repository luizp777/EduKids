import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Lock, X, Delete, Check } from 'lucide-react';
import { useModalFocusTrap } from '../../utils/useModalFocusTrap';

/** Propriedades do modal `ParentalGateModal`. */
interface ParentalGateModalProps {
  /** Callback executado quando o adulto resolve o desafio corretamente. */
  onSuccess: () => void;
  /** Callback executado ao fechar ou cancelar a verificação. */
  onCancel: () => void;
}

/** Modal de verificação adulta com teclado numérico integrado na tela (sem acionar teclado virtual mobile). */
export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [challenge] = useState(() => {
    const a = 3 + Math.floor(Math.random() * 6); // 3..8
    const b = 4 + Math.floor(Math.random() * 5); // 4..8
    return { a, b, answer: a * b };
  });

  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(dialogRef);

  const handleDigit = useCallback((digit: string) => {
    setError(false);
    setInput((prev) => (prev.length < 3 ? prev + digit : prev));
  }, []);

  const handleBackspace = useCallback(() => {
    setError(false);
    setInput((prev) => prev.slice(0, -1));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!input) return;
    if (Number(input) === challenge.answer) {
      onSuccess();
    } else {
      setError(true);
      setInput('');
    }
  }, [input, challenge.answer, onSuccess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, handleDigit, handleBackspace, handleConfirm]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Verificação da Área dos Pais"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="animate-pop-in relative w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-2 border-slate-200 outline-none"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800">Área dos Pais</h2>
            <p className="text-xs sm:text-sm text-slate-500">Confirme que você é um adulto</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-base font-bold text-slate-700">
            Quanto é{' '}
            <span className="font-display text-2xl text-indigo-600">
              {challenge.a} × {challenge.b}
            </span>
            ?
          </p>

          {/* Digital display */}
          <div
            aria-live="polite"
            className={`mt-2.5 flex h-14 items-center justify-center rounded-2xl border-2 font-display text-3xl font-bold tracking-wider ${
              error
                ? 'border-rose-400 bg-rose-50 text-rose-600 animate-gentle-shake'
                : 'border-indigo-200 bg-slate-50 text-slate-800'
            }`}
          >
            {input || <span className="text-slate-300">?</span>}
          </div>

          {error && (
            <p className="mt-1.5 text-xs font-bold text-rose-500">
              Ops! Tente novamente.
            </p>
          )}

          {/* On-screen Numeric Keypad */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="btn-3d flex h-12 items-center justify-center rounded-2xl bg-slate-100 hover:bg-indigo-50 border-2 border-slate-200 font-display text-2xl font-bold text-slate-800 cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Apagar"
              className="btn-3d flex h-12 items-center justify-center rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-700 cursor-pointer"
            >
              <Delete className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="btn-3d flex h-12 items-center justify-center rounded-2xl bg-slate-100 hover:bg-indigo-50 border-2 border-slate-200 font-display text-2xl font-bold text-slate-800 cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!input}
              aria-label="Confirmar resposta"
              className="btn-3d flex h-12 items-center justify-center rounded-2xl bg-[#6C5CE7] hover:bg-[#5a4bd1] text-white cursor-pointer disabled:opacity-45"
            >
              <Check className="h-6 w-6 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
