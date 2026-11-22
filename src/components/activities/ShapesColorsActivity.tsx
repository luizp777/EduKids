import React, { useEffect, useRef, useState } from 'react';
import { Shapes, Palette, Check, FlaskConical, Sparkles, Plus, Paintbrush, Search } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, COLORS, ENCOURAGE_PHRASES } from '../../data/catalog';
import {
  generateColorMixRounds,
  generateColorRound,
  generatePatternQuestions,
  generateShapeObjectQuestions,
  generateShapeRound,
  pickRandom,
  shuffle,
  type ColorMixRound,
  type ColorSortRound,
  type PatternQuestion,
  type ShapeObjectQuestion,
} from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { MascotMood, ShapeId, ShapeInfo } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { LumiPromptBanner } from '../ui/LumiPromptBanner';
import { ShapeSvg } from '../illustrations/ShapeSvg';
import { FigureSvg } from '../illustrations/FigureSvg';

interface Props {
  onBack: () => void;
}

type SubMode = 'shapes' | 'colors' | 'mix' | 'pattern' | 'paint' | 'shape-objects';

interface PaintDrawing {
  id: string;
  label: string;
  parts: { id: string; d: string; label: string }[];
}

const PAINT_DRAWINGS: PaintDrawing[] = [
  {
    id: 'casa',
    label: 'Casa',
    parts: [
      { id: 'telhado', label: 'Telhado', d: 'M 12 50 L 50 16 L 88 50 Z' },
      { id: 'parede', label: 'Parede', d: 'M 22 50 H 78 V 86 H 22 Z' },
      { id: 'porta', label: 'Porta', d: 'M 42 60 H 58 V 86 H 42 Z' },
      { id: 'janela', label: 'Janela', d: 'M 27 58 H 37 V 68 H 27 Z' },
    ],
  },
  {
    id: 'foguete',
    label: 'Foguete',
    parts: [
      { id: 'corpo', label: 'Corpo', d: 'M 50 12 C 68 28 68 58 62 74 H 38 C 32 58 32 28 50 12 Z' },
      { id: 'asa-e', label: 'Asa esquerda', d: 'M 36 72 L 20 84 L 28 58 Z' },
      { id: 'asa-d', label: 'Asa direita', d: 'M 64 72 L 80 84 L 72 58 Z' },
      { id: 'fogo', label: 'Fogo', d: 'M 42 74 L 50 94 L 58 74 Z' },
    ],
  },
  {
    id: 'borboleta',
    label: 'Borboleta',
    parts: [
      { id: 'asa-sup-e', label: 'Asa superior esquerda', d: 'M 46 46 C 22 14 10 38 24 54 C 32 60 44 54 46 46 Z' },
      { id: 'asa-sup-d', label: 'Asa superior direita', d: 'M 54 46 C 78 14 90 38 76 54 C 68 60 56 54 54 46 Z' },
      { id: 'asa-inf-e', label: 'Asa inferior esquerda', d: 'M 46 54 C 24 56 18 82 36 82 C 44 82 46 66 46 54 Z' },
      { id: 'asa-inf-d', label: 'Asa inferior direita', d: 'M 54 54 C 76 56 82 82 64 82 C 56 82 54 66 54 54 Z' },
      { id: 'corpo', label: 'Corpo', d: 'M 45 28 H 55 V 80 H 45 Z' },
    ],
  },
  {
    id: 'carro',
    label: 'Carro',
    parts: [
      { id: 'teto', label: 'Teto', d: 'M 28 50 L 36 28 H 64 L 72 50 Z' },
      { id: 'lataria', label: 'Lataria', d: 'M 14 50 H 86 V 72 H 14 Z' },
      { id: 'roda-e', label: 'Roda esquerda', d: 'M 22 72 A 10 10 0 1 0 42 72 A 10 10 0 1 0 22 72 Z' },
      { id: 'roda-d', label: 'Roda direita', d: 'M 58 72 A 10 10 0 1 0 78 72 A 10 10 0 1 0 58 72 Z' },
    ],
  },
  {
    id: 'flor',
    label: 'Flor',
    parts: [
      { id: 'petala-1', label: 'Pétala cima', d: 'M 50 12 A 12 12 0 1 0 50 36 A 12 12 0 1 0 50 12 Z' },
      { id: 'petala-2', label: 'Pétala esquerda', d: 'M 28 32 A 12 12 0 1 0 28 56 A 12 12 0 1 0 28 32 Z' },
      { id: 'petala-3', label: 'Pétala direita', d: 'M 72 32 A 12 12 0 1 0 72 56 A 12 12 0 1 0 72 32 Z' },
      { id: 'miolo', label: 'Miolo', d: 'M 50 34 A 12 12 0 1 0 50 58 A 12 12 0 1 0 50 34 Z' },
      { id: 'caule', label: 'Caule', d: 'M 46 58 H 54 V 88 H 46 Z' },
    ],
  },
  {
    id: 'barco',
    label: 'Barquinho',
    parts: [
      { id: 'vela-e', label: 'Vela esquerda', d: 'M 48 16 L 22 58 H 48 Z' },
      { id: 'vela-d', label: 'Vela direita', d: 'M 52 24 L 76 58 H 52 Z' },
      { id: 'casco', label: 'Casco', d: 'M 14 62 H 86 L 74 84 H 26 Z' },
    ],
  },
];

/** Atividade de Formas e Cores: Encaixar, Caça às Cores, Misturar, Padrões, Formas no Mundo e Pintar. */
export const ShapesColorsActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [subMode, setSubMode] = useState<SubMode>('shapes');
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [reward, setReward] = useState<{ starsAwarded: number; newStickerId: string | null } | null>(null);
  const { schedule, clearAll } = useTimers();

  // Shapes matching state
  const [shapes, setShapes] = useState<ShapeInfo[]>(() => generateShapeRound(activeProfile.ageLevel));
  const [shuffledPieces, setShuffledPieces] = useState<ShapeInfo[]>(() => shuffle(shapes));
  const [matchedShapes, setMatchedShapes] = useState<ShapeId[]>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeId | null>(null);
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ id: ShapeId; x: number; y: number } | null>(null);
  const slotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Color hunting state
  const [colorRound, setColorRound] = useState<ColorSortRound>(() =>
    generateColorRound(activeProfile.ageLevel)
  );
  const [foundColorIds, setFoundColorIds] = useState<string[]>([]);

  // Color mixing state
  const [mixRounds, setMixRounds] = useState<ColorMixRound[]>(() => generateColorMixRounds());
  const [mixStep, setMixStep] = useState(0);
  const [stepLocked, setStepLocked] = useState(false);

  // Pattern state
  const [patternQs, setPatternQs] = useState<PatternQuestion[]>(() =>
    generatePatternQuestions(activeProfile.ageLevel, 4)
  );
  const [patternStep, setPatternStep] = useState(0);

  // Shape objects state
  const [shapeObjQs, setShapeObjQs] = useState<ShapeObjectQuestion[]>(() =>
    generateShapeObjectQuestions(activeProfile.ageLevel, 4)
  );
  const [shapeObjStep, setShapeObjStep] = useState(0);

  // Paint state
  const [paintIdx, setPaintIdx] = useState(0);
  const [brushColor, setBrushColor] = useState(COLORS[0].hex);
  const [paintedParts, setPaintedParts] = useState<Record<string, string>>({});

  const currentPaint = PAINT_DRAWINGS[paintIdx % PAINT_DRAWINGS.length];

  const totalMatchesNeeded =
    subMode === 'shapes'
      ? shapes.length
      : subMode === 'colors'
        ? colorRound.items.filter((i) => i.isMatch).length
        : subMode === 'mix'
          ? mixRounds.length
          : subMode === 'paint'
            ? currentPaint.parts.length
            : subMode === 'shape-objects'
              ? shapeObjQs.length
              : patternQs.length;

  const currentMatches =
    subMode === 'shapes'
      ? matchedShapes.length
      : subMode === 'colors'
        ? foundColorIds.length
        : subMode === 'mix'
          ? mixStep
          : subMode === 'paint'
            ? Object.keys(paintedParts).length
            : subMode === 'shape-objects'
              ? shapeObjStep
              : patternStep;

  const getPrompt = () => {
    if (subMode === 'shapes') return 'Encaixe cada forma no seu lugar! Você pode arrastar ou tocar.';
    if (subMode === 'colors') return `Toque nas figuras da cor ${colorRound.targetColor.name}!`;
    if (subMode === 'mix') {
      const m = mixRounds[mixStep];
      return m ? `Qual cor aparece quando misturamos ${m.colorA.name} com ${m.colorB.name}?` : '';
    }
    if (subMode === 'paint') return 'Escolha uma cor e toque no desenho para pintar!';
    if (subMode === 'shape-objects') return shapeObjQs[shapeObjStep]?.spokenPrompt || '';
    return patternQs[patternStep]?.spokenPrompt || 'Qual forma vem depois?';
  };

  useEffect(() => {
    if (!reward) {
      say(getPrompt());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subMode, shapes, colorRound, mixStep, patternStep, shapeObjStep]);

  const resetSubMode = (next: SubMode) => {
    clearAll();
    setSubMode(next);
    setFeedback('');
    setMood('happy');
    setReward(null);
    setWrongTarget(null);
    setStepLocked(false);

    if (next === 'shapes') {
      const s = generateShapeRound(activeProfile.ageLevel);
      setShapes(s);
      setShuffledPieces(shuffle(s));
      setMatchedShapes([]);
      setSelectedShape(null);
    } else if (next === 'colors') {
      setColorRound(generateColorRound(activeProfile.ageLevel));
      setFoundColorIds([]);
    } else if (next === 'mix') {
      setMixRounds(generateColorMixRounds());
      setMixStep(0);
    } else if (next === 'paint') {
      setPaintedParts({});
      if (subMode === 'paint') {
        setPaintIdx((i) => (i + 1) % PAINT_DRAWINGS.length);
      }
    } else if (next === 'shape-objects') {
      setShapeObjQs(generateShapeObjectQuestions(activeProfile.ageLevel, 4));
      setShapeObjStep(0);
    } else {
      setPatternQs(generatePatternQuestions(activeProfile.ageLevel, 4));
      setPatternStep(0);
    }
  };

  const tryPlaceShape = (pieceId: ShapeId, targetSlotId: ShapeId) => {
    if (matchedShapes.includes(targetSlotId)) return;
    if (pieceId === targetSlotId) {
      const nextMatched = [...matchedShapes, pieceId];
      setMatchedShapes(nextMatched);
      setSelectedShape(null);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('shapes-colors');
      const shapeName = shapes.find((s) => s.id === pieceId)?.name || '';
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(`${praise} ${shapeName}!`);
      say(`${shapeName}!`);

      if (nextMatched.length >= shapes.length) {
        schedule(() => {
          sfx('celebration');
          setReward(completeRound('shapes-colors', 3));
        }, 700);
      }
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongTarget(targetSlotId);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongTarget(null), 480);
    }
  };

  const handlePointerDown = (shapeId: ShapeId, e: React.PointerEvent) => {
    if (matchedShapes.includes(shapeId)) return;
    sfx('pop');
    setSelectedShape(shapeId);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragPos({ id: shapeId, x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragPos) return;
    setDragPos({ ...dragPos, x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragPos) return;
    const droppedId = dragPos.id;
    const { clientX, clientY } = e;
    setDragPos(null);

    for (const s of shapes) {
      const el = slotRefs.current[s.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const pad = 24;
      if (
        clientX >= rect.left - pad &&
        clientX <= rect.right + pad &&
        clientY >= rect.top - pad &&
        clientY <= rect.bottom + pad
      ) {
        tryPlaceShape(droppedId, s.id);
        return;
      }
    }
  };

  const handleColorPick = (figId: string, isMatch: boolean, figName: string) => {
    if (foundColorIds.includes(figId)) return;
    if (isMatch) {
      const next = [...foundColorIds, figId];
      setFoundColorIds(next);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('shapes-colors');
      setFeedback(`Isso! ${figName} é ${colorRound.targetColor.name}!`);
      say(`Isso! ${figName}!`);
      if (next.length >= colorRound.items.filter((i) => i.isMatch).length) {
        schedule(() => {
          sfx('celebration');
          setReward(completeRound('shapes-colors', 3));
        }, 700);
      }
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongTarget(figId);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongTarget(null), 480);
    }
  };

  const handleMixPick = (colorId: string) => {
    if (stepLocked) return;
    const current = mixRounds[mixStep];
    if (colorId === current.result.id) {
      setStepLocked(true);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('shapes-colors');
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(`${praise} ${current.colorA.name} + ${current.colorB.name} = ${current.result.name}!`);
      say(`${praise} Forma ${current.result.name.toLowerCase()}!`);
      schedule(() => {
        if (mixStep + 1 >= mixRounds.length) {
          sfx('celebration');
          setReward(completeRound('shapes-colors', 3));
        } else {
          setMixStep((s) => s + 1);
          setMood('happy');
          setFeedback('');
          setStepLocked(false);
        }
      }, 1300);
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongTarget(colorId);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongTarget(null), 480);
    }
  };

  const handlePatternPick = (shapeId: ShapeId, shapeName: string) => {
    if (stepLocked) return;
    const current = patternQs[patternStep];
    if (shapeId === current.answer.id) {
      setStepLocked(true);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('shapes-colors');
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(`${praise} ${shapeName}!`);
      say(`${praise} ${shapeName}!`);
      schedule(() => {
        if (patternStep + 1 >= patternQs.length) {
          sfx('celebration');
          setReward(completeRound('shapes-colors', 3));
        } else {
          setPatternStep((s) => s + 1);
          setMood('happy');
          setFeedback('');
          setStepLocked(false);
        }
      }, 1200);
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongTarget(shapeId);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongTarget(null), 480);
    }
  };

  const currentMix = mixRounds[mixStep];
  const currentPattern = patternQs[patternStep];
  const currentShapeObj = shapeObjQs[shapeObjStep];

  return (
    <div className="activity-shell bg-gradient-to-b from-[#EEFCF2] to-[#FFF9F0]">
      <ActivityHeader
        title="Formas e Cores"
        currentStep={currentMatches}
        totalSteps={totalMatchesNeeded}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getPrompt())}
        accentColor="#52B788"
      />

      {/* Mode Switcher: horizontal scroll on phones, centered on tablet/laptop */}
      <div className="activity-tabs-fade w-full max-w-5xl mx-auto flex items-center sm:justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-1 pb-1 overflow-x-auto no-scrollbar snap-x shrink-0">
        {[
          { id: 'shapes' as SubMode, label: 'Encaixar', icon: Shapes },
          { id: 'colors' as SubMode, label: 'Cores', icon: Palette },
          { id: 'mix' as SubMode, label: 'Misturar', icon: FlaskConical },
          { id: 'pattern' as SubMode, label: 'Padrões', icon: Sparkles },
          { id: 'shape-objects' as SubMode, label: 'Formas no Mundo', icon: Search },
          { id: 'paint' as SubMode, label: 'Pintar', icon: Paintbrush },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={(e) => {
              sfx('pop');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              resetSubMode(id);
            }}
            className={`btn-3d snap-start shrink-0 flex items-center gap-1.5 rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 font-display text-xs sm:text-base font-bold cursor-pointer ${
              subMode === id
                ? 'bg-[#52B788] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {label}
          </button>
        ))}
      </div>

      <main className="activity-stage">
        <LumiPromptBanner
          mood={mood}
          text={feedback || getPrompt()}
          borderClass="border-emerald-100"
          badge={subMode === 'paint' ? currentPaint.label : undefined}
          badgeClass="bg-emerald-100 text-emerald-700"
          onTap={() => say(getPrompt())}
        />

        {subMode === 'shapes' && (
          <div className="w-full max-w-2xl flex flex-col gap-3 sm:gap-6">
            <div className="rounded-[26px] sm:rounded-[32px] bg-white/90 border-4 border-emerald-100 p-3.5 sm:p-5 card-3d">
              <p className="text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-600 mb-2 sm:mb-3">
                Encaixe aqui
              </p>
              <div
                className={`grid gap-2.5 sm:gap-4 ${
                  shapes.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
                }`}
              >
                {shapes.map((s) => {
                  const isMatched = matchedShapes.includes(s.id);
                  const isShaking = wrongTarget === s.id;
                  return (
                    <button
                      key={s.id}
                      ref={(el) => {
                        slotRefs.current[s.id] = el;
                      }}
                      type="button"
                      onClick={() => {
                        if (selectedShape) {
                          tryPlaceShape(selectedShape, s.id);
                        }
                      }}
                      className={`flex flex-col items-center justify-center gap-1 rounded-2xl sm:rounded-3xl p-2 sm:p-3 border-3 transition-all cursor-pointer ${
                        isMatched
                          ? 'bg-[#D3F9D8] border-[#52B788]'
                          : selectedShape
                            ? 'bg-emerald-50/70 border-dashed border-emerald-400 hover:bg-emerald-100'
                            : 'bg-slate-50 border-dashed border-slate-300'
                      } ${isShaking ? 'animate-gentle-shake border-amber-400' : ''}`}
                    >
                      <ShapeSvg shapeId={s.id} size={58} className="sm:w-[76px] sm:h-[76px]" silhouette={!isMatched} />
                      <span className="font-display text-xs sm:text-sm font-bold text-slate-600">
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`grid gap-2.5 sm:gap-4 ${
                shuffledPieces.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {shuffledPieces.map((s) => {
                const isMatched = matchedShapes.includes(s.id);
                const isSelected = selectedShape === s.id;
                return (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={isMatched ? -1 : 0}
                    aria-label={s.name}
                    onPointerDown={(e) => handlePointerDown(s.id, e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !isMatched) {
                        e.preventDefault();
                        sfx('pop');
                        setSelectedShape(s.id);
                      }
                    }}
                    style={{ touchAction: 'none' }}
                    className={`btn-3d flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border-4 select-none transition-all ${
                      isMatched
                        ? 'opacity-25 pointer-events-none bg-slate-100 border-slate-200'
                        : isSelected
                          ? 'bg-[#FFF3BF] border-[#FFCA3A] scale-105 cursor-grabbing'
                          : 'bg-white border-emerald-200 hover:border-emerald-400 cursor-grab'
                    }`}
                  >
                    <ShapeSvg shapeId={s.id} size={60} className="sm:w-[78px] sm:h-[78px]" />
                  </div>
                );
              })}
            </div>

            {dragPos && (
              <div
                className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 scale-110 drop-shadow-2xl"
                style={{ left: dragPos.x, top: dragPos.y }}
              >
                <ShapeSvg shapeId={dragPos.id} size={88} />
              </div>
            )}
          </div>
        )}

        {subMode === 'colors' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-5">
            <div
              className="flex items-center gap-2 rounded-full px-5 py-2 sm:px-7 sm:py-3 text-white shadow-lg border-4 border-white shrink-0"
              style={{ backgroundColor: colorRound.targetColor.hex }}
            >
              <span className="font-display text-xl sm:text-3xl font-bold drop-shadow">
                Cor {colorRound.targetColor.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 w-full">
              {colorRound.items.map(({ figure, isMatch }) => {
                const isFound = foundColorIds.includes(figure.id);
                const isShaking = wrongTarget === figure.id;
                return (
                  <button
                    key={figure.id}
                    type="button"
                    disabled={isFound}
                    onClick={() => handleColorPick(figure.id, isMatch, figure.name)}
                    className={`btn-3d relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border-4 cursor-pointer ${
                      isFound
                        ? 'bg-[#D3F9D8] border-[#52B788]'
                        : 'bg-white border-emerald-100 hover:border-emerald-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {isFound && (
                      <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#52B788] text-white">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </span>
                    )}
                    <FigureSvg figureId={figure.id} size={66} className="sm:w-[86px] sm:h-[86px]" />
                    <span className="font-display text-xs sm:text-base font-bold text-slate-700">
                      {figure.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {subMode === 'mix' && currentMix && (
          <div className="activity-split">
            <div className="flex items-center justify-center gap-2.5 sm:gap-5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-emerald-100 p-4 sm:p-6 card-3d w-full max-w-md">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-white shadow-md"
                  style={{ backgroundColor: currentMix.colorA.hex }}
                />
                <span className="font-display text-xs sm:text-sm font-bold text-slate-700">
                  {currentMix.colorA.name}
                </span>
              </div>

              <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 stroke-[3]" />

              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-white shadow-md"
                  style={{ backgroundColor: currentMix.colorB.hex }}
                />
                <span className="font-display text-xs sm:text-sm font-bold text-slate-700">
                  {currentMix.colorB.name}
                </span>
              </div>

              <span className="font-display text-2xl sm:text-3xl font-bold text-slate-400">=</span>

              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-4 border-dashed border-slate-300 shadow-inner"
                  style={stepLocked ? { backgroundColor: currentMix.result.hex, borderStyle: 'solid', borderColor: '#fff' } : undefined}
                >
                  {!stepLocked && (
                    <span className="font-display text-2xl sm:text-3xl font-bold text-slate-400">?</span>
                  )}
                </div>
                <span className="font-display text-xs sm:text-sm font-bold text-slate-700">
                  {stepLocked ? currentMix.result.name : 'Qual cor?'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-md">
              {currentMix.options.map((col) => {
                const isShaking = wrongTarget === col.id;
                const isRight = stepLocked && col.id === currentMix.result.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => handleMixPick(col.id)}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-emerald-100 hover:border-emerald-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <div
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-3 border-white shadow"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="font-display text-xs sm:text-base font-bold text-slate-700">
                      {col.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {subMode === 'pattern' && currentPattern && (
          <div className="activity-split">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-emerald-100 p-4 sm:p-5 card-3d w-full max-w-lg">
              {currentPattern.sequence.map((shape, idx) => (
                <div
                  key={idx}
                  className="flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-slate-50 border-2 border-slate-200"
                >
                  <ShapeSvg shapeId={shape.id} size={44} className="sm:w-[56px] sm:h-[56px]" />
                </div>
              ))}
              <div
                className={`flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-3 ${
                  stepLocked
                    ? 'bg-[#D3F9D8] border-[#52B788]'
                    : 'bg-[#FFF3BF] border-dashed border-[#FFCA3A]'
                }`}
              >
                {stepLocked ? (
                  <ShapeSvg shapeId={currentPattern.answer.id} size={44} className="sm:w-[56px] sm:h-[56px]" />
                ) : (
                  <span className="font-display text-2xl sm:text-3xl font-bold text-[#A67800]">?</span>
                )}
              </div>
            </div>

            <div
              className={`grid gap-2.5 sm:gap-4 w-full max-w-lg ${
                currentPattern.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentPattern.options.map((shape) => {
                const isShaking = wrongTarget === shape.id;
                const isRight = stepLocked && shape.id === currentPattern.answer.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => handlePatternPick(shape.id, shape.name)}
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-emerald-100 hover:border-emerald-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <ShapeSvg shapeId={shape.id} size={54} className="sm:w-[68px] sm:h-[68px]" />
                    <span className="font-display text-xs sm:text-sm font-bold text-slate-700">
                      {shape.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {subMode === 'shape-objects' && currentShapeObj && (
          <div className="activity-split">
            <div className="flex flex-col items-center gap-1.5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-emerald-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d shrink-0">
              <FigureSvg figureId={currentShapeObj.figure.id} size={82} className="sm:w-[108px] sm:h-[108px]" />
              <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                {currentShapeObj.figure.name}
              </span>
            </div>

            <div
              className={`grid gap-2.5 sm:gap-4 w-full max-w-lg ${
                currentShapeObj.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentShapeObj.options.map((shape) => {
                const isShaking = wrongTarget === shape.id;
                const isRight = stepLocked && shape.id === currentShapeObj.shape.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => {
                      if (shape.id === currentShapeObj.shape.id) {
                        setStepLocked(true);
                        setMood('excited');
                        sfx('success');
                        recordCorrectAnswer('shapes-colors');
                        const praise = pickRandom(CELEBRATE_PHRASES);
                        setFeedback(`${praise} ${shape.name}!`);
                        say(`${praise} ${shape.name}!`);
                        schedule(() => {
                          if (shapeObjStep + 1 >= shapeObjQs.length) {
                            sfx('celebration');
                            setReward(completeRound('shapes-colors', 3));
                          } else {
                            setShapeObjStep((s) => s + 1);
                            setMood('happy');
                            setFeedback('');
                            setStepLocked(false);
                          }
                        }, 1200);
                      } else {
                        sfx('encourage');
                        setMood('encouraging');
                        setWrongTarget(shape.id);
                        const phrase = pickRandom(ENCOURAGE_PHRASES);
                        setFeedback(phrase);
                        say(phrase);
                        schedule(() => setWrongTarget(null), 480);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-emerald-100 hover:border-emerald-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <ShapeSvg shapeId={shape.id} size={54} className="sm:w-[68px] sm:h-[68px]" />
                    <span className="font-display text-xs sm:text-sm font-bold text-slate-700">
                      {shape.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {subMode === 'paint' && (
          <div className="activity-split">
            <div className="board-fluid rounded-[32px] bg-white border-4 border-emerald-100 p-4 sm:p-6 card-3d flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full" aria-label={currentPaint.label}>
                {currentPaint.parts.map((part) => {
                  const isPainted = Boolean(paintedParts[part.id]);
                  const fill = paintedParts[part.id] || '#E2E8F0';
                  return (
                    <path
                      key={part.id}
                      d={part.d}
                      fill={fill}
                      stroke={isPainted ? '#334155' : '#64748B'}
                      strokeWidth="2.5"
                      strokeDasharray={isPainted ? undefined : '3 2'}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-colors hover:opacity-90"
                      onClick={() => {
                        if (stepLocked) return;
                        sfx('pop');
                        const next = { ...paintedParts, [part.id]: brushColor };
                        setPaintedParts(next);
                        if (Object.keys(next).length >= currentPaint.parts.length) {
                          setStepLocked(true);
                          setMood('excited');
                          sfx('success');
                          recordCorrectAnswer('shapes-colors');
                          const praise = pickRandom(CELEBRATE_PHRASES);
                          setFeedback(praise);
                          say(praise);
                          schedule(() => {
                            sfx('celebration');
                            setReward(completeRound('shapes-colors', 3));
                          }, 850);
                        }
                      }}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-white p-2.5 sm:p-3 border-2 border-emerald-100 shadow-sm">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    sfx('pop');
                    setBrushColor(c.hex);
                  }}
                  aria-label={`Cor ${c.name}`}
                  className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 transition-transform cursor-pointer ${
                    brushColor === c.hex ? 'scale-110 border-slate-800 shadow-md' : 'border-white'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {reward && (
        <CelebrationModal
          starsAwarded={reward.starsAwarded}
          newStickerId={reward.newStickerId}
          onPlayAgain={() => resetSubMode(subMode)}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
