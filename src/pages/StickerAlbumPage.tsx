import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Lock,
  Volume2,
  X,
  Crown,
  Trophy,
  Star,
  Palette,
  Trash2,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { FIGURES, LUMI_ACCESSORIES, PAINT_DRAWINGS, PILLARS, STICKERS } from '../data/catalog';
import type { StickerItem, StickerTheme } from '../types';
import { FigureSvg } from '../components/illustrations/FigureSvg';
import { LumiMascot } from '../components/illustrations/LumiMascot';

interface Props {
  onBack: () => void;
}

const THEMES: StickerTheme[] = ['Animais', 'Espaço', 'Natureza', 'Frutas', 'Objetos e Amigos'];

/** Álbum de Figurinhas (36 itens + Douradas Brilhantes) e espaço Lumi, Troféus e Galeria de Pinturas. */
export const StickerAlbumPage: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, setLumiAccessory, deletePainting, say, sfx } = useApp();
  const [activeTab, setActiveTab] = useState<'stickers' | 'lumi-trophies'>('stickers');
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);

  const unlockedCount = activeProfile.unlockedStickers.length;
  const goldenIds = activeProfile.goldenStickers || [];
  const savedPaintings = activeProfile.savedPaintings || [];
  const selectedFigure = selectedSticker
    ? FIGURES.find((f) => f.id === selectedSticker.figureId) || null
    : null;
  const selectedIsGolden = selectedSticker ? goldenIds.includes(selectedSticker.id) : false;

  const totalRounds = PILLARS.reduce(
    (sum, p) => sum + (activeProfile.stats[p.id]?.completedRounds || 0),
    0
  );
  const pillarsPlayed = PILLARS.filter(
    (p) => (activeProfile.stats[p.id]?.completedRounds || 0) > 0
  ).length;

  const achievements = [
    {
      id: 'first-round',
      title: 'Primeira Aventura',
      desc: 'Conclua sua 1ª atividade',
      done: totalRounds >= 1,
    },
    {
      id: 'collector-10',
      title: 'Colecionador',
      desc: 'Desbloqueie 10 figurinhas',
      done: unlockedCount >= 10,
    },
    {
      id: 'all-pillars',
      title: 'Explorador Total',
      desc: 'Jogue todos os 8 pilares',
      done: pillarsPlayed >= PILLARS.length,
    },
    {
      id: 'streak-3',
      title: 'Chama Brilhante',
      desc: 'Brinque 3 dias seguidos',
      done: (activeProfile.streakDays || 0) >= 3,
    },
    {
      id: 'stars-50',
      title: 'Super Estrela',
      desc: 'Conquiste 50 estrelas',
      done: activeProfile.stars >= 50,
    },
    {
      id: 'artist',
      title: 'Artista Mágico',
      desc: 'Salve um desenho pintado',
      done: savedPaintings.length >= 1,
    },
    {
      id: 'full-album',
      title: 'Álbum Completo',
      desc: `Conquiste todas as ${STICKERS.length} figurinhas`,
      done: unlockedCount >= STICKERS.length,
    },
    {
      id: 'golden-master',
      title: 'Brilho Dourado',
      desc: 'Ganhe sua 1ª figurinha dourada',
      done: goldenIds.length >= 1,
    },
  ];

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
            Álbum &amp; Lumi
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500">
            {unlockedCount}/{STICKERS.length} figurinhas
            {goldenIds.length > 0 ? ` • ${goldenIds.length} douradas` : ''}
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-[#FFCA3A] px-3 py-1.5 sm:px-3.5 sm:py-2 font-display text-sm sm:text-base font-bold text-[#5C4100] shadow-sm shrink-0">
          <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-[#5C4100]" />
          {activeProfile.stars}
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 mb-4 flex items-center justify-center gap-2">
        <button
          type="button"
          aria-pressed={activeTab === 'stickers'}
          onClick={() => {
            sfx('pop');
            setActiveTab('stickers');
          }}
          className={`btn-3d flex items-center gap-1.5 rounded-2xl px-4 py-2 font-display text-sm sm:text-base font-bold cursor-pointer ${
            activeTab === 'stickers'
              ? 'bg-[#6C5CE7] text-white'
              : 'bg-white text-slate-600 border-2 border-amber-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Figurinhas ({unlockedCount}/{STICKERS.length})
        </button>
        <button
          type="button"
          aria-pressed={activeTab === 'lumi-trophies'}
          onClick={() => {
            sfx('pop');
            setActiveTab('lumi-trophies');
          }}
          className={`btn-3d flex items-center gap-1.5 rounded-2xl px-4 py-2 font-display text-sm sm:text-base font-bold cursor-pointer ${
            activeTab === 'lumi-trophies'
              ? 'bg-[#6C5CE7] text-white'
              : 'bg-white text-slate-600 border-2 border-amber-200'
          }`}
        >
          <Trophy className="h-4 w-4" />
          Lumi &amp; Troféus
        </button>
      </div>

      {activeTab === 'stickers' ? (
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
                    const isGolden = goldenIds.includes(sticker.id);
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
                        className={`btn-3d relative flex flex-col items-center justify-center gap-2 rounded-3xl p-4 border-4 cursor-pointer ${
                          isGolden
                            ? 'border-[#FFCA3A] golden-shimmer'
                            : unlocked
                              ? 'border-white shadow-md'
                              : 'bg-slate-100 border-dashed border-slate-300'
                        }`}
                        style={unlocked ? { backgroundColor: sticker.bgHex } : undefined}
                      >
                        {isGolden && (
                          <span
                            className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFCA3A] text-[#5C4100] shadow"
                            title="Figurinha Dourada Brilhante"
                          >
                            <Crown className="h-4 w-4" />
                          </span>
                        )}
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
      ) : (
        <main className="max-w-5xl mx-auto px-3 sm:px-6 flex flex-col gap-5">
          {/* Lumi Dressing Room */}
          <section className="rounded-[28px] sm:rounded-[32px] bg-white/95 border-2 border-purple-100 p-4 sm:p-6 card-3d">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex flex-col items-center rounded-3xl bg-purple-50 border-2 border-purple-200 p-4 shrink-0">
                <LumiMascot
                  mood="excited"
                  accessory={activeProfile.lumiAccessory}
                  size={110}
                />
                <span className="mt-1 font-display text-sm font-bold text-[#6C5CE7]">
                  Sua Lumi
                </span>
              </div>

              <div className="flex-1 w-full">
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-800">
                  Acessórios da Lumi
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-500 mb-3">
                  Acumule estrelas para desbloquear visuais mágicos (suas estrelas nunca são gastas!).
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {LUMI_ACCESSORIES.map((acc) => {
                    const unlocked = activeProfile.stars >= acc.minStars;
                    const equipped = (activeProfile.lumiAccessory || 'none') === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => {
                          sfx('success');
                          setLumiAccessory(acc.id);
                        }}
                        className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl p-3 border-3 text-center transition-colors ${
                          equipped
                            ? 'bg-[#6C5CE7] border-[#5243C7] text-white'
                            : unlocked
                              ? 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100 cursor-pointer'
                              : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-display text-sm font-bold">
                          {!unlocked && <Lock className="h-3.5 w-3.5" />}
                          {equipped && <Crown className="h-3.5 w-3.5" />}
                          <span>{acc.name}</span>
                        </div>
                        <span className="text-[11px] font-bold opacity-80">
                          {equipped
                            ? 'Equipado!'
                            : unlocked
                              ? 'Toque para vestir'
                              : `${acc.minStars} ★`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Achievements Mural */}
          <section className="rounded-[28px] sm:rounded-[32px] bg-white/95 border-2 border-amber-100 p-4 sm:p-6 card-3d">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Mural de Troféus
              </h2>
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-extrabold text-amber-800">
                {achievements.filter((a) => a.done).length}/{achievements.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`rounded-2xl p-3.5 border-2 flex flex-col items-center text-center gap-1.5 ${
                    ach.done
                      ? 'bg-gradient-to-b from-[#FFF9DB] to-white border-[#FFCA3A]'
                      : 'bg-slate-50 border-slate-200 opacity-65'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      ach.done ? 'bg-[#FFCA3A] text-[#5C4100]' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {ach.done ? <Trophy className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <div className="font-display text-sm font-bold text-slate-800 leading-tight">
                    {ach.title}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 leading-tight">
                    {ach.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Saved Paintings Gallery */}
          <section className="rounded-[28px] sm:rounded-[32px] bg-white/95 border-2 border-emerald-100 p-4 sm:p-6 card-3d">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Palette className="h-5 w-5 text-emerald-500" />
              Galeria de Pinturas Mágicas ({savedPaintings.length})
            </h2>
            {savedPaintings.length === 0 ? (
              <p className="text-sm font-bold text-slate-500">
                Pinte um desenho em <strong>Formas e Cores &gt; Pintar</strong> e toque em{' '}
                <em>Salvar no Álbum</em> para guardar suas obras de arte aqui!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {savedPaintings.map((painting) => {
                  const template = PAINT_DRAWINGS.find((d) => d.id === painting.drawingId);
                  if (!template) return null;
                  return (
                    <div
                      key={painting.id}
                      className="relative rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 p-3 flex flex-col items-center gap-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          sfx('pop');
                          deletePainting(painting.id);
                        }}
                        aria-label="Remover pintura"
                        className="absolute top-2 right-2 rounded-full p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <svg viewBox="0 0 100 100" className="h-24 w-24">
                        {template.parts.map((part) => (
                          <path
                            key={part.id}
                            d={part.d}
                            fill={painting.parts[part.id] || '#E2E8F0'}
                            stroke="#334155"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                          />
                        ))}
                      </svg>
                      <span className="font-display text-sm font-bold text-slate-700">
                        {painting.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

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
            className={`animate-pop-in relative w-full max-w-sm rounded-[32px] bg-[#FFF9F0] border-4 p-6 text-center shadow-2xl ${
              selectedIsGolden ? 'border-[#FFCA3A] golden-shimmer' : 'border-[#FFCA3A]'
            }`}
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

            <div className="flex items-center justify-center gap-1.5">
              <span className="inline-block rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-[#6C5CE7]">
                {selectedSticker.theme}
              </span>
              {selectedIsGolden && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFCA3A] px-2.5 py-0.5 text-xs font-extrabold uppercase text-[#5C4100]">
                  <Crown className="h-3 w-3" />
                  Dourada
                </span>
              )}
            </div>

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  sfx('pop');
                  say(selectedSticker.name);
                }}
                className={`btn-3d flex h-36 w-36 items-center justify-center rounded-[32px] border-4 shadow-lg cursor-pointer ${
                  selectedIsGolden ? 'border-[#FFCA3A]' : 'border-white'
                }`}
                style={{ backgroundColor: selectedSticker.bgHex }}
                aria-label={`Ouvir ${selectedSticker.name}`}
              >
                <FigureSvg figureId={selectedSticker.figureId} size={112} />
              </button>
            </div>

            <h2 className="mt-3 font-display text-2xl font-bold text-slate-800">
              {selectedSticker.name}
            </h2>

            {/* Initial Letter + Interactive Syllables */}
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
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sfx('pop');
                      say(selectedFigure.name);
                    }}
                    className="rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 px-2.5 py-0.5 font-display text-base font-bold text-amber-800 cursor-pointer"
                  >
                    {syl}
                  </button>
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
