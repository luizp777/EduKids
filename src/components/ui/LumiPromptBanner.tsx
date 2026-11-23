import React from 'react';
import { Volume2 } from 'lucide-react';
import type { MascotMood } from '../../types';
import { useApp } from '../../state/AppContext';
import { LumiMascot } from '../illustrations/LumiMascot';

/** Propriedades do banner de instrução `LumiPromptBanner`. */
interface LumiPromptBannerProps {
  /** Expressão atual da mascote Lumi. */
  mood: MascotMood;
  /** Texto do enunciado ou feedback exibido ao lado da mascote. */
  text: string;
  /** Classe Tailwind para a cor da borda do cartão. */
  borderClass?: string;
  /** Rótulo curto opcional exibido à direita (ex.: letra ou desenho atual). */
  badge?: string;
  /** Classe Tailwind para estilização do badge opcional. */
  badgeClass?: string;
  /** Callback acionado ao tocar no banner para repetir o áudio. */
  onTap?: () => void;
}

/** Banner compacto e clicável com a mascote Lumi exibindo o enunciado ou feedback da atividade. */
export const LumiPromptBanner: React.FC<LumiPromptBannerProps> = ({
  mood,
  text,
  borderClass = 'border-purple-100',
  badge,
  badgeClass = 'bg-amber-100 text-amber-700',
  onTap,
}) => {
  const { activeProfile, isSpeaking } = useApp();
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Ouvir a Lumi: ${text}`}
      className={`flex items-center gap-2.5 sm:gap-4 w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl px-3 py-2 sm:p-3.5 border-2 ${borderClass} card-3d text-left shrink-0 cursor-pointer`}
    >
      <div className="relative shrink-0">
        <div className="sm:hidden">
          <LumiMascot mood={mood} accessory={activeProfile.lumiAccessory} size={48} />
        </div>
        <div className="hidden sm:block">
          <LumiMascot mood={mood} accessory={activeProfile.lumiAccessory} size={66} />
        </div>
        {isSpeaking && (
          <span
            aria-hidden="true"
            className="lumi-speaking-badge absolute -right-1 -bottom-0.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#6C5CE7] text-white shadow-sm ring-2 ring-white"
          >
            <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </span>
        )}
      </div>
      <p
        aria-live="polite"
        aria-atomic="true"
        className="flex-1 font-display text-sm sm:text-xl font-bold text-slate-800 leading-snug line-clamp-2"
      >
        {text}
      </p>
      {badge && (
        <span
          className={`rounded-xl sm:rounded-2xl px-2.5 py-1 sm:px-3.5 sm:py-1.5 font-display text-base sm:text-2xl font-bold shrink-0 ${badgeClass}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
