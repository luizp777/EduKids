import React, { useEffect, useState } from 'react';
import { Plus, Hash, Scale, Minus, ListOrdered } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES } from '../../data/catalog';
import {
  generateCompareQuestions,
  generateMathQuestions,
  generateSequenceQuestions,
  generateSubtractionQuestions,
  pickRandom,
  type CompareQuestion,
  type MathQuestion,
  type SequenceQuestion,
  type SubtractionQuestion,
} from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { FigureSvg } from '../illustrations/FigureSvg';
import { LumiMascot } from '../illustrations/LumiMascot';

interface Props {
  onBack: () => void;
}

type MathMode = 'count' | 'addition' | 'compare' | 'subtract' | 'sequence';

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

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [wrongOpt, setWrongOpt] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState<{ starsAwarded: number; newStickerId: string | null } | null>(null);
  const { schedule, clearAll } = useTimers();

  const totalSteps =
    mode === 'compare'
      ? compareQs.length
      : mode === 'subtract'
        ? subQs.length
        : mode === 'sequence'
          ? seqQs.length
          : questions.length;

  const getSpokenPrompt = () => {
    if (mode === 'compare') return compareQs[step]?.spokenPrompt || '';
    if (mode === 'subtract') return subQs[step]?.spokenPrompt || '';
    if (mode === 'sequence') return seqQs[step]?.spokenPrompt || '';
    return questions[step]?.spokenPrompt || '';
  };

  const getPromptText = () => {
    if (mode === 'compare') return compareQs[step]?.promptText || '';
    if (mode === 'subtract') return subQs[step]?.promptText || '';
    if (mode === 'sequence') return seqQs[step]?.promptText || '';
    return questions[step]?.promptText || '';
  };

  useEffect(() => {
    const prompt = getSpokenPrompt();
    if (prompt && !reward) {
      say(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step, questions, compareQs, subQs, seqQs]);

  const resetMode = (nextMode: MathMode) => {
    clearAll();
    setMode(nextMode);
    setStep(0);
    setMood('happy');
    setFeedback('');
    setWrongOpt(null);
    setLocked(false);
    setReward(null);
    if (nextMode === 'count' || nextMode === 'addition') {
      setQuestions(generateMathQuestions(activeProfile.ageLevel, 5, nextMode));
    } else if (nextMode === 'compare') {
      setCompareQs(generateCompareQuestions(activeProfile.ageLevel, 4));
    } else if (nextMode === 'subtract') {
      setSubQs(generateSubtractionQuestions(activeProfile.ageLevel, 4));
    } else {
      setSeqQs(generateSequenceQuestions(activeProfile.ageLevel, 4));
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
        setLocked(false);
      }
    }, 1350);
  };

  const triggerWrong = (key: string) => {
    sfx('encourage');
    setMood('encouraging');
    setWrongOpt(key);
    const phrase = pickRandom(ENCOURAGE_PHRASES);
    setFeedback(phrase);
    say(phrase);
    schedule(() => setWrongOpt(null), 480);
  };

  const currentMath = questions[step];
  const currentCompare = compareQs[step];
  const currentSub = subQs[step];
  const currentSeq = seqQs[step];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#EDF6FF] to-[#FFF9F0]">
      <ActivityHeader
        title="Matemática"
        currentStep={step}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getSpokenPrompt())}
        accentColor="#4D96FF"
      />

      {/* Sub-mode tabs */}
      <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
        {[
          { id: 'count' as MathMode, label: 'Contar', icon: Hash },
          { id: 'addition' as MathMode, label: 'Somar', icon: Plus },
          { id: 'compare' as MathMode, label: 'Comparar', icon: Scale },
          { id: 'subtract' as MathMode, label: 'Subtrair', icon: Minus },
          { id: 'sequence' as MathMode, label: 'Sequência', icon: ListOrdered },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              sfx('pop');
              resetMode(id);
            }}
            className={`btn-3d flex items-center gap-1.5 rounded-2xl px-3.5 py-2 font-display text-sm sm:text-base font-bold cursor-pointer ${
              mode === id
                ? 'bg-[#4D96FF] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4 w-full max-w-xl bg-white rounded-3xl p-4 border-2 border-blue-100 card-3d">
          <LumiMascot mood={mood} size={74} />
          <p className="font-display text-lg sm:text-2xl font-bold text-slate-800">
            {feedback || getPromptText()}
          </p>
        </div>

        {(mode === 'count' || mode === 'addition') && currentMath && (
          <>
            <div className="w-full max-w-xl rounded-[32px] bg-white border-4 border-blue-100 p-6 card-3d flex flex-wrap items-center justify-center gap-4">
              {currentMath.mode === 'count' ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
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
                      <FigureSvg figureId={currentMath.figure.id} size={currentMath.countA > 6 ? 68 : 80} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
                  <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-blue-50 p-3 max-w-[180px]">
                    {Array.from({ length: currentMath.countA }).map((_, idx) => (
                      <FigureSvg key={`a-${idx}`} figureId={currentMath.figure.id} size={58} />
                    ))}
                    <span className="w-full text-center font-display text-xl font-bold text-blue-600">
                      {currentMath.countA}
                    </span>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFCA3A] text-white shadow">
                    <Plus className="h-8 w-8 stroke-[3]" />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-emerald-50 p-3 max-w-[180px]">
                    {Array.from({ length: currentMath.countB }).map((_, idx) => (
                      <FigureSvg key={`b-${idx}`} figureId={currentMath.figure.id} size={58} />
                    ))}
                    <span className="w-full text-center font-display text-xl font-bold text-emerald-600">
                      {currentMath.countB}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`grid w-full max-w-lg gap-4 ${
                currentMath.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentMath.options.map((num) => {
                const isShaking = wrongOpt === String(num);
                const isRight = locked && num === currentMath.answer;
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
                    className={`btn-3d flex h-22 sm:h-24 items-center justify-center rounded-3xl font-display text-5xl font-bold border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : 'bg-white border-blue-200 text-[#2B6FD9] hover:bg-blue-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === 'compare' && currentCompare && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
            {(['left', 'right'] as const).map((side) => {
              const count = side === 'left' ? currentCompare.leftCount : currentCompare.rightCount;
              const isShaking = wrongOpt === side;
              const isRight = locked && currentCompare.correctSide === side;
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
                  className={`btn-3d flex flex-col items-center justify-center gap-3 rounded-[32px] p-6 border-4 min-h-[200px] cursor-pointer ${
                    isRight
                      ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                      : 'bg-white border-blue-200 hover:border-blue-400'
                  } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                >
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {Array.from({ length: count }).map((_, i) => (
                      <FigureSvg key={i} figureId={currentCompare.figure.id} size={58} />
                    ))}
                  </div>
                  {locked && (
                    <span className="font-display text-2xl font-bold text-slate-700">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {mode === 'subtract' && currentSub && (
          <>
            <div className="w-full max-w-xl rounded-[32px] bg-white border-4 border-blue-100 p-6 card-3d flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: currentSub.startCount }).map((_, idx) => {
                const isLeaving = idx >= currentSub.answer;
                return (
                  <div
                    key={idx}
                    className={`relative transition-all ${isLeaving ? 'opacity-30 scale-90' : ''}`}
                  >
                    <FigureSvg figureId={currentSub.figure.id} size={74} />
                    {isLeaving && (
                      <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold text-rose-500">
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className={`grid w-full max-w-lg gap-4 ${
                currentSub.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentSub.options.map((num) => {
                const isShaking = wrongOpt === String(num);
                const isRight = locked && num === currentSub.answer;
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
                    className={`btn-3d flex h-22 items-center justify-center rounded-3xl font-display text-5xl font-bold border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : 'bg-white border-blue-200 text-[#2B6FD9] hover:bg-blue-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === 'sequence' && currentSeq && (
          <>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {currentSeq.items.map((val, idx) => {
                const isMissing = val === null;
                return (
                  <div
                    key={idx}
                    className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl font-display text-4xl sm:text-5xl font-bold border-4 shadow-sm ${
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
              className={`grid w-full max-w-lg gap-4 ${
                currentSeq.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentSeq.options.map((num) => {
                const isShaking = wrongOpt === String(num);
                const isRight = locked && num === currentSeq.answer;
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
                    className={`btn-3d flex h-22 items-center justify-center rounded-3xl font-display text-5xl font-bold border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : 'bg-white border-blue-200 text-[#2B6FD9] hover:bg-blue-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>

      {reward && (
        <CelebrationModal
          starsAwarded={reward.starsAwarded}
          newStickerId={reward.newStickerId}
          onPlayAgain={() => resetMode(mode)}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
