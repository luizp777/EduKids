import React, { useEffect, useRef, useState } from 'react';
import { Shapes, Palette, Check, FlaskConical, Sparkles, Plus, Paintbrush, Search, Eraser, BookmarkCheck } from 'lucide-react';
import { useApp, type RoundReward } from '../../state/AppContext';
import { CELEBRATE_PHRASES, COLORS, ENCOURAGE_PHRASES, PAINT_DRAWINGS } from '../../data/catalog';
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

/** Atividade de Formas e Cores: Encaixar, Caça às Cores, Misturar, Padrões, Formas no Mundo e Pintar. */
export const ShapesColorsActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, savePainting, say, sfx } = useApp();
  const [subMode, setSubMode] = useState<SubMode>('shapes');
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [reward, setReward] = useState<RoundReward | null>(null);
  const { schedule, clearAll } = useTimers();

  // Shapes matching state
  const [shapes, setShapes] = useState<ShapeInfo[]>(() => generateShapeRound(activeProfile.ageLevel));
  const [shuffledPieces, setShuffledPieces] = useState<ShapeInfo[]>(() => shuffle(shapes));
  const [matchedShapes, setMatchedShapes] = useState<ShapeId[]>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeId | null>(null);
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [manualHint, setManualHint] = useState(false);
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
  const [savedNotice, setSavedNotice] = useState(false);

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
    setWrongAttempts(0);
    setManualHint(false);
    setStepLocked(false);
    setSavedNotice(false);

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
      setWrongAttempts(0);
      setManualHint(false);
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
      setWrongAttempts((c) => c + 1);
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
      setWrongAttempts(0);
      setManualHint(false);
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
      setWrongAttempts((c) => c + 1);
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
          setWrongAttempts(0);
          setManualHint(false);
          setStepLocked(false);
        }
      }, 1300);
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongTarget(colorId);
      setWrongAttempts((c) => c + 1);
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
          setWrongAttempts(0);
          setManualHint(false);
          setStepLocked(false);
        }
      }, 1200);
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongTarget(shapeId);
      setWrongAttempts((c) => c + 1);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongTarget(null), 480);
    }
  };

  const currentMix = mixRounds[mixStep];
  const currentPattern = patternQs[patternStep];
  const currentShapeObj = shapeObjQs[shapeObjStep];
  const showHint = (wrongAttempts >= 2 || manualHint) && !stepLocked;

  return (
    <div className="activity-shell bg-gradient-to-b from-[#EEFCF2] to-[#FFF9F0]">
      <ActivityHeader
        title="Formas e Cores"
        currentStep={currentMatches}
        totalSteps={totalMatchesNeeded}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getPrompt())}
        onRequestHint={
          subMode !== 'paint'
            ? () => {
                sfx('pop');
                setManualHint(true);
              }
            : undefined
        }
        hintActive={showHint}
        accentColor="#52B788"
      />

      {/* Mode Switcher: horizontal scroll on phones, centered wrap on tablet/laptop */}
      <div className="activity-tabs activity-tabs-fade no-scrollbar snap-x">
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
            aria-pressed={subMode === id}
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
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.4]" />
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
                  const firstUnmatchedId = shapes.find((sh) => !matchedShapes.includes(sh.id))?.id;
                  const hintTargetId = selectedShape || firstUnmatchedId;
                  const isMatched = matchedShapes.includes(s.id);
                  const isShaking = wrongTarget === s.id;
                  const isHinted = showHint && !isMatched && hintTargetId === s.id;
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
                          : isHinted
                            ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
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
                const firstUnmatchedId = shapes.find((sh) => !matchedShapes.includes(sh.id))?.id;
                const isMatched = matchedShapes.includes(s.id);
                const isSelected = selectedShape === s.id;
                const isPieceHinted = showHint && !selectedShape && !isMatched && s.id === firstUnmatchedId;
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
                          : isPieceHinted
                            ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse cursor-grab'
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
                const isHinted = showHint && isMatch && !isFound;
                return (
                  <button
                    key={figure.id}
                    type="button"
                    disabled={isFound}
                    onClick={() => handleColorPick(figure.id, isMatch, figure.name)}
                    className={`btn-3d relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border-4 cursor-pointer ${
                      isFound
                        ? 'bg-[#D3F9D8] border-[#52B788]'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
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
                const isHinted = showHint && col.id === currentMix.result.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => handleMixPick(col.id)}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
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
                const isHinted = showHint && shape.id === currentPattern.answer.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => handlePatternPick(shape.id, shape.name)}
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
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
                const isHinted = showHint && shape.id === currentShapeObj.shape.id;
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
                            setWrongAttempts(0);
                            setManualHint(false);
                            setStepLocked(false);
                          }
                        }, 1200);
                      } else {
                        sfx('encourage');
                        setMood('encouraging');
                        setWrongTarget(shape.id);
                        setWrongAttempts((c) => c + 1);
                        const phrase = pickRandom(ENCOURAGE_PHRASES);
                        setFeedback(phrase);
                        say(phrase);
                        schedule(() => setWrongTarget(null), 480);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
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
          <div className="w-full flex flex-col items-center gap-2.5 sm:gap-3">
            {/* Quick Drawing Picker */}
            <div className="activity-tabs-fade w-full max-w-2xl flex items-center sm:justify-center gap-1.5 px-2 overflow-x-auto no-scrollbar snap-x shrink-0">
              {PAINT_DRAWINGS.map((d, idx) => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={idx === paintIdx % PAINT_DRAWINGS.length}
                  onClick={() => {
                    sfx('pop');
                    clearAll();
                    setPaintIdx(idx);
                    setPaintedParts({});
                    setStepLocked(false);
                    setSavedNotice(false);
                    setFeedback('');
                    setMood('happy');
                  }}
                  className={`snap-start shrink-0 rounded-xl px-2.5 py-1 font-display text-xs sm:text-sm font-bold border-2 cursor-pointer transition-colors ${
                    idx === paintIdx % PAINT_DRAWINGS.length
                      ? 'bg-[#D3F9D8] border-[#52B788] text-[#1B4332]'
                      : 'bg-white/80 border-emerald-100 text-slate-600 hover:bg-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

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

              <div className="flex flex-wrap lg:flex-col items-center justify-center gap-2.5">
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sfx('pop');
                      setPaintedParts({});
                      setStepLocked(false);
                      setSavedNotice(false);
                      setFeedback('');
                      setMood('happy');
                    }}
                    className="btn-3d flex items-center gap-1.5 rounded-2xl bg-white border-2 border-slate-200 px-3.5 py-2 font-display text-sm font-bold text-slate-700 cursor-pointer"
                  >
                    <Eraser className="h-4 w-4" />
                    Limpar
                  </button>

                  {Object.keys(paintedParts).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        sfx('success');
                        savePainting(currentPaint.id, currentPaint.label, paintedParts);
                        setSavedNotice(true);
                        setFeedback('Desenho salvo na galeria do Álbum!');
                      }}
                      className={`btn-3d flex items-center gap-1.5 rounded-2xl px-3.5 py-2 font-display text-sm font-bold cursor-pointer ${
                        savedNotice
                          ? 'bg-[#D3F9D8] border-2 border-[#52B788] text-[#1B4332]'
                          : 'bg-[#52B788] text-white'
                      }`}
                    >
                      <BookmarkCheck className="h-4 w-4" />
                      {savedNotice ? 'Salvo!' : 'Salvar no Álbum'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {reward && (
        <CelebrationModal
          starsAwarded={reward.starsAwarded}
          newStickerId={reward.newStickerId}
          newGoldenStickerId={reward.newGoldenStickerId}
          onPlayAgain={() => resetSubMode(subMode)}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
