import React from 'react';
import { ArrowLeft, Volume2, Star } from 'lucide-react';
import { useApp } from '../../state/AppContext';

/** Propriedades do componente `ActivityHeader`. */
interface ActivityHeaderProps {
  /** Título do pilar exibido no topo. */
  title: string;
  /** Índice da etapa atual (`0`-based). */
  currentStep: number;
  /** Total de etapas da rodada. */
  totalSteps: number;
  /** Saldo atual de estrelas do perfil. */
  stars: number;
  /** Callback para retornar à tela inicial. */
  onBack: () => void;
  /** Callback para repetir a instrução por voz. */
  onRepeatVoice: () => void;
  /** Cor de destaque da barra de progresso. */
  accentColor?: string;
}

/** Cabeçalho padronizado das atividades com botão de voltar, estrelas, repetir áudio e barra de progresso. */
export const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  title,
  currentStep,
  totalSteps,
  stars,
  onBack,
  onRepeatVoice,
  accentColor = '#6C5CE7',
}) => {
  const { isSpeaking } = useApp();
  const progressPct = Math.min(100, Math.round((currentStep / Math.max(1, totalSteps)) * 100));

  return (
    <header className="w-full max-w-5xl mx-auto flex flex-col gap-1.5 sm:gap-2.5 px-3 sm:px-5 pt-2.5 sm:pt-3.5 pb-1 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="btn-3d flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
          aria-label="Voltar ao início"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="flex-1 text-center min-w-0">
          <h1 className="font-display text-lg sm:text-2xl font-bold text-slate-800 truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 rounded-2xl bg-[#FFF3BF] border-2 border-[#FFCA3A] px-2.5 py-1 sm:px-3 sm:py-1.5 font-display text-sm sm:text-base font-bold text-[#A67800]">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-[#FFCA3A] text-[#E0A800]" />
            <span>{stars}</span>
          </div>

          <button
            type="button"
            onClick={onRepeatVoice}
            className={`btn-3d flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#6C5CE7] text-white hover:bg-[#5a4bd1] cursor-pointer ${
              isSpeaking ? 'animate-pulse ring-4 ring-purple-300' : ''
            }`}
            aria-label="Ouvir instrução novamente"
            title="Ouvir novamente"
          >
            <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 sm:h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(8, progressPct)}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
    </header>
  );
};
