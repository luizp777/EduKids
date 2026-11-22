import React, { useMemo } from 'react';
import { Star, RotateCcw, Home, Sparkles } from 'lucide-react';
import { STICKERS } from '../../data/catalog';
import { FigureSvg } from '../illustrations/FigureSvg';
import { LumiMascot } from '../illustrations/LumiMascot';

/** Propriedades do modal de celebração `CelebrationModal`. */
interface CelebrationModalProps {
  /** Quantidade de estrelas ganhas ao concluir a rodada. */
  starsAwarded: number;
  /** ID da figurinha recém-desbloqueada, ou `null` quando não há nova figurinha. */
  newStickerId: string | null;
  /** Callback para iniciar uma nova rodada no mesmo modo. */
  onPlayAgain: () => void;
  /** Callback para retornar à tela inicial. */
  onGoHome: () => void;
}

const CONFETTI_COLORS = ['#FF595E', '#FFCA3A', '#6BCB77', '#4D96FF', '#9B5DE5', '#FF9F43'];

/** Modal de celebração ao final da rodada com confetes, estrelas ganhas e figurinha desbloqueada. */
export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  starsAwarded,
  newStickerId,
  onPlayAgain,
  onGoHome,
}) => {
  const sticker = STICKERS.find((s) => s.id === newStickerId) || null;

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 3.7) % 100}%`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: `${(i % 7) * 0.15}s`,
        duration: `${2.2 + (i % 4) * 0.45}s`,
        size: 10 + (i % 3) * 4,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-hidden">
      {/* Confetti */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {confettiPieces.map((p) => (
          <div
            key={p.id}
            className="animate-confetti absolute top-0 rounded-sm"
            style={{
              left: p.left,
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="animate-pop-in relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-[28px] sm:rounded-[32px] bg-[#FFF9F0] border-4 border-[#FFCA3A] p-5 sm:p-6 text-center shadow-2xl">
        <div className="flex justify-center -mt-2 sm:-mt-4 mb-1">
          <LumiMascot mood="excited" size={92} />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#6C5CE7]">
          Parabéns!
        </h2>
        <p className="mt-0.5 text-base sm:text-lg font-bold text-slate-600">
          Você completou a atividade!
        </p>

        {/* Stars earned */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FFF3BF] border-2 border-[#FFCA3A] px-4 py-1.5 sm:px-5 sm:py-2">
          {Array.from({ length: starsAwarded }).map((_, idx) => (
            <Star key={idx} className="h-6 w-6 sm:h-8 sm:w-8 fill-[#FFCA3A] text-[#E0A800]" />
          ))}
          <span className="font-display text-lg sm:text-xl font-bold text-[#A67800]">
            +{starsAwarded} estrelas!
          </span>
        </div>

        {/* New sticker unlocked */}
        {sticker && (
          <div className="mt-4 rounded-3xl bg-white border-2 border-purple-200 p-3 sm:p-4 shadow-sm">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#6C5CE7]">
              <Sparkles className="h-4 w-4" />
              Nova figurinha no seu álbum!
            </div>
            <div className="mt-2 flex flex-col items-center">
              <div
                className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border-4 border-white shadow-md"
                style={{ backgroundColor: sticker.bgHex }}
              >
                <FigureSvg figureId={sticker.figureId} size={66} />
              </div>
              <span className="mt-1.5 font-display text-base sm:text-lg font-bold text-slate-700">
                {sticker.name}
              </span>
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="btn-3d flex items-center justify-center gap-2 rounded-2xl bg-slate-200 px-3 py-3 sm:px-4 sm:py-4 font-display text-base sm:text-lg font-bold text-slate-700 hover:bg-slate-300 cursor-pointer"
          >
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
            Início
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-3d flex items-center justify-center gap-2 rounded-2xl bg-[#6BCB77] px-3 py-3 sm:px-4 sm:py-4 font-display text-base sm:text-lg font-bold text-white hover:bg-[#57ba64] cursor-pointer"
          >
            <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
            Jogar Mais
          </button>
        </div>
      </div>
    </div>
  );
};
