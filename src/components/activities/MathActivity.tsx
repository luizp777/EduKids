import React, { useEffect, useState } from 'react';
import { Plus, Hash, Scale, Minus, ListOrdered, ArrowUpNarrowWide, Shapes, Divide } from 'lucide-react';
import { useApp, type RoundReward } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES } from '../../data/catalog';
import {
  generateCompareQuestions,
  generateMathQuestions,
  generateNumberQuantityQuestions,
  generateOrderSizeQuestions,
  generateSequenceQuestions,
  generateShareQuestions,
  generateSubtractionQuestions,
  pickRandom,
  type CompareQuestion,
  type MathQuestion,
  type NumberQuantityQuestion,
  type OrderSizeQuestion,
  type SequenceQuestion,
  type ShareQuestion,
  type SubtractionQuestion,
} from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { LumiPromptBanner } from '../ui/LumiPromptBanner';
import { FigureSvg } from '../illustrations/FigureSvg';

interface Props {
  onBack: () => void;
}

type MathMode = 'count' | 'addition' | 'compare' | 'subtract' | 'sequence' | 'order' | 'quantity' | 'share';

/** Atividade de Matemática: Contar, Somar, Comparar, Subtrair, Sequência, Ordem, Quantidades e Dividir. */
export const MathActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [mode, setMode] = useState<MathMode>('count');
  const [questions, setQuestions] = useState<MathQuestion[]>(() =>
    generateMathQuestions(activeProfile.ageLevel, 5, 'count')
  );
  const [compareQs, setCompareQs] = useState<CompareQuestion[]>(() =>
    generateCompareQuestions(activeProfile.ageLevel, 4)
  );
  const [subQs, setSubQs] = useState<SubtractionQuestion[]>(() =>
    generateSubtractionQuestions(activeProfile.ageLevel, 4)
  );
  const [seqQs, setSeqQs] = useState<SequenceQuestion[]>(() =>
    generateSequenceQuestions(activeProfile.ageLevel, 4)
  );
  const [orderQs, setOrderQs] = useState<OrderSizeQuestion[]>(() =>
    generateOrderSizeQuestions(activeProfile.ageLevel, 4)
  );
  const [quantityQs, setQuantityQs] = useState<NumberQuantityQuestion[]>(() =>
    generateNumberQuantityQuestions(activeProfile.ageLevel, 4)
  );
  const [shareQs, setShareQs] = useState<ShareQuestion[]>(() =>
    generateShareQuestions(activeProfile.ageLevel, 4)
  );
  const [pickedOrderIds, setPickedOrderIds] = useState<string[]>([]);

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [wrongOpt, setWrongOpt] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [manualHint, setManualHint] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState<RoundReward | null>(null);
  const { schedule, clearAll } = useTimers();
  const showHint = (wrongAttempts >= 2 || manualHint) && !locked;

  const totalSteps =
    mode === 'compare'
      ? compareQs.length
      : mode === 'subtract'
        ? subQs.length
        : mode === 'sequence'
          ? seqQs.length
          : mode === 'order'
            ? orderQs.length
            : mode === 'quantity'
              ? quantityQs.length
              : mode === 'share'
                ? shareQs.length
                : questions.length;

  const getSpokenPrompt = () => {
    if (mode === 'compare') return compareQs[step]?.spokenPrompt || '';
    if (mode === 'subtract') return subQs[step]?.spokenPrompt || '';
    if (mode === 'sequence') return seqQs[step]?.spokenPrompt || '';
    if (mode === 'order') return orderQs[step]?.spokenPrompt || '';
    if (mode === 'quantity') return quantityQs[step]?.spokenPrompt || '';
    if (mode === 'share') return shareQs[step]?.spokenPrompt || '';
    return questions[step]?.spokenPrompt || '';
  };

  const getPromptText = () => {
    if (mode === 'compare') return compareQs[step]?.promptText || '';
    if (mode === 'subtract') return subQs[step]?.promptText || '';
    if (mode === 'sequence') return seqQs[step]?.promptText || '';
    if (mode === 'order') return orderQs[step]?.promptText || '';
    if (mode === 'quantity') return quantityQs[step]?.promptText || '';
    if (mode === 'share') return shareQs[step]?.promptText || '';
    return questions[step]?.promptText || '';
  };

  useEffect(() => {
    const prompt = getSpokenPrompt();
    if (prompt && !reward) {
      say(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step, questions, compareQs, subQs, seqQs, orderQs, quantityQs, shareQs]);

  const resetMode = (nextMode: MathMode) => {
    clearAll();
    setMode(nextMode);
    setStep(0);
    setMood('happy');
    setFeedback('');
    setWrongOpt(null);
    setWrongAttempts(0);
    setManualHint(false);
    setLocked(false);
    setReward(null);
    setPickedOrderIds([]);
    if (nextMode === 'count' || nextMode === 'addition') {
      setQuestions(generateMathQuestions(activeProfile.ageLevel, 5, nextMode));
    } else if (nextMode === 'compare') {
      setCompareQs(generateCompareQuestions(activeProfile.ageLevel, 4));
    } else if (nextMode === 'subtract') {
      setSubQs(generateSubtractionQuestions(activeProfile.ageLevel, 4));
    } else if (nextMode === 'sequence') {
      setSeqQs(generateSequenceQuestions(activeProfile.ageLevel, 4));
    } else if (nextMode === 'quantity') {
      setQuantityQs(generateNumberQuantityQuestions(activeProfile.ageLevel, 4));
    } else if (nextMode === 'share') {
      setShareQs(generateShareQuestions(activeProfile.ageLevel, 4));
    } else {
      setOrderQs(generateOrderSizeQuestions(activeProfile.ageLevel, 4));
    }
  };

  const triggerSuccess = (detail: string) => {
    setLocked(true);
    setMood('excited');
    sfx('success');
    const praise = pickRandom(CELEBRATE_PHRASES);
    setFeedback(`${praise} ${detail}`);
    say(`${praise} ${detail}`);
    recordCorrectAnswer('math');

    schedule(() => {
      if (step + 1 >= totalSteps) {
        sfx('celebration');
        setReward(completeRound('math', 3));
      } else {
        setStep((s) => s + 1);
        setMood('happy');
        setFeedback('');
        setWrongAttempts(0);
        setManualHint(false);
        setLocked(false);
        setPickedOrderIds([]);
      }
    }, 1350);
  };

  const triggerWrong = (key: string) => {
    sfx('encourage');
    setMood('encouraging');
    setWrongOpt(key);
    setWrongAttempts((c) => c + 1);
    const phrase = pickRandom(ENCOURAGE_PHRASES);
    setFeedback(phrase);
    say(phrase);
    schedule(() => setWrongOpt(null), 480);
  };

  const currentMath = questions[step];
  const currentCompare = compareQs[step];
  const currentSub = subQs[step];
  const currentSeq = seqQs[step];
  const currentOrder = orderQs[step];
  const currentQty = quantityQs[step];
  const currentShare = shareQs[step];

  return (
    <div className="activity-shell bg-gradient-to-b from-[#EDF6FF] to-[#FFF9F0]">
      <ActivityHeader
        title="Matemática"
        currentStep={step}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getSpokenPrompt())}
        onRequestHint={() => {
          sfx('pop');
          setManualHint(true);
        }}
        hintActive={showHint}
        accentColor="#4D96FF"
      />

      {/* Sub-mode tabs: horizontal scroll on phones, centered wrap on tablet/laptop */}
      <div className="activity-tabs activity-tabs-fade no-scrollbar snap-x">
        {[
          { id: 'count' as MathMode, label: 'Contar', icon: Hash },
          { id: 'addition' as MathMode, label: 'Somar', icon: Plus },
          { id: 'compare' as MathMode, label: 'Comparar', icon: Scale },
          { id: 'subtract' as MathMode, label: 'Subtrair', icon: Minus },
          { id: 'sequence' as MathMode, label: 'Sequência', icon: ListOrdered },
          { id: 'order' as MathMode, label: 'Ordem', icon: ArrowUpNarrowWide },
          { id: 'quantity' as MathMode, label: 'Quantidades', icon: Shapes },
          { id: 'share' as MathMode, label: 'Dividir', icon: Divide },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={(e) => {
              sfx('pop');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              resetMode(id);
            }}
            className={`btn-3d snap-start shrink-0 flex items-center gap-1.5 rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 font-display text-xs sm:text-base font-bold cursor-pointer ${
              mode === id
                ? 'bg-[#4D96FF] text-white'
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
          text={feedback || getPromptText()}
          borderClass="border-blue-100"
          onTap={() => say(getSpokenPrompt())}
        />

        {(mode === 'count' || mode === 'addition') && currentMath && (
          <div className="activity-split">
            <div className="w-full max-w-xl rounded-[28px] sm:rounded-[32px] bg-white border-4 border-blue-100 p-4 sm:p-6 card-3d flex flex-wrap items-center justify-center gap-3">
              {currentMath.mode === 'count' ? (
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {Array.from({ length: currentMath.countA }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sfx('pop');
                        say(String(idx + 1));
                      }}
                      className="transition-transform active:scale-110 cursor-pointer"
                      aria-label={`Contar ${idx + 1}`}
                    >
                      <FigureSvg
                        figureId={currentMath.figure.id}
                        size={currentMath.countA > 6 ? 54 : 66}
                        className="sm:w-[76px] sm:h-[76px]"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 sm:gap-5 flex-wrap">
                  <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-blue-50 p-2.5 sm:p-3 max-w-[150px] sm:max-w-[180px]">
                    {Array.from({ length: currentMath.countA }).map((_, idx) => (
                      <button
                        key={`a-${idx}`}
                        type="button"
                        onClick={() => {
                          sfx('pop');
                          say(String(idx + 1));
                        }}
                        className="transition-transform active:scale-110 cursor-pointer"
                        aria-label={`Contar ${idx + 1}`}
                      >
                        <FigureSvg figureId={currentMath.figure.id} size={46} className="sm:w-[58px] sm:h-[58px]" />
                      </button>
                    ))}
                    <span className="w-full text-center font-display text-lg sm:text-xl font-bold text-blue-600">
                      {currentMath.countA}
                    </span>
                  </div>

                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FFCA3A] text-white shadow">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 stroke-[3]" />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-emerald-50 p-2.5 sm:p-3 max-w-[150px] sm:max-w-[180px]">
                    {Array.from({ length: currentMath.countB }).map((_, idx) => (
                      <button
                        key={`b-${idx}`}
                        type="button"
                        onClick={() => {
                          sfx('pop');
                          say(String(currentMath.countA + idx + 1));
                        }}
                        className="transition-transform active:scale-110 cursor-pointer"
                        aria-label={`Contar ${currentMath.countA + idx + 1}`}
                      >
                        <FigureSvg figureId={currentMath.figure.id} size={46} className="sm:w-[58px] sm:h-[58px]" />
                      </button>
                    ))}
                    <span className="w-full text-center font-display text-lg sm:text-xl font-bold text-emerald-600">
                      {currentMath.countB}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`grid w-full max-w-lg gap-2.5 sm:gap-4 ${
                currentMath.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-2'
              }`}
            >
              {currentMath.options.map((num) => {
                const isShaking = wrongOpt === String(num);
                const isRight = locked && num === currentMath.answer;
                const isHinted = showHint && num === currentMath.answer;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (num === currentMath.answer) {
                        const detail =
                          currentMath.mode === 'addition'
                            ? `${currentMath.countA} mais ${currentMath.countB} é igual a ${currentMath.answer}!`
                            : `São ${currentMath.answer}!`;
                        triggerSuccess(detail);
                      } else {
                        triggerWrong(String(num));
                      }
                    }}
                    className={`btn-3d flex h-16 sm:h-24 items-center justify-center rounded-2xl sm:rounded-3xl font-display text-4xl sm:text-5xl font-bold border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] text-[#A67800] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-blue-200 text-[#2B6FD9] hover:bg-blue-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'compare' && currentCompare && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-2xl">
            {(['left', 'right'] as const).map((side) => {
              const count = side === 'left' ? currentCompare.leftCount : currentCompare.rightCount;
              const isShaking = wrongOpt === side;
              const isRight = locked && currentCompare.correctSide === side;
              const isHinted = showHint && currentCompare.correctSide === side;
              return (
                <button
                  key={side}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    if (side === currentCompare.correctSide) {
                      triggerSuccess(
                        currentCompare.askMost
                          ? `Esse grupo tem ${count}, que é mais!`
                          : `Esse grupo tem ${count}, que é menos!`
                      );
                    } else {
                      triggerWrong(side);
                    }
                  }}
                  className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-6 border-4 min-h-[155px] sm:min-h-[200px] cursor-pointer ${
                    isRight
                      ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                      : isHinted
                        ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                        : 'bg-white border-blue-200 hover:border-blue-400'
                  } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                >
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    {Array.from({ length: count }).map((_, i) => (
                      <FigureSvg
                        key={i}
                        figureId={currentCompare.figure.id}
                        size={count > 5 ? 38 : 48}
                        className="sm:w-[58px] sm:h-[58px]"
                      />
                    ))}
                  </div>
                  {locked && (
                    <span className="font-display text-xl sm:text-2xl font-bold text-slate-700">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {mode === 'subtract' && currentSub && (
          <div className="activity-split">
            <div className="w-full max-w-xl rounded-[28px] sm:rounded-[32px] bg-white border-4 border-blue-100 p-4 sm:p-6 card-3d flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {Array.from({ length: currentSub.startCount }).map((_, idx) => {
                const isLeaving = idx >= currentSub.answer;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!isLeaving) {
                        sfx('pop');
                        say(String(idx + 1));
                      }
                    }}
                    className={`relative transition-all ${isLeaving ? 'opacity-30 scale-90 cursor-default' : 'cursor-pointer active:scale-110'}`}
                    aria-label={isLeaving ? 'Item removido' : `Contar ${idx + 1}`}
                  >
                    <FigureSvg figureId={currentSub.figure.id} size={58} className="sm:w-[74px] sm:h-[74px]" />
                    {isLeaving && (
                      <span className="absolute inset-0 flex items-center justify-center font-display text-3xl sm:text-4xl font-bold text-rose-500">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              className={`grid w-full max-w-lg gap-2.5 sm:gap-4 ${
                currentSub.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-2'
              }`}
            >
              {currentSub.options.map((num) => {
                const isShaking = wrongOpt === String(num);
                const isRight = locked && num === currentSub.answer;
                const isHinted = showHint && num === currentSub.answer;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (num === currentSub.answer) {
                        triggerSuccess(`Ficaram ${currentSub.answer}!`);
                      } else {
                        triggerWrong(String(num));
                      }
                    }}
                    className={`btn-3d flex h-16 sm:h-20 items-center justify-center rounded-2xl sm:rounded-3xl font-display text-4xl sm:text-5xl font-bold border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] text-[#A67800] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-blue-200 text-[#2B6FD9] hover:bg-blue-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'sequence' && currentSeq && (
          <div className="activity-split">
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {currentSeq.items.map((val, idx) => {
                const isMissing = val === null;
                return (
                  <div
                    key={idx}
                    className={`flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-2xl sm:rounded-3xl font-display text-3xl sm:text-5xl font-bold border-4 shadow-sm ${
                      isMissing
                        ? locked
                          ? 'bg-[#D3F9D8] border-[#52B788] text-[#1B4332]'
                          : 'bg-[#FFF3BF] border-[#FFCA3A] text-[#A67800]'
                        : 'bg-white border-blue-200 text-slate-800'
                    }`}
                  >
                    {isMissing ? (locked ? currentSeq.answer : '?') : val}
                  </div>
                );
              })}
            </div>

            <div
              className={`grid w-full max-w-lg gap-2.5 sm:gap-4 ${
                currentSeq.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-2'
              }`}
            >
              {currentSeq.options.map((num) => {
                const isShaking = wrongOpt === String(num);
                const isRight = locked && num === currentSeq.answer;
                const isHinted = showHint && num === currentSeq.answer;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (num === currentSeq.answer) {
                        triggerSuccess(`O número ${currentSeq.answer}!`);
                      } else {
                        triggerWrong(String(num));
                      }
                    }}
                    className={`btn-3d flex h-16 sm:h-20 items-center justify-center rounded-2xl sm:rounded-3xl font-display text-4xl sm:text-5xl font-bold border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] text-[#A67800] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-blue-200 text-[#2B6FD9] hover:bg-blue-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'order' && currentOrder && (
          <div
            className={`grid w-full max-w-2xl gap-2.5 sm:gap-4 ${
              currentOrder.items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {currentOrder.items.map((item) => {
              const isPicked = pickedOrderIds.includes(item.id);
              const isShaking = wrongOpt === item.id;
              const expectedVal = currentOrder.expectedOrder[pickedOrderIds.length];
              const isHinted = showHint && !isPicked && item.value === expectedVal;
              const figSize = item.value === 1 ? 44 : item.value === 2 ? 66 : 92;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={locked || isPicked}
                  onClick={() => {
                    if (item.value === expectedVal) {
                      sfx('pop');
                      setWrongAttempts(0);
                      setManualHint(false);
                      const next = [...pickedOrderIds, item.id];
                      setPickedOrderIds(next);
                      if (next.length >= currentOrder.expectedOrder.length) {
                        triggerSuccess('');
                      }
                    } else {
                      triggerWrong(item.id);
                    }
                  }}
                  className={`btn-3d flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl p-3 sm:p-4 min-h-[118px] sm:min-h-[140px] border-4 cursor-pointer ${
                    isPicked
                      ? 'bg-[#D3F9D8] border-[#52B788] scale-95 opacity-75'
                      : isHinted
                        ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                        : 'bg-white border-blue-200 hover:border-blue-400'
                  } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                >
                  {currentOrder.mode === 'sizes' && item.figure ? (
                    <FigureSvg figureId={item.figure.id} size={figSize} />
                  ) : (
                    <span className="font-display text-4xl sm:text-5xl font-bold text-[#2B6FD9]">
                      {item.value}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {mode === 'quantity' && currentQty && (
          <div className="activity-split">
            <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-[24px] sm:rounded-[28px] bg-[#4D96FF] border-4 border-white shadow-xl shrink-0">
              <span className="font-display text-5xl sm:text-7xl font-bold text-white drop-shadow">
                {currentQty.targetNumber}
              </span>
            </div>

            <div
              className={`grid w-full max-w-2xl gap-2.5 sm:gap-4 ${
                currentQty.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
              }`}
            >
              {currentQty.options.map((opt) => {
                const isShaking = wrongOpt === opt.id;
                const isRight = locked && opt.count === currentQty.targetNumber;
                const isHinted = showHint && opt.count === currentQty.targetNumber;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (opt.count === currentQty.targetNumber) {
                        triggerSuccess(`São ${opt.count}!`);
                      } else {
                        triggerWrong(opt.id);
                      }
                    }}
                    className={`btn-3d flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-[22px] sm:rounded-[28px] p-3 sm:p-5 min-h-[115px] sm:min-h-[150px] border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-blue-200 hover:border-blue-400'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {Array.from({ length: opt.count }).map((_, i) => (
                      <FigureSvg key={i} figureId={currentQty.figure.id} size={opt.count > 5 ? 36 : 44} className="sm:w-[50px] sm:h-[50px]" />
                    ))}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {mode === 'share' && currentShare && (
          <div className="activity-split">
            <div className="w-full max-w-xl rounded-[28px] sm:rounded-[32px] bg-white border-4 border-blue-100 p-4 sm:p-5 card-3d flex flex-col items-center gap-3">
              <div className="grid grid-cols-2 gap-3 w-full">
                {[0, 1].map((basketIdx) => (
                  <div
                    key={basketIdx}
                    className={`rounded-2xl p-2.5 sm:p-3 border-2 flex flex-col items-center gap-2 ${
                      basketIdx === 0
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-sky-50 border-sky-200'
                    }`}
                  >
                    <span className="font-display text-xs sm:text-sm font-bold text-slate-600">
                      {basketIdx === 0 ? 'Cesta da Lumi' : 'Cesta do Amigo'}
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {Array.from({ length: currentShare.answer }).map((_, i) => (
                        <FigureSvg
                          key={i}
                          figureId={currentShare.figure.id}
                          size={currentShare.answer > 3 ? 38 : 48}
                          className="sm:w-[52px] sm:h-[52px]"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-blue-600">
                Total: {currentShare.total} figuras divididas igualmente
              </span>
            </div>

            <div
              className={`grid w-full max-w-lg gap-2.5 sm:gap-4 ${
                currentShare.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-2'
              }`}
            >
              {currentShare.options.map((num) => {
                const isShaking = wrongOpt === String(num);
                const isRight = locked && num === currentShare.answer;
                const isHinted = showHint && num === currentShare.answer;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (num === currentShare.answer) {
                        triggerSuccess(`Cada amigo ganha ${currentShare.answer}!`);
                      } else {
                        triggerWrong(String(num));
                      }
                    }}
                    className={`btn-3d flex h-16 sm:h-20 items-center justify-center rounded-2xl sm:rounded-3xl font-display text-4xl sm:text-5xl font-bold border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] text-[#A67800] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-blue-200 text-[#2B6FD9] hover:bg-blue-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {reward && (
        <CelebrationModal
          starsAwarded={reward.starsAwarded}
          newStickerId={reward.newStickerId}
          newGoldenStickerId={reward.newGoldenStickerId}
          onPlayAgain={() => resetMode(mode)}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
