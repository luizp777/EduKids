import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eraser, ChevronLeft, ChevronRight, Shapes, Type, Hash } from 'lucide-react';
import { useApp, type RoundReward } from '../../state/AppContext';
import { CELEBRATE_PHRASES, TRACING_TEMPLATES } from '../../data/catalog';
import { pickRandom } from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { LumiPromptBanner } from '../ui/LumiPromptBanner';

interface Props {
  onBack: () => void;
}

type TracingTab = 'caminho-forma' | 'letra' | 'numero';

const CRAYON_COLORS = [
  { name: 'Vermelho', hex: '#FF595E' },
  { name: 'Azul', hex: '#3A86FF' },
  { name: 'Verde', hex: '#52B788' },
  { name: 'Roxo', hex: '#8338EC' },
  { name: 'Laranja', hex: '#FF924C' },
];

/** Atividade de Traçado Mágico: Caminhos motores, formas geométricas, letras e números guiados por checkpoints. */
export const TracingActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, calmMode, isChallengeActive, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const challengeMode = isChallengeActive('tracing');
  const [tab, setTab] = useState<TracingTab>('caminho-forma');

  const templates = useMemo(() => {
    const byAge =
      activeProfile.ageLevel === '3-4' && !challengeMode
        ? TRACING_TEMPLATES.filter((t) => t.minLevel === '3-4')
        : TRACING_TEMPLATES;
    return byAge.filter((t) =>
      tab === 'caminho-forma'
        ? t.category === 'caminho' || t.category === 'forma'
        : t.category === tab
    );
  }, [activeProfile.ageLevel, challengeMode, tab]);

  const [templateIdx, setTemplateIdx] = useState(0);
  const [crayonColor, setCrayonColor] = useState(CRAYON_COLORS[0].hex);
  const [hitCheckpoints, setHitCheckpoints] = useState<number[]>([]);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [completedOne, setCompletedOne] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [reward, setReward] = useState<RoundReward | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hitRef = useRef<Set<number>>(new Set());
  const completedRef = useRef(false);
  const doneCountRef = useRef(0);
  const { schedule, clearAll } = useTimers();

  const safeIdx = templateIdx % Math.max(1, templates.length);
  const current = templates[safeIdx] || TRACING_TEMPLATES[0];
  const ROUND_TARGET = 3;

  useEffect(() => {
    if (current && !reward) {
      say(`Use o dedinho para traçar ${current.spokenName}!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIdx, tab]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hitRef.current = new Set();
    completedRef.current = false;
    setHitCheckpoints([]);
    setCompletedOne(false);
    setMood('happy');
  };

  const handleTabChange = (nextTab: TracingTab) => {
    sfx('pop');
    clearAll();
    setTab(nextTab);
    setTemplateIdx(0);
    clearCanvas();
  };

  const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const xPx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const yPx = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const xNorm = ((e.clientX - rect.left) / rect.width) * 100;
    const yNorm = ((e.clientY - rect.top) / rect.height) * 100;
    return { xPx, yPx, xNorm, yNorm };
  };

  const checkCheckpoints = (xNorm: number, yNorm: number) => {
    if (completedRef.current) return;
    const tolerance = activeProfile.ageLevel === '3-4' ? 17 : 14;
    let added = false;

    current.checkpoints.forEach((cp, idx) => {
      if (hitRef.current.has(idx)) return;
      const dist = Math.hypot(cp.x - xNorm, cp.y - yNorm);
      if (dist <= tolerance) {
        hitRef.current.add(idx);
        added = true;
      }
    });

    if (added) {
      const merged = Array.from(hitRef.current);
      setHitCheckpoints(merged);
      sfx('draw');

      const requiredCount = Math.ceil(current.checkpoints.length * 0.8);
      if (merged.length >= requiredCount) {
        completedRef.current = true;
        setCompletedOne(true);
        setMood('excited');
        sfx('success');
        recordCorrectAnswer('tracing');
        const praise = pickRandom(CELEBRATE_PHRASES);
        say(`${praise} Você desenhou ${current.spokenName}!`);

        doneCountRef.current += 1;
        const nextDone = doneCountRef.current;
        setDoneCount(nextDone);
        if (nextDone >= ROUND_TARGET) {
          schedule(() => {
            sfx('celebration');
            setReward(completeRound('tracing', 3));
          }, 950);
        }
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getNormalizedPoint(e);
    lastPointRef.current = { x: pt.xPx, y: pt.yPx };

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(pt.xPx, pt.yPx, 16.5, 0, Math.PI * 2);
      ctx.fillStyle = crayonColor;
      ctx.fill();
    }
    checkCheckpoints(pt.xNorm, pt.yNorm);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const pt = getNormalizedPoint(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(pt.xPx, pt.yPx);
      ctx.strokeStyle = crayonColor;
      ctx.lineWidth = 33;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    lastPointRef.current = { x: pt.xPx, y: pt.yPx };
    checkCheckpoints(pt.xNorm, pt.yNorm);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  /** Alternativa acessível via teclado (Enter/Espaço) para avançar e desenhar até o próximo checkpoint. */
  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (completedRef.current) return;
    const nextIdx = current.checkpoints.findIndex((_, i) => !hitRef.current.has(i));
    if (nextIdx === -1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const targetCp = current.checkpoints[nextIdx];
    if (canvas && ctx) {
      const toX = (targetCp.x / 100) * canvas.width;
      const toY = (targetCp.y / 100) * canvas.height;
      if (nextIdx > 0) {
        const prevCp = current.checkpoints[nextIdx - 1];
        const fromX = (prevCp.x / 100) * canvas.width;
        const fromY = (prevCp.y / 100) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = crayonColor;
        ctx.lineWidth = 33;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(toX, toY, 16.5, 0, Math.PI * 2);
        ctx.fillStyle = crayonColor;
        ctx.fill();
      }
    }
    checkCheckpoints(targetCp.x, targetCp.y);
  };

  const handlePrevTemplate = () => {
    sfx('pop');
    setTemplateIdx((i) => (i - 1 + templates.length) % templates.length);
    clearCanvas();
  };

  const handleNextTemplate = () => {
    sfx('pop');
    setTemplateIdx((i) => (i + 1) % templates.length);
    clearCanvas();
  };

  const handlePlayAgain = () => {
    clearAll();
    doneCountRef.current = 0;
    setDoneCount(0);
    setReward(null);
    setTemplateIdx((i) => (i + 1) % templates.length);
    clearCanvas();
  };

  return (
    <div className="activity-shell bg-gradient-to-b from-[#FFF6E5] to-[#FFF9F0]">
      <ActivityHeader
        title="Traçado Mágico"
        currentStep={doneCount}
        totalSteps={ROUND_TARGET}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(`Use o dedinho para traçar ${current.spokenName}!`)}
        accentColor="#FF9F43"
      />

      {/* Category Tabs */}
      <div className="activity-tabs activity-tabs-fade no-scrollbar snap-x">
        {[
          { id: 'caminho-forma' as TracingTab, label: 'Caminhos e Formas', icon: Shapes },
          { id: 'letra' as TracingTab, label: 'Letras', icon: Type },
          { id: 'numero' as TracingTab, label: 'Números', icon: Hash },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              handleTabChange(id);
            }}
            className={`btn-3d snap-start shrink-0 flex items-center gap-1.5 rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 font-display text-xs sm:text-base font-bold cursor-pointer ${
              tab === id
                ? 'bg-[#FF9F43] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.4]" />
            {label}
          </button>
        ))}
      </div>

      {/* Quick Template Pills: horizontal scroll on mobile */}
      <div className="activity-tabs-fade w-full max-w-3xl mx-auto flex items-center sm:justify-center gap-1.5 px-3 sm:px-4 pt-1 pb-1 overflow-x-auto no-scrollbar snap-x shrink-0">
        {templates.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={idx === safeIdx}
            onClick={(e) => {
              sfx('pop');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              setTemplateIdx(idx);
              clearCanvas();
            }}
            className={`snap-start shrink-0 min-h-[38px] min-w-[38px] rounded-xl px-3 py-1.5 font-display text-sm font-bold border-2 cursor-pointer transition-colors ${
              idx === safeIdx
                ? 'bg-[#FFF3BF] border-[#FF9F43] text-[#B85D00]'
                : 'bg-white/80 border-amber-100 text-slate-600 hover:bg-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="activity-stage">
        <LumiPromptBanner
          mood={mood}
          text={
            completedOne
              ? `Incrível! Você traçou ${current.spokenName}!`
              : `Trace ${current.spokenName} seguindo as bolinhas!`
          }
          borderClass="border-amber-100"
          badge={current.label}
          onTap={() => say(`Use o dedinho para traçar ${current.spokenName}!`)}
        />

        <div className="activity-split">
          {/* Drawing Board */}
          <div className="board-fluid relative rounded-[32px] sm:rounded-[36px] bg-white border-4 border-amber-200 card-3d overflow-hidden shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <path
                d={current.svgPath}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={current.svgPath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2.2"
                strokeDasharray="3.5 3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Animated guide dot showing tracing direction before the child starts */}
              {hitCheckpoints.length === 0 && !completedOne && !calmMode && (
                <circle r="4.5" fill="#FF9F43" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.9">
                  <animateMotion dur="3.4s" repeatCount="indefinite" path={current.svgPath} />
                </circle>
              )}
              {(() => {
                const nextTargetIdx = current.checkpoints.findIndex(
                  (_, i) => !hitCheckpoints.includes(i)
                );
                return current.checkpoints.map((cp, idx) => {
                  const hit = hitCheckpoints.includes(idx);
                  const isNext = idx === nextTargetIdx && !completedOne;
                  return (
                    <g key={idx}>
                      {isNext && (
                        <>
                          <circle
                            cx={cp.x}
                            cy={cp.y}
                            r={8}
                            fill="#FF6B6B"
                            opacity="0.2"
                            className="animate-pulse"
                          />
                          <circle
                            cx={cp.x}
                            cy={cp.y}
                            r={6.6}
                            fill="none"
                            stroke="#FF6B6B"
                            strokeWidth="1.6"
                            opacity="0.85"
                          />
                        </>
                      )}
                      <circle
                        cx={cp.x}
                        cy={cp.y}
                        r={hit ? 4.2 : isNext ? 5.2 : 3.4}
                        fill={hit ? '#52B788' : isNext ? '#FF6B6B' : '#FFCA3A'}
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                      />
                      {isNext && (
                        <text
                          x={cp.x}
                          y={cp.y + 1.8}
                          textAnchor="middle"
                          fontSize="5.2"
                          fontWeight="800"
                          fill="#FFFFFF"
                        >
                          {idx + 1}
                        </text>
                      )}
                    </g>
                  );
                });
              })()}
            </svg>

            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              tabIndex={0}
              role="application"
              aria-label={`Área de traçado para ${current.spokenName}. Pressione Espaço ou Enter para traçar ponto a ponto (${hitCheckpoints.length} de ${current.checkpoints.length}).`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleCanvasKeyDown}
              style={{ touchAction: 'none' }}
              className="relative z-10 h-full w-full cursor-crosshair focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#FF9F43]"
            />
          </div>

          {/* Crayon Palette + Actions */}
          <div className="flex flex-wrap lg:flex-col items-center justify-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 rounded-3xl bg-white p-2 sm:p-2.5 border-2 border-amber-100 shadow-sm">
              {CRAYON_COLORS.map((c) => {
                const selected = crayonColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      sfx('pop');
                      setCrayonColor(c.hex);
                    }}
                    aria-label={`Cor ${c.name}`}
                    aria-pressed={selected}
                    title={c.name}
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-4 transition-transform cursor-pointer ${
                      selected ? 'scale-110 border-slate-800 shadow-md ring-2 ring-white' : 'border-white'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selected && <span className="h-3 w-3 rounded-full bg-white shadow-xs" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevTemplate}
                aria-label="Modelo anterior"
                className="btn-3d flex h-11 items-center gap-1 rounded-2xl bg-white border-2 border-amber-200 px-3 sm:px-4 font-display text-sm sm:text-base font-bold text-amber-800 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx('pop');
                  clearCanvas();
                }}
                className="btn-3d flex h-11 items-center gap-1.5 rounded-2xl bg-white border-2 border-slate-200 px-3.5 sm:px-4 font-display text-sm sm:text-base font-bold text-slate-700 cursor-pointer"
              >
                <Eraser className="h-4 w-4 sm:h-5 sm:w-5" />
                Limpar
              </button>

              <button
                type="button"
                onClick={handleNextTemplate}
                className="btn-3d flex h-11 items-center gap-1 rounded-2xl bg-[#FF9F43] px-4 sm:px-5 font-display text-sm sm:text-base font-bold text-white cursor-pointer"
              >
                Próximo
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {reward && (
        <CelebrationModal
          starsAwarded={reward.starsAwarded}
          newStickerId={reward.newStickerId}
          newGoldenStickerId={reward.newGoldenStickerId}
          onPlayAgain={handlePlayAgain}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
