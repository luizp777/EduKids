import React, { useMemo, useState } from 'react';
import { Lock, X } from 'lucide-react';

/** Propriedades do modal `ParentalGateModal`. */
interface ParentalGateModalProps {
  /** Callback executado quando o adulto resolve o desafio corretamente. */
  onSuccess: () => void;
  /** Callback executado ao fechar ou cancelar a verificação. */
  onCancel: () => void;
}

/** Modal de verificação adulta (multiplicação simples) que protege o acesso à Área dos Pais. */
export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  onSuccess,
  onCancel,
}) => {
  const challenge = useMemo(() => {
    const a = 3 + Math.floor(Math.random() * 6); // 3..8
    const b = 4 + Math.floor(Math.random() * 5); // 4..8
    return { a, b, answer: a * b };
  }, []);

  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(input.trim()) === challenge.answer) {
      onSuccess();
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="animate-pop-in relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-2 border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800">Área dos Pais</h2>
            <p className="text-sm text-slate-500">Confirme que você é um adulto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label className="block text-center text-base font-bold text-slate-700">
            Quanto é <span className="text-2xl text-indigo-600">{challenge.a} × {challenge.b}</span>?
          </label>

          <input
            type="number"
            inputMode="numeric"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Digite a resposta"
            autoFocus
            className="mt-3 w-full rounded-2xl border-2 border-slate-300 px-4 py-3 text-center text-2xl font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
          />

          {error && (
            <p className="mt-2 text-center text-sm font-bold text-rose-500">
              Ops! Tente novamente.
            </p>
          )}

          <button
            type="submit"
            className="btn-3d mt-4 w-full rounded-2xl bg-[#6C5CE7] py-3.5 font-display text-lg font-bold text-white hover:bg-[#5a4bd1] cursor-pointer"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};
