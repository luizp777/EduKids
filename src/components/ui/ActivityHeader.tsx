import React from 'react';
import { ArrowLeft, Volume2, Star } from 'lucide-react';
import { useApp } from '../../state/AppContext';

interface ActivityHeaderProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  stars: number;
  onBack: () => void;
  onRepeatVoice: () => void;
  accentColor?: string;
}

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
    <header className="w-full max-w-3xl mx-auto flex flex-col gap-3 px-4 pt-4 pb-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="btn-3d flex h-13 w-13 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          aria-label="Voltar ao início"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>

        <div className="flex-1 text-center">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-800 truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl bg-[#FFF3BF] border-2 border-[#FFCA3A] px-3 py-2 font-display font-bold text-[#A67800]">
            <Star className="h-5 w-5 fill-[#FFCA3A] text-[#E0A800]" />
            <span>{stars}</span>
          </div>

          <button
            type="button"
            onClick={onRepeatVoice}
            className={`btn-3d flex h-13 w-13 items-center justify-center rounded-2xl bg-[#6C5CE7] text-white hover:bg-[#5a4bd1] cursor-pointer ${
              isSpeaking ? 'animate-pulse ring-4 ring-purple-300' : ''
            }`}
            aria-label="Ouvir instrução novamente"
            title="Ouvir novamente"
          >
            <Volume2 className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5">
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
