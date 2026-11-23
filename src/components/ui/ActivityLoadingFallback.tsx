import React from 'react';
import { useApp } from '../../state/AppContext';
import { LumiMascot } from '../illustrations/LumiMascot';

/** Tela leve de carregamento exibida enquanto um pilar ou página lazy está sendo carregado. */
export const ActivityLoadingFallback: React.FC = () => {
  const { activeProfile } = useApp();

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-dvh bg-gradient-to-b from-[#EDE9FE] via-[#FFF9F0] to-[#FFF9F0] flex flex-col items-center justify-center p-6 text-center gap-3"
    >
      <div className="animate-float">
        <LumiMascot mood="thinking" accessory={activeProfile.lumiAccessory} size={96} />
      </div>
      <p className="font-display text-xl sm:text-2xl font-bold text-[#6C5CE7]">
        Preparando a brincadeira...
      </p>
      <p className="text-sm font-bold text-slate-500">Só um segundinho!</p>
    </div>
  );
};
