import React from 'react';
import { ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { STICKERS } from '../data/catalog';
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

export const StickerAlbumPage: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, say, sfx } = useApp();
  const unlockedCount = activeProfile.unlockedStickers.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF6D6] to-[#FFF9F0] pb-10">
      <header className="max-w-4xl mx-auto px-4 pt-5 pb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            sfx('pop');
            onBack();
          }}
          className="btn-3d flex h-13 w-13 items-center justify-center rounded-2xl bg-white border-2 border-amber-200 text-slate-700 cursor-pointer"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>

        <div className="text-center flex-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#6C5CE7]">
            Álbum de Figurinhas
          </h1>
          <p className="text-sm font-bold text-slate-500">
            {unlockedCount} de {STICKERS.length} figurinhas desbloqueadas
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-[#FFCA3A] px-3.5 py-2 font-display font-bold text-[#5C4100] shadow-sm">
          <Sparkles className="h-5 w-5" />
          {unlockedCount}/{STICKERS.length}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 flex flex-col gap-6">
        {THEMES.map((theme) => {
          const items = STICKERS.filter((s) => s.theme === theme);
          return (
            <section
              key={theme}
              className="rounded-[32px] bg-white/90 border-2 border-amber-100 p-5 card-3d"
            >
              <h2 className="font-display text-xl font-bold text-slate-700 mb-4">
                {theme}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
    </div>
  );
};
