import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, Lock, Volume2, X } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { FIGURES, STICKERS } from '../data/catalog';
import type { StickerItem } from '../types';
import { FigureSvg } from '../components/illustrations/FigureSvg';

interface Props {
  onBack: () => void;
}

const THEMES: Array<'Animais' | 'Espaço' | 'Natureza' | 'Frutas'> = [
  'Animais',
  'Espaço',
  'Natureza',
  'Frutas',
];

/** Álbum de Figurinhas organizado por temas, exibindo itens desbloqueados com cartão interativo de sílabas e narração. */
export const StickerAlbumPage: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, say, sfx } = useApp();
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);
  const unlockedCount = activeProfile.unlockedStickers.length;
  const selectedFigure = selectedSticker
    ? FIGURES.find((f) => f.id === selectedSticker.figureId) || null
    : null;

  useEffect(() => {
    if (!selectedSticker) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSticker(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSticker]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#FFF6D6] to-[#FFF9F0] pb-10">
      <header className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 pb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            sfx('pop');
            onBack();
          }}
          className="btn-3d flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white border-2 border-amber-200 text-slate-700 cursor-pointer shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>

        <div className="text-center flex-1 min-w-0">
          <h1 className="font-display text-xl sm:text-3xl font-bold text-[#6C5CE7] truncate">
            Álbum de Figurinhas
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500">
            {unlockedCount} de {STICKERS.length} figurinhas desbloqueadas
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-[#FFCA3A] px-3 py-1.5 sm:px-3.5 sm:py-2 font-display text-sm sm:text-base font-bold text-[#5C4100] shadow-sm shrink-0">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          {unlockedCount}/{STICKERS.length}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 flex flex-col gap-5">
        {THEMES.map((theme) => {
          const items = STICKERS.filter((s) => s.theme === theme);
          return (
            <section
              key={theme}
              className="rounded-[28px] sm:rounded-[32px] bg-white/90 border-2 border-amber-100 p-4 sm:p-5 card-3d"
            >
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-700 mb-3 sm:mb-4">
                {theme}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {items.map((sticker) => {
                  const unlocked = activeProfile.unlockedStickers.includes(sticker.id);
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => {
                        if (unlocked) {
                          sfx('success');
                          say(sticker.name);
                          setSelectedSticker(sticker);
                        } else {
                          sfx('pop');
                          say('Jogue mais atividades para ganhar esta figurinha!');
                        }
                      }}
                      className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-3xl p-4 border-4 cursor-pointer ${
                        unlocked
                          ? 'border-white shadow-md'
                          : 'bg-slate-100 border-dashed border-slate-300'
                      }`}
                      style={unlocked ? { backgroundColor: sticker.bgHex } : undefined}
                    >
                      <div className="relative">
                        <FigureSvg
                          figureId={sticker.figureId}
                          size={74}
                          silhouette={!unlocked}
                        />
                        {!unlocked && (
                          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-white">
                            <Lock className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-display text-sm font-bold text-center ${
                          unlocked ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {unlocked ? sticker.name : '???'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Interactive Sticker Pop-up Card */}
      {selectedSticker && selectedFigure && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes da figurinha ${selectedSticker.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedSticker(null)}
        >
          <div
            className="animate-pop-in relative w-full max-w-sm rounded-[32px] bg-[#FFF9F0] border-4 border-[#FFCA3A] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedSticker(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-amber-100 hover:text-slate-700 cursor-pointer"
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>

            <span className="inline-block rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-[#6C5CE7]">
              {selectedSticker.theme}
            </span>

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  sfx('pop');
                  say(selectedSticker.name);
                }}
                className="btn-3d flex h-36 w-36 items-center justify-center rounded-[32px] border-4 border-white shadow-lg cursor-pointer"
                style={{ backgroundColor: selectedSticker.bgHex }}
                aria-label={`Ouvir ${selectedSticker.name}`}
              >
                <FigureSvg figureId={selectedSticker.figureId} size={112} />
              </button>
            </div>

            <h2 className="mt-3 font-display text-2xl font-bold text-slate-800">
              {selectedSticker.name}
            </h2>

            {/* Initial Letter + Syllables */}
            <div className="mt-4 rounded-2xl bg-white border-2 border-amber-100 p-3.5 flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx('pop');
                    say(`${selectedFigure.letter} de ${selectedFigure.name.toLowerCase()}!`);
                  }}
                  className="btn-3d flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF6B6B] font-display text-2xl font-bold text-white cursor-pointer"
                  aria-label={`Letra ${selectedFigure.letter}`}
                >
                  {selectedFigure.letter}
                </button>
                <span className="font-display text-xl font-bold text-slate-700">
                  {selectedFigure.name}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {selectedFigure.syllables.map((syl, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl bg-amber-50 border-2 border-amber-200 px-2.5 py-0.5 font-display text-base font-bold text-amber-800"
                  >
                    {syl}
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-400">
                {selectedFigure.syllables.length}{' '}
                {selectedFigure.syllables.length === 1 ? 'sílaba' : 'sílabas'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sfx('pop');
                  say(selectedSticker.name);
                }}
                className="btn-3d flex items-center justify-center gap-1.5 rounded-2xl bg-[#6C5CE7] py-3 px-3 font-display text-sm font-bold text-white cursor-pointer"
              >
                <Volume2 className="h-4 w-4" />
                Ouvir Nome
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx('pop');
                  say(
                    `${selectedFigure.name.toLowerCase()} tem ${selectedFigure.syllables.length} ${
                      selectedFigure.syllables.length === 1 ? 'sílaba' : 'sílabas'
                    }!`
                  );
                }}
                className="btn-3d flex items-center justify-center gap-1.5 rounded-2xl bg-[#FFCA3A] py-3 px-3 font-display text-sm font-bold text-[#5C4100] cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Sílabas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
