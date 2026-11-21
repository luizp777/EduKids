import React from 'react';
import {
  Star,
  Sparkles,
  Settings,
  Volume2,
  VolumeX,
  BookOpen,
  Calculator,
  Shapes,
  Puzzle,
  Pencil,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { PILLARS, STICKERS } from '../data/catalog';
import type { PillarId } from '../types';
import { LumiMascot } from '../components/illustrations/LumiMascot';
import { AvatarSvg } from '../components/illustrations/AvatarSvg';

interface HomePageProps {
  onSelectPillar: (pillar: PillarId) => void;
  onOpenAlbum: () => void;
  onRequestParents: () => void;
}

const PILLAR_ICONS: Record<PillarId, React.ComponentType<{ className?: string }>> = {
  literacy: BookOpen,
  math: Calculator,
  'shapes-colors': Shapes,
  'figures-logic': Puzzle,
  tracing: Pencil,
};

export const HomePage: React.FC<HomePageProps> = ({
  onSelectPillar,
  onOpenAlbum,
  onRequestParents,
}) => {
  const { state, activeProfile, updateAudio, say, sfx } = useApp();

  const handleMascotTap = () => {
    sfx('pop');
    say(
      `Olá ${activeProfile.name}! Eu sou a Lumi! Escolha uma atividade divertida para brincar!`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDE9FE] via-[#FFF9F0] to-[#FFF9F0] pb-12">
      {/* Top Bar */}
      <header className="max-w-5xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between gap-2 flex-wrap">
        {/* Active Child Pill */}
        <div className="flex items-center gap-2.5 rounded-full bg-white border-2 border-purple-200 pl-1.5 pr-4 py-1.5 shadow-sm">
          <AvatarSvg avatar={activeProfile.avatar} size={44} />
          <div>
            <div className="font-display text-base sm:text-lg font-bold text-slate-800 leading-tight">
              {activeProfile.name}
            </div>
            <div className="text-xs font-extrabold text-[#6C5CE7]">
              {activeProfile.ageLevel === '3-4' ? '3–4 anos' : '5–6 anos'}
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl bg-[#FFF3BF] border-2 border-[#FFCA3A] px-3.5 py-2 font-display text-lg font-bold text-[#A67800]">
            <Star className="h-5 w-5 fill-[#FFCA3A] text-[#E0A800]" />
            <span>{activeProfile.stars}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              sfx('pop');
              onOpenAlbum();
            }}
            className="btn-3d flex items-center gap-1.5 rounded-2xl bg-[#FFCA3A] px-3.5 py-2 font-display text-base font-bold text-[#5C4100] cursor-pointer"
            aria-label="Álbum de Figurinhas"
          >
            <Sparkles className="h-5 w-5" />
            <span className="hidden sm:inline">Álbum</span>
            <span className="text-xs bg-white/60 rounded-full px-2 py-0.5">
              {activeProfile.unlockedStickers.length}/{STICKERS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !state.audio.voiceEnabled;
              updateAudio({ voiceEnabled: next });
              if (next) say('Som ligado!');
            }}
            className="btn-3d flex h-11 w-11 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 text-slate-600 cursor-pointer"
            aria-label={state.audio.voiceEnabled ? 'Silenciar voz' : 'Ativar voz'}
            title={state.audio.voiceEnabled ? 'Voz ativa' : 'Voz desligada'}
          >
            {state.audio.voiceEnabled ? (
              <Volume2 className="h-5 w-5 text-[#6C5CE7]" />
            ) : (
              <VolumeX className="h-5 w-5 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onRequestParents}
            className="flex items-center gap-1.5 rounded-2xl bg-white/80 border border-slate-300 px-3 py-2 text-xs font-extrabold text-slate-500 hover:bg-white hover:text-slate-700 cursor-pointer"
            aria-label="Área dos Pais"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Pais</span>
          </button>
        </div>
      </header>

      {/* Hero Greeting with Lumi */}
      <section className="max-w-5xl mx-auto px-4 pt-4 pb-6">
        <button
          type="button"
          onClick={handleMascotTap}
          className="w-full rounded-[32px] bg-white border-4 border-purple-100 p-5 sm:p-6 card-3d flex items-center gap-4 sm:gap-6 text-left hover:border-purple-200 transition-colors cursor-pointer"
        >
          <LumiMascot mood="happy" size={96} />
          <div className="flex-1">
            <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#6C5CE7]">
              EduKids • Brincar e Aprender
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-4xl font-bold text-slate-800">
              Oi, {activeProfile.name}! O que vamos aprender hoje?
            </h1>
            <p className="mt-1 text-sm sm:text-base font-bold text-slate-500">
              Toque em uma aventura abaixo ou toque na Lumi para ouvir!
            </p>
          </div>
        </button>
      </section>

      {/* 5 Activity Pillar Cards */}
      <main className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id];
            const stats = activeProfile.stats[pillar.id];
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => {
                  sfx('pop');
                  onSelectPillar(pillar.id);
                }}
                className={`btn-3d group relative overflow-hidden rounded-[32px] bg-gradient-to-br ${pillar.bgGradient} p-6 text-left text-white border-4 border-white/80 cursor-pointer flex flex-col justify-between min-h-[176px]`}
              >
                {/* Decorative bubble */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 transition-transform group-hover:scale-110" />

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-xs shadow-inner">
                    <Icon className="h-9 w-9 text-white stroke-[2.4]" />
                  </div>
                  {stats.starsEarned > 0 && (
                    <div className="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 font-display text-sm font-bold">
                      <Star className="h-4 w-4 fill-[#FFCA3A] text-[#FFCA3A]" />
                      {stats.starsEarned}
                    </div>
                  )}
                </div>

                <div className="mt-4 relative z-10">
                  <h2 className="font-display text-2xl font-bold drop-shadow-xs">
                    {pillar.title}
                  </h2>
                  <p className="mt-0.5 text-sm font-bold text-white/90">
                    {pillar.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
