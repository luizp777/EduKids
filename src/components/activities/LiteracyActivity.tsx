import React, { useEffect, useState } from 'react';
import { BookOpen, PenLine, Music, Hand, Blocks, Sparkles } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES } from '../../data/catalog';
import {
  generateInitialSyllableQuestions,
  generateLiteracyQuestions,
  generateRhymeQuestions,
  generateSyllableQuestions,
  generateWordBuilderQuestions,
  pickRandom,
  type InitialSyllableQuestion,
  type LiteracyQuestion,
  type RhymeQuestion,
  type SyllableQuestion,
  type WordBuilderQuestion,
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

type LiteracyMode = 'initial' | 'complete' | 'rhyme' | 'syllable' | 'syllable-start' | 'build';

/** Atividade de Alfabetização: Som Inicial, Completar, Rimas, Sílabas, Sílaba Inicial e Montar Palavra. */
export const LiteracyActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [mode, setMode] = useState<LiteracyMode>('initial');
  const [questions, setQuestions] = useState<LiteracyQuestion[]>(() =>
    generateLiteracyQuestions(activeProfile.ageLevel, 5, 'initial-letter')
  );
  const [rhymeQs, setRhymeQs] = useState<RhymeQuestion[]>(() =>
    generateRhymeQuestions(activeProfile.ageLevel, 4)
  );
  const [syllableQs, setSyllableQs] = useState<SyllableQuestion[]>(() =>
    generateSyllableQuestions(activeProfile.ageLevel, 4)
  );
  const [builderQs, setBuilderQs] = useState<WordBuilderQuestion[]>(() =>
    generateWordBuilderQuestions(activeProfile.ageLevel, 4)
  );
  const [initSylQs, setInitSylQs] = useState<InitialSyllableQuestion[]>(() =>
    generateInitialSyllableQuestions(activeProfile.ageLevel, 4)
  );
  const [usedLetterUids, setUsedLetterUids] = useState<string[]>([]);

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState<{ starsAwarded: number; newStickerId: string | null } | null>(null);
  const { schedule, clearAll } = useTimers();

  const totalSteps =
    mode === 'rhyme'
      ? rhymeQs.length
      : mode === 'syllable'
        ? syllableQs.length
        : mode === 'syllable-start'
          ? initSylQs.length
          : mode === 'build'
            ? builderQs.length
            : questions.length;

  const getSpokenPrompt = () => {
    if (mode === 'rhyme') return rhymeQs[step]?.spokenPrompt || '';
    if (mode === 'syllable') return syllableQs[step]?.spokenPrompt || '';
    if (mode === 'syllable-start') return initSylQs[step]?.spokenPrompt || '';
    if (mode === 'build') return builderQs[step]?.spokenPrompt || '';
    return questions[step]?.spokenPrompt || '';
  };

  const getPromptText = () => {
    if (mode === 'rhyme') return rhymeQs[step]?.promptText || '';
    if (mode === 'syllable') return syllableQs[step]?.promptText || '';
    if (mode === 'syllable-start') return initSylQs[step]?.promptText || '';
    if (mode === 'build') return 'Toque nas letras na ordem certa!';
    return questions[step]?.promptText || '';
  };

  useEffect(() => {
    const prompt = getSpokenPrompt();
    if (prompt && !reward) {
      say(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step, questions, rhymeQs, syllableQs, initSylQs, builderQs]);

  const resetMode = (nextMode: LiteracyMode) => {
    clearAll();
    setMode(nextMode);
    setStep(0);
    setMood('happy');
    setFeedback('');
    setWrongId(null);
    setLocked(false);
    setReward(null);
    setUsedLetterUids([]);
    if (nextMode === 'initial') {
      setQuestions(generateLiteracyQuestions(activeProfile.ageLevel, 5, 'initial-letter'));
    } else if (nextMode === 'complete') {
      setQuestions(generateLiteracyQuestions(activeProfile.ageLevel, 5, 'complete-word'));
    } else if (nextMode === 'rhyme') {
      setRhymeQs(generateRhymeQuestions(activeProfile.ageLevel, 4));
    } else if (nextMode === 'syllable') {
      setSyllableQs(generateSyllableQuestions(activeProfile.ageLevel, 4));
    } else if (nextMode === 'syllable-start') {
      setInitSylQs(generateInitialSyllableQuestions(activeProfile.ageLevel, 4));
    } else {
      setBuilderQs(generateWordBuilderQuestions(activeProfile.ageLevel, 4));
    }
  };

  const handleCorrect = (spokenDetail: string) => {
    setLocked(true);
    setMood('excited');
    sfx('success');
    const praise = pickRandom(CELEBRATE_PHRASES);
    setFeedback(`${praise} ${spokenDetail}`);
    say(`${praise} ${spokenDetail}`);
    recordCorrectAnswer('literacy');

    schedule(() => {
      if (step + 1 >= totalSteps) {
        sfx('celebration');
        setReward(completeRound('literacy', 3));
      } else {
        setStep((s) => s + 1);
        setMood('happy');
        setFeedback('');
        setLocked(false);
        setUsedLetterUids([]);
      }
    }, 1350);
  };

  const handleWrong = (id: string) => {
    sfx('encourage');
    setMood('encouraging');
    setWrongId(id);
    const phrase = pickRandom(ENCOURAGE_PHRASES);
    setFeedback(phrase);
    say(phrase);
    schedule(() => setWrongId(null), 480);
  };

  const currentLit = questions[step];
  const currentRhyme = rhymeQs[step];
  const currentSyllable = syllableQs[step];
  const currentInitSyl = initSylQs[step];
  const currentBuilder = builderQs[step];

  return (
    <div className="activity-shell bg-gradient-to-b from-[#FFF3F0] to-[#FFF9F0]">
      <ActivityHeader
        title="Alfabetização"
        currentStep={step}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getSpokenPrompt())}
        accentColor="#FF6B6B"
      />

      {/* Sub-mode tabs: horizontal scroll on phones, centered on tablet/laptop */}
      <div className="activity-tabs-fade w-full max-w-5xl mx-auto flex items-center sm:justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-1 pb-1 overflow-x-auto no-scrollbar snap-x shrink-0">
        {[
          { id: 'initial' as LiteracyMode, label: 'Som Inicial', icon: BookOpen },
          { id: 'complete' as LiteracyMode, label: 'Completar', icon: PenLine },
          { id: 'rhyme' as LiteracyMode, label: 'Rimas', icon: Music },
          { id: 'syllable' as LiteracyMode, label: 'Sílabas', icon: Hand },
          { id: 'syllable-start' as LiteracyMode, label: 'Sílaba Inicial', icon: Sparkles },
          { id: 'build' as LiteracyMode, label: 'Montar', icon: Blocks },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={(e) => {
              sfx('pop');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              resetMode(id);
            }}
            className={`btn-3d snap-start shrink-0 flex items-center gap-1.5 rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 font-display text-xs sm:text-base font-bold cursor-pointer ${
              mode === id
                ? 'bg-[#FF6B6B] text-white'
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
          text={feedback || getPromptText()}
          borderClass="border-rose-100"
          onTap={() => say(getSpokenPrompt())}
        />

        {(mode === 'initial' || mode === 'complete') && currentLit && (
          currentLit.mode === 'initial-letter' ? (
            <div className="activity-split">
              <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-[24px] sm:rounded-[28px] bg-[#FF6B6B] border-4 border-white shadow-xl shrink-0">
                <span className="font-display text-5xl sm:text-7xl font-bold text-white drop-shadow">
                  {currentLit.target.letter}
                </span>
              </div>

              <div
                className={`grid w-full max-w-2xl gap-2.5 sm:gap-4 ${
                  currentLit.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
                }`}
              >
                {currentLit.options.map((fig) => {
                  const isShaking = wrongId === fig.id;
                  const isRevealedCorrect = locked && fig.id === currentLit.target.id;
                  return (
                    <button
                      key={fig.id}
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        if (fig.id === currentLit.target.id) {
                          handleCorrect(`${currentLit.target.letter} de ${fig.name.toLowerCase()}!`);
                        } else {
                          handleWrong(fig.id);
                        }
                      }}
                      className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 border-4 cursor-pointer ${
                        isRevealedCorrect
                          ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                          : 'bg-white border-rose-100 hover:border-rose-300'
                      } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                    >
                      <FigureSvg figureId={fig.id} size={68} className="sm:w-[86px] sm:h-[86px]" />
                      <span className="font-display text-xs sm:text-lg font-bold text-slate-700 truncate max-w-full">
                        {fig.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="activity-split">
              <div className="flex flex-col items-center gap-2.5 sm:gap-4 bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 border-4 border-rose-100 card-3d w-full max-w-md">
                <FigureSvg figureId={currentLit.target.id} size={86} className="sm:w-[116px] sm:h-[116px]" />
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                  {currentLit.target.name.split('').map((ch, idx) => {
                    const isMissing = idx === currentLit.missingIndex;
                    return (
                      <div
                        key={idx}
                        className={`flex h-10 w-9 sm:h-14 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl font-display text-2xl sm:text-4xl font-bold border-3 ${
                          isMissing
                            ? locked
                              ? 'bg-[#D3F9D8] border-[#52B788] text-[#1B4332]'
                              : 'bg-[#FFF3BF] border-[#FFCA3A] text-[#A67800]'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {isMissing ? (locked ? ch : '?') : ch}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-4 lg:grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-md">
                {currentLit.letterOptions.map((letter) => {
                  const correctChar = currentLit.target.name[currentLit.missingIndex];
                  const isShaking = wrongId === letter;
                  const isRight = locked && letter === correctChar;
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        if (letter === correctChar) {
                          handleCorrect(currentLit.target.name.toLowerCase());
                        } else {
                          handleWrong(letter);
                        }
                      }}
                      className={`btn-3d flex h-16 sm:h-20 items-center justify-center rounded-2xl sm:rounded-3xl font-display text-3xl sm:text-4xl font-bold border-4 cursor-pointer ${
                        isRight
                          ? 'bg-[#6BCB77] border-[#3D9E49] text-white'
                          : 'bg-white border-rose-200 text-[#FF6B6B] hover:bg-rose-50'
                      } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}

        {mode === 'rhyme' && currentRhyme && (
          <div className="activity-split">
            <div className="flex flex-col items-center gap-1.5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-rose-200 px-6 py-3 sm:px-8 sm:py-5 card-3d shrink-0">
              <FigureSvg figureId={currentRhyme.anchor.id} size={76} className="sm:w-[98px] sm:h-[98px]" />
              <span className="font-display text-xl sm:text-2xl font-bold text-[#FF6B6B]">
                {currentRhyme.anchor.name}
              </span>
            </div>

            <div
              className={`grid w-full max-w-2xl gap-2.5 sm:gap-4 ${
                currentRhyme.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentRhyme.options.map((fig) => {
                const isShaking = wrongId === fig.id;
                const isRight = locked && fig.id === currentRhyme.match.id;
                return (
                  <button
                    key={fig.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (fig.id === currentRhyme.match.id) {
                        handleCorrect(
                          `${currentRhyme.anchor.name.toLowerCase()} rima com ${fig.name.toLowerCase()}!`
                        );
                      } else {
                        handleWrong(fig.id);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-rose-100 hover:border-rose-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={fig.id} size={66} className="sm:w-[84px] sm:h-[84px]" />
                    <span className="font-display text-xs sm:text-lg font-bold text-slate-700 truncate max-w-full">
                      {fig.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'syllable' && currentSyllable && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => {
                sfx('pop');
                say(currentSyllable.target.name);
              }}
              className="flex flex-col items-center gap-2 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-rose-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d cursor-pointer hover:border-rose-300 shrink-0"
            >
              <FigureSvg figureId={currentSyllable.target.id} size={82} className="sm:w-[104px] sm:h-[104px]" />
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {locked ? (
                  currentSyllable.target.syllables.map((syl, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl sm:rounded-2xl bg-[#D3F9D8] border-2 border-[#52B788] px-2.5 py-0.5 sm:px-3 sm:py-1 font-display text-base sm:text-xl font-bold text-[#1B4332]"
                    >
                      {syl}
                    </span>
                  ))
                ) : (
                  <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                    {currentSyllable.target.name}
                  </span>
                )}
              </div>
            </button>

            <div className="grid grid-cols-4 lg:grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-lg">
              {currentSyllable.options.map((count) => {
                const isShaking = wrongId === String(count);
                const isRight = locked && count === currentSyllable.syllableCount;
                return (
                  <button
                    key={count}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (count === currentSyllable.syllableCount) {
                        handleCorrect(
                          `${currentSyllable.target.name.toLowerCase()} tem ${count} ${count === 1 ? 'sílaba' : 'sílabas'}!`
                        );
                      } else {
                        handleWrong(String(count));
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl sm:rounded-3xl py-3 sm:py-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : 'bg-white border-rose-200 text-[#FF6B6B] hover:bg-rose-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <span className="font-display text-3xl sm:text-4xl font-bold">{count}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: count }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                            isRight ? 'bg-white' : 'bg-[#FF6B6B]'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'syllable-start' && currentInitSyl && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => {
                sfx('pop');
                say(currentInitSyl.target.name);
              }}
              className="flex flex-col items-center gap-2 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-rose-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d cursor-pointer hover:border-rose-300 shrink-0"
            >
              <FigureSvg figureId={currentInitSyl.target.id} size={82} className="sm:w-[106px] sm:h-[106px]" />
              <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                {currentInitSyl.target.name}
              </span>
            </button>

            <div
              className={`grid gap-2.5 sm:gap-4 w-full max-w-lg ${
                currentInitSyl.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentInitSyl.options.map((syl) => {
                const isShaking = wrongId === syl;
                const isRight = locked && syl === currentInitSyl.correctSyllable;
                return (
                  <button
                    key={syl}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (syl === currentInitSyl.correctSyllable) {
                        handleCorrect(currentInitSyl.target.name.toLowerCase());
                      } else {
                        handleWrong(syl);
                      }
                    }}
                    className={`btn-3d flex h-16 sm:h-20 items-center justify-center rounded-2xl sm:rounded-3xl font-display text-2xl sm:text-3xl font-bold border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : 'bg-white border-rose-200 text-[#FF6B6B] hover:bg-rose-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {syl}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'build' && currentBuilder && (
          <div className="activity-split">
            <div className="flex flex-col items-center gap-2.5 sm:gap-4 bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 border-4 border-rose-100 card-3d w-full max-w-md">
              <FigureSvg figureId={currentBuilder.target.id} size={84} className="sm:w-[112px] sm:h-[112px]" />
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                {currentBuilder.target.name.split('').map((ch, idx) => {
                  const filled = idx < usedLetterUids.length;
                  return (
                    <div
                      key={idx}
                      className={`flex h-11 w-10 sm:h-14 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl font-display text-2xl sm:text-3xl font-bold border-3 ${
                        filled
                          ? 'bg-[#D3F9D8] border-[#52B788] text-[#1B4332]'
                          : 'bg-[#FFF3BF] border-[#FFCA3A] text-[#A67800]'
                      }`}
                    >
                      {filled ? ch : '?'}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full max-w-md">
              {currentBuilder.letters.map((item) => {
                const isUsed = usedLetterUids.includes(item.uid);
                const isShaking = wrongId === item.uid;
                return (
                  <button
                    key={item.uid}
                    type="button"
                    disabled={locked || isUsed}
                    onClick={() => {
                      const expectedChar = currentBuilder.target.name[usedLetterUids.length];
                      if (item.char === expectedChar) {
                        sfx('pop');
                        const nextUsed = [...usedLetterUids, item.uid];
                        setUsedLetterUids(nextUsed);
                        if (nextUsed.length >= currentBuilder.target.name.length) {
                          handleCorrect(currentBuilder.target.name.toLowerCase());
                        }
                      } else {
                        handleWrong(item.uid);
                      }
                    }}
                    className={`btn-3d flex h-14 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl font-display text-2xl sm:text-3xl font-bold border-4 cursor-pointer ${
                      isUsed
                        ? 'opacity-25 bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-white border-rose-200 text-[#FF6B6B] hover:bg-rose-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    {item.char}
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
          onPlayAgain={() => resetMode(mode)}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
