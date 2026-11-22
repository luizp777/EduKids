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
  Music,
  Smile,
  Trees,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { PILLARS, STICKERS } from '../data/catalog';
import type { PillarId } from '../types';
import { LumiMascot } from '../components/illustrations/LumiMascot';
import { AvatarSvg } from '../components/illustrations/AvatarSvg';

/** Propriedades da tela inicial `HomePage`. */
interface HomePageProps {
  /** Callback ao selecionar um dos 8 pilares pedagógicos. */
  onSelectPillar: (pillar: PillarId) => void;
  /** Callback para abrir o Álbum de Figurinhas. */
  onOpenAlbum: () => void;
  /** Callback para solicitar abertura da Área dos Pais via Parental Gate. */
  onRequestParents: () => void;
}

const PILLAR_ICONS: Record<PillarId, React.ComponentType<{ className?: string }>> = {
  literacy: BookOpen,
  math: Calculator,
  'shapes-colors': Shapes,
  'figures-logic': Puzzle,
  tracing: Pencil,
  'music-sounds': Music,
  'emotions-routine': Smile,
  'nature-habitats': Trees,
};

/** Tela inicial do EduKids com troca rápida de perfil/idade, acesso ao Álbum, Área dos Pais e os 8 pilares. */
export const HomePage: React.FC<HomePageProps> = ({
  onSelectPillar,
  onOpenAlbum,
  onRequestParents,
}) => {
  const { state, activeProfile, setActiveProfile, updateProfile, updateAudio, say, sfx } = useApp();

  const handleSwitchProfile = () => {
    if (state.profiles.length <= 1) return;
    sfx('pop');
    const idx = state.profiles.findIndex((p) => p.id === activeProfile.id);
    const next = state.profiles[(idx + 1) % state.profiles.length];
    setActiveProfile(next.id);
  };

  const handleToggleAgeLevel = (e: React.MouseEvent) => {
    e.stopPropagation();
    sfx('pop');
    const nextAge = activeProfile.ageLevel === '3-4' ? '5-6' : '3-4';
    updateProfile(activeProfile.id, { ageLevel: nextAge });
  };

  const handleMascotTap = () => {
    sfx('pop');
    say(
      `Olá ${activeProfile.name}! Eu sou a Lumi! Escolha uma atividade divertida para brincar!`
    );
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#EDE9FE] via-[#FFF9F0] to-[#FFF9F0] pb-10">
      {/* Top Bar */}
      <header className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-2 flex items-center justify-between gap-2 flex-wrap">
        {/* Active Child Pill */}
        <div className="flex items-center gap-2 rounded-full bg-white border-2 border-purple-200 pl-1.5 pr-3 py-1 shadow-sm">
          <button
            type="button"
            onClick={handleSwitchProfile}
            className={`flex items-center gap-2 text-left ${
              state.profiles.length > 1 ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
            }`}
            title={state.profiles.length > 1 ? 'Trocar perfil' : activeProfile.name}
            aria-label={state.profiles.length > 1 ? 'Trocar perfil da criança' : activeProfile.name}
          >
            <AvatarSvg avatar={activeProfile.avatar} size={40} />
            <div className="font-display text-sm sm:text-lg font-bold text-slate-800 leading-tight">
              {activeProfile.name}
            </div>
          </button>
          <button
            type="button"
            onClick={handleToggleAgeLevel}
            className="rounded-full bg-purple-100 hover:bg-purple-200 px-2.5 py-0.5 text-[11px] sm:text-xs font-extrabold text-[#6C5CE7] cursor-pointer transition-colors"
            title="Alternar faixa etária (3–4 ou 5–6 anos)"
          >
            {activeProfile.ageLevel === '3-4' ? '3–4 anos' : '5–6 anos'}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 rounded-2xl bg-[#FFF3BF] border-2 border-[#FFCA3A] px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-display text-base sm:text-lg font-bold text-[#A67800]">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-[#FFCA3A] text-[#E0A800]" />
            <span>{activeProfile.stars}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              sfx('pop');
              onOpenAlbum();
            }}
            className="btn-3d flex items-center gap-1.5 rounded-2xl bg-[#FFCA3A] px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-display text-sm sm:text-base font-bold text-[#5C4100] cursor-pointer"
            aria-label="Álbum de Figurinhas"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
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
            className="btn-3d flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 text-slate-600 cursor-pointer"
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
            className="flex items-center gap-1.5 rounded-2xl bg-white/80 border border-slate-300 px-2.5 sm:px-3 py-2 text-xs font-extrabold text-slate-500 hover:bg-white hover:text-slate-700 cursor-pointer"
            aria-label="Área dos Pais"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Pais</span>
          </button>
        </div>
      </header>

      {/* Hero Greeting with Lumi */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 pb-4 sm:pb-6">
        <button
          type="button"
          onClick={handleMascotTap}
          className="w-full rounded-[28px] sm:rounded-[32px] bg-white border-4 border-purple-100 p-4 sm:p-6 card-3d flex items-center gap-3 sm:gap-6 text-left hover:border-purple-200 transition-colors cursor-pointer"
        >
          <div className="shrink-0 sm:hidden">
            <LumiMascot mood="happy" size={72} />
          </div>
          <div className="hidden sm:block shrink-0">
            <LumiMascot mood="happy" size={96} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#6C5CE7]">
              EduKids • Brincar e Aprender
            </span>
            <h1 className="mt-1 font-display text-xl sm:text-3xl lg:text-4xl font-bold text-slate-800 leading-tight">
              Oi, {activeProfile.name}! O que vamos aprender hoje?
            </h1>
            <p className="mt-1 text-xs sm:text-base font-bold text-slate-500">
              Toque em uma aventura abaixo ou toque na Lumi para ouvir!
            </p>
          </div>
        </button>
      </section>

      {/* 8 Activity Pillar Cards */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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
                className={`btn-3d group relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-br ${pillar.bgGradient} p-4 sm:p-6 text-left text-white border-4 border-white/80 cursor-pointer flex flex-col justify-between min-h-[142px] sm:min-h-[176px]`}
              >
                {/* Decorative bubble */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-white/15 transition-transform group-hover:scale-110" />

                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-xs shadow-inner">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white stroke-[2.4]" />
                  </div>
                  {stats.starsEarned > 0 && (
                    <div className="flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 font-display text-xs sm:text-sm font-bold">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#FFCA3A] text-[#FFCA3A]" />
                      {stats.starsEarned}
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-4 relative z-10">
                  <h2 className="font-display text-lg sm:text-2xl font-bold drop-shadow-xs leading-tight">
                    {pillar.title}
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-white/90 line-clamp-2">
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
