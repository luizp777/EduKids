import React, { useState } from 'react';
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
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Crown,
  Lock,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { getPillarTier } from '../state/storage';
import { LUMI_ACCESSORIES, PILLARS, STICKERS } from '../data/catalog';
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
  const {
    state,
    activeProfile,
    recommendedPillar,
    dailyBonusClaimed,
    setActiveProfile,
    updateProfile,
    setLumiAccessory,
    updateAudio,
    say,
    sfx,
  } = useApp();
  const [showLumiWardrobe, setShowLumiWardrobe] = useState(false);

  const dailyPillarMeta = PILLARS.find((p) => p.id === recommendedPillar) || PILLARS[0];
  const DailyIcon = PILLAR_ICONS[dailyPillarMeta.id];

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
      <header className="max-w-6xl mx-auto px-2.5 sm:px-6 pt-3 sm:pt-5 pb-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Active Child Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white border-2 border-purple-200 pl-1 pr-2 sm:pl-1.5 sm:pr-3 py-1 shadow-sm min-w-0">
          <button
            type="button"
            onClick={handleSwitchProfile}
            className={`flex items-center gap-1.5 sm:gap-2 text-left min-w-0 ${
              state.profiles.length > 1 ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
            }`}
            title={state.profiles.length > 1 ? 'Trocar perfil' : activeProfile.name}
            aria-label={state.profiles.length > 1 ? 'Trocar perfil da criança' : activeProfile.name}
          >
            <AvatarSvg avatar={activeProfile.avatar} size={36} className="sm:w-10 sm:h-10 shrink-0" />
            <div className="font-display text-sm sm:text-lg font-bold text-slate-800 leading-tight truncate max-w-[78px] sm:max-w-none">
              {activeProfile.name}
            </div>
          </button>
          <button
            type="button"
            onClick={handleToggleAgeLevel}
            className="shrink-0 rounded-full bg-purple-100 hover:bg-purple-200 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-[#6C5CE7] cursor-pointer transition-colors"
            title="Alternar faixa etária (3–4 ou 5–6 anos)"
          >
            {activeProfile.ageLevel === '3-4' ? '3–4a' : '5–6a'}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 rounded-2xl bg-[#FFF3BF] border-2 border-[#FFCA3A] px-2 sm:px-3.5 py-1.5 sm:py-2 font-display text-sm sm:text-lg font-bold text-[#A67800]">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-[#FFCA3A] text-[#E0A800]" />
            <span>{activeProfile.stars}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              sfx('pop');
              onOpenAlbum();
            }}
            className="btn-3d flex items-center gap-1 sm:gap-1.5 rounded-2xl bg-[#FFCA3A] px-2 sm:px-3.5 py-1.5 sm:py-2 font-display text-xs sm:text-base font-bold text-[#5C4100] cursor-pointer"
            aria-label="Álbum de Figurinhas"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Álbum</span>
            <span className="text-[11px] sm:text-xs bg-white/60 rounded-full px-1.5 sm:px-2 py-0.5">
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
            className="btn-3d flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 text-slate-600 cursor-pointer"
            aria-label={state.audio.voiceEnabled ? 'Silenciar voz' : 'Ativar voz'}
            title={state.audio.voiceEnabled ? 'Voz ativa' : 'Voz desligada'}
          >
            {state.audio.voiceEnabled ? (
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#6C5CE7]" />
            ) : (
              <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onRequestParents}
            className="flex h-9 sm:h-auto items-center gap-1.5 rounded-2xl bg-white/80 border border-slate-300 px-2 sm:px-3 py-2 text-xs font-extrabold text-slate-500 hover:bg-white hover:text-slate-700 cursor-pointer"
            aria-label="Área dos Pais"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Pais</span>
          </button>
        </div>
      </header>

      {/* Hero Greeting with Lumi + Aventura do Dia */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 pb-4 sm:pb-6 flex flex-col lg:flex-row gap-3 sm:gap-4">
        <div className="flex-1 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-purple-100 p-4 sm:p-6 card-3d flex flex-col gap-3">
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={handleMascotTap}
              className="shrink-0 cursor-pointer"
              aria-label="Ouvir a Lumi"
            >
              <div className="sm:hidden">
                <LumiMascot mood="happy" accessory={activeProfile.lumiAccessory} size={72} />
              </div>
              <div className="hidden sm:block">
                <LumiMascot mood="happy" accessory={activeProfile.lumiAccessory} size={92} />
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#6C5CE7]">
                  EduKids • Brincar e Aprender
                </span>
                {(activeProfile.streakDays || 0) > 0 && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-extrabold text-orange-700"
                    title={`${activeProfile.streakDays} ${activeProfile.streakDays === 1 ? 'dia seguido' : 'dias seguidos'} brincando!`}
                  >
                    <Flame className="h-3 w-3 fill-orange-500 text-orange-600" />
                    {activeProfile.streakDays}d
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sfx('pop');
                    setShowLumiWardrobe((v) => !v);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-100 hover:bg-amber-200 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 cursor-pointer transition-colors"
                >
                  <Crown className="h-3 w-3" />
                  Vestir Lumi
                </button>
              </div>
              <h1
                onClick={handleMascotTap}
                className="mt-1 font-display text-xl sm:text-3xl font-bold text-slate-800 leading-tight cursor-pointer"
              >
                Oi, {activeProfile.name}! O que vamos aprender hoje?
              </h1>
              <p className="mt-1 text-xs sm:text-base font-bold text-slate-500">
                Toque em uma aventura abaixo ou toque na Lumi para ouvir!
              </p>
            </div>
          </div>

          {showLumiWardrobe && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-purple-100">
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
                    className={`shrink-0 flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-extrabold border-2 transition-colors ${
                      equipped
                        ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                        : unlocked
                          ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 cursor-pointer'
                          : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {!unlocked && <Lock className="h-3 w-3" />}
                    <span>{acc.name}</span>
                    {!unlocked && <span className="text-[10px]">({acc.minStars}★)</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            sfx('pop');
            onSelectPillar(dailyPillarMeta.id);
          }}
          className={`btn-3d lg:w-80 rounded-[28px] sm:rounded-[32px] bg-gradient-to-br ${dailyPillarMeta.bgGradient} border-4 border-white p-4 sm:p-5 text-left text-white cursor-pointer flex items-center lg:flex-col lg:items-start justify-between gap-3 shrink-0`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 shrink-0">
              <DailyIcon className="h-7 w-7 text-white stroke-[2.4]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  Aventura do Dia
                </span>
                {dailyBonusClaimed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/80 px-2 py-0.5 text-[11px] font-extrabold">
                    <CheckCircle2 className="h-3 w-3" />
                    Feito!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FFCA3A] text-[#5C4100] px-2 py-0.5 text-[11px] font-extrabold">
                    +2 ★
                  </span>
                )}
              </div>
              <div className="mt-1 font-display text-lg sm:text-xl font-bold leading-tight truncate">
                {dailyPillarMeta.title}
              </div>
            </div>
            <ChevronRight className="h-6 w-6 shrink-0 opacity-90 lg:hidden" />
          </div>
          <p className="hidden lg:block text-xs font-bold text-white/90">
            {dailyBonusClaimed
              ? 'Você já ganhou o bônus de hoje! Continue brincando!'
              : 'Complete uma rodada hoje para ganhar +2 estrelas bônus!'}
          </p>
        </button>
      </section>

      {/* 8 Activity Pillar Cards */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {PILLARS.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id];
            const stats = activeProfile.stats[pillar.id];
            const tier = getPillarTier(stats.completedRounds);
            const isDaily = pillar.id === recommendedPillar && !dailyBonusClaimed;
            const tierConfig =
              tier === 'gold'
                ? { label: 'Ouro', cls: 'bg-[#FFCA3A] text-[#5C4100]' }
                : tier === 'silver'
                  ? { label: 'Prata', cls: 'bg-slate-100 text-slate-700' }
                  : tier === 'bronze'
                    ? { label: 'Bronze', cls: 'bg-amber-700/80 text-amber-50' }
                    : null;
            const progressToNext = Math.min(100, Math.round((stats.completedRounds / 6) * 100));

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => {
                  sfx('pop');
                  onSelectPillar(pillar.id);
                }}
                className={`btn-3d group relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-br ${pillar.bgGradient} p-4 sm:p-6 text-left text-white border-4 ${
                  isDaily ? 'border-[#FFCA3A] ring-4 ring-[#FFCA3A]/40' : 'border-white/80'
                } cursor-pointer flex flex-col justify-between min-h-[148px] sm:min-h-[184px]`}
              >
                {/* Decorative bubble */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-white/15 transition-transform group-hover:scale-110" />

                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-xs shadow-inner">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white stroke-[2.4]" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {stats.starsEarned > 0 && (
                      <div className="flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 font-display text-xs sm:text-sm font-bold">
                        <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#FFCA3A] text-[#FFCA3A]" />
                        {stats.starsEarned}
                      </div>
                    )}
                    {tierConfig && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${tierConfig.cls}`}
                      >
                        <Award className="h-3 w-3" />
                        {tierConfig.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 relative z-10">
                  <h2 className="font-display text-lg sm:text-2xl font-bold drop-shadow-xs leading-tight">
                    {pillar.title}
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-white/90 line-clamp-2">
                    {pillar.subtitle}
                  </p>
                  {stats.completedRounds > 0 && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/25 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/90 transition-all duration-500"
                        style={{ width: `${Math.max(16, progressToNext)}%` }}
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
