import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eraser, ChevronRight, Shapes, Type, Hash } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, TRACING_TEMPLATES } from '../../data/catalog';
import { pickRandom } from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { LumiMascot } from '../illustrations/LumiMascot';

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

export const TracingActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [tab, setTab] = useState<TracingTab>('caminho-forma');

  const templates = useMemo(() => {
    const byAge =
      activeProfile.ageLevel === '3-4'
        ? TRACING_TEMPLATES.filter((t) => t.minLevel === '3-4')
        : TRACING_TEMPLATES;
    return byAge.filter((t) =>
      tab === 'caminho-forma'
        ? t.category === 'caminho' || t.category === 'forma'
        : t.category === tab
    );
  }, [activeProfile.ageLevel, tab]);

  const [templateIdx, setTemplateIdx] = useState(0);
  const [crayonColor, setCrayonColor] = useState(CRAYON_COLORS[0].hex);
  const [hitCheckpoints, setHitCheckpoints] = useState<number[]>([]);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [completedOne, setCompletedOne] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [reward, setReward] = useState<{ starsAwarded: number; newStickerId: string | null } | null>(null);

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
      ctx.arc(pt.xPx, pt.yPx, 11, 0, Math.PI * 2);
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
      ctx.lineWidth = 22;
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF6E5] to-[#FFF9F0]">
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
      <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
        {[
          { id: 'caminho-forma' as TracingTab, label: 'Caminhos e Formas', icon: Shapes },
          { id: 'letra' as TracingTab, label: 'Letras', icon: Type },
          { id: 'numero' as TracingTab, label: 'Números', icon: Hash },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabChange(id)}
            className={`btn-3d flex items-center gap-1.5 rounded-2xl px-3.5 py-2 font-display text-sm sm:text-base font-bold cursor-pointer ${
              tab === id
                ? 'bg-[#FF9F43] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Quick Template Pills */}
      <div className="flex flex-wrap justify-center gap-1.5 px-4 pt-2 max-w-2xl mx-auto">
        {templates.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              sfx('pop');
              setTemplateIdx(idx);
              clearCanvas();
            }}
            className={`rounded-xl px-3 py-1 font-display text-sm font-bold border-2 cursor-pointer transition-colors ${
              idx === safeIdx
                ? 'bg-[#FFF3BF] border-[#FF9F43] text-[#B85D00]'
                : 'bg-white/80 border-amber-100 text-slate-600 hover:bg-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-3 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-3 w-full bg-white rounded-3xl p-3.5 border-2 border-amber-100 card-3d">
          <LumiMascot mood={mood} size={68} />
          <div className="flex-1">
            <p className="font-display text-lg sm:text-xl font-bold text-slate-800">
              {completedOne
                ? `Incrível! Você traçou ${current.spokenName}!`
                : `Trace ${current.spokenName} seguindo as bolinhas!`}
            </p>
          </div>
          <span className="rounded-2xl bg-amber-100 px-3.5 py-1.5 font-display text-xl sm:text-2xl font-bold text-amber-700">
            {current.label}
          </span>
        </div>

        {/* Drawing Board */}
        <div className="relative w-full max-w-[350px] aspect-square rounded-[36px] bg-white border-4 border-amber-200 card-3d overflow-hidden">
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
            {current.checkpoints.map((cp, idx) => {
              const hit = hitCheckpoints.includes(idx);
              return (
                <circle
                  key={idx}
                  cx={cp.x}
                  cy={cp.y}
                  r={hit ? 4.2 : 3.4}
                  fill={hit ? '#52B788' : '#FFCA3A'}
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
              );
            })}
          </svg>

          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }}
            className="relative z-10 h-full w-full cursor-crosshair"
          />
        </div>

        {/* Crayon Palette + Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <div className="flex items-center gap-2 rounded-3xl bg-white p-2.5 border-2 border-amber-100 shadow-sm">
            {CRAYON_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  sfx('pop');
                  setCrayonColor(c.hex);
                }}
                aria-label={`Cor ${c.name}`}
                className={`h-11 w-11 rounded-full border-4 transition-transform cursor-pointer ${
                  crayonColor === c.hex ? 'scale-115 border-slate-800 shadow-md' : 'border-white'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              sfx('pop');
              clearCanvas();
            }}
            className="btn-3d flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-200 px-4 py-3 font-display font-bold text-slate-700 cursor-pointer"
          >
            <Eraser className="h-5 w-5" />
            Limpar
          </button>

          <button
            type="button"
            onClick={handleNextTemplate}
            className="btn-3d flex items-center gap-1.5 rounded-2xl bg-[#FF9F43] px-5 py-3 font-display font-bold text-white cursor-pointer"
          >
            Próximo
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </main>

      {reward && (
        <CelebrationModal
          starsAwarded={reward.starsAwarded}
          newStickerId={reward.newStickerId}
          onPlayAgain={handlePlayAgain}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
