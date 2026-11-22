import React, { useEffect, useState } from 'react';
import { BookOpen, PenLine, Music, Hand, Blocks } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES } from '../../data/catalog';
import {
  generateLiteracyQuestions,
  generateRhymeQuestions,
  generateSyllableQuestions,
  generateWordBuilderQuestions,
  pickRandom,
  type LiteracyQuestion,
  type RhymeQuestion,
  type SyllableQuestion,
  type WordBuilderQuestion,
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

type LiteracyMode = 'initial' | 'complete' | 'rhyme' | 'syllable' | 'build';

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
        : mode === 'build'
          ? builderQs.length
          : questions.length;

  const getSpokenPrompt = () => {
    if (mode === 'rhyme') return rhymeQs[step]?.spokenPrompt || '';
    if (mode === 'syllable') return syllableQs[step]?.spokenPrompt || '';
    if (mode === 'build') return builderQs[step]?.spokenPrompt || '';
    return questions[step]?.spokenPrompt || '';
  };

  const getPromptText = () => {
    if (mode === 'rhyme') return rhymeQs[step]?.promptText || '';
    if (mode === 'syllable') return syllableQs[step]?.promptText || '';
    if (mode === 'build') return 'Toque nas letras na ordem certa!';
    return questions[step]?.promptText || '';
  };

  useEffect(() => {
    const prompt = getSpokenPrompt();
    if (prompt && !reward) {
      say(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step, questions, rhymeQs, syllableQs, builderQs]);

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
  const currentBuilder = builderQs[step];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF3F0] to-[#FFF9F0]">
      <ActivityHeader
        title="Alfabetização"
        currentStep={step}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getSpokenPrompt())}
        accentColor="#FF6B6B"
      />

      {/* Sub-mode tabs */}
      <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
        {[
          { id: 'initial' as LiteracyMode, label: 'Som Inicial', icon: BookOpen },
          { id: 'complete' as LiteracyMode, label: 'Completar', icon: PenLine },
          { id: 'rhyme' as LiteracyMode, label: 'Rimas', icon: Music },
          { id: 'syllable' as LiteracyMode, label: 'Sílabas', icon: Hand },
          { id: 'build' as LiteracyMode, label: 'Montar', icon: Blocks },
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
                ? 'bg-[#FF6B6B] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4 w-full max-w-xl bg-white rounded-3xl p-4 border-2 border-rose-100 card-3d">
          <LumiMascot mood={mood} size={74} />
          <p className="font-display text-lg sm:text-2xl font-bold text-slate-800 leading-snug">
            {feedback || getPromptText()}
          </p>
        </div>

        {(mode === 'initial' || mode === 'complete') && currentLit && (
          currentLit.mode === 'initial-letter' ? (
            <>
              <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-[28px] bg-[#FF6B6B] border-4 border-white shadow-xl">
                <span className="font-display text-6xl sm:text-7xl font-bold text-white drop-shadow">
                  {currentLit.target.letter}
                </span>
              </div>

              <div
                className={`grid w-full max-w-2xl gap-4 ${
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
                      className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-3xl p-4 sm:p-5 border-4 cursor-pointer ${
                        isRevealedCorrect
                          ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                          : 'bg-white border-rose-100 hover:border-rose-300'
                      } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                    >
                      <FigureSvg figureId={fig.id} size={86} />
                      <span className="font-display text-base sm:text-lg font-bold text-slate-700">
                        {fig.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 bg-white rounded-[32px] p-6 border-4 border-rose-100 card-3d w-full max-w-md">
                <FigureSvg figureId={currentLit.target.id} size={116} />
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {currentLit.target.name.split('').map((ch, idx) => {
                    const isMissing = idx === currentLit.missingIndex;
                    return (
                      <div
                        key={idx}
                        className={`flex h-13 w-11 sm:h-15 sm:w-13 items-center justify-center rounded-2xl font-display text-3xl sm:text-4xl font-bold border-3 ${
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

              <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-md">
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
                      className={`btn-3d flex h-20 items-center justify-center rounded-3xl font-display text-4xl font-bold border-4 cursor-pointer ${
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
            </>
          )
        )}

        {mode === 'rhyme' && currentRhyme && (
          <>
            <div className="flex flex-col items-center gap-2 rounded-[32px] bg-white border-4 border-rose-200 px-8 py-5 card-3d">
              <FigureSvg figureId={currentRhyme.anchor.id} size={98} />
              <span className="font-display text-2xl font-bold text-[#FF6B6B]">
                {currentRhyme.anchor.name}
              </span>
            </div>

            <div
              className={`grid w-full max-w-2xl gap-4 ${
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
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-3xl p-4 sm:p-5 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-rose-100 hover:border-rose-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={fig.id} size={84} />
                    <span className="font-display text-base sm:text-lg font-bold text-slate-700">
                      {fig.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === 'syllable' && currentSyllable && (
          <>
            <button
              type="button"
              onClick={() => {
                sfx('pop');
                say(currentSyllable.target.name);
              }}
              className="flex flex-col items-center gap-3 rounded-[32px] bg-white border-4 border-rose-200 px-8 py-5 card-3d cursor-pointer hover:border-rose-300"
            >
              <FigureSvg figureId={currentSyllable.target.id} size={104} />
              <div className="flex flex-wrap items-center justify-center gap-2">
                {locked ? (
                  currentSyllable.target.syllables.map((syl, idx) => (
                    <span
                      key={idx}
                      className="rounded-2xl bg-[#D3F9D8] border-2 border-[#52B788] px-3 py-1 font-display text-xl font-bold text-[#1B4332]"
                    >
                      {syl}
                    </span>
                  ))
                ) : (
                  <span className="font-display text-2xl font-bold text-slate-800">
                    {currentSyllable.target.name}
                  </span>
                )}
              </div>
            </button>

            <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-lg">
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
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-3xl py-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : 'bg-white border-rose-200 text-[#FF6B6B] hover:bg-rose-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <span className="font-display text-4xl font-bold">{count}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: count }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2.5 w-2.5 rounded-full ${
                            isRight ? 'bg-white' : 'bg-[#FF6B6B]'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === 'build' && currentBuilder && (
          <>
            <div className="flex flex-col items-center gap-4 bg-white rounded-[32px] p-6 border-4 border-rose-100 card-3d w-full max-w-md">
              <FigureSvg figureId={currentBuilder.target.id} size={112} />
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {currentBuilder.target.name.split('').map((ch, idx) => {
                  const filled = idx < usedLetterUids.length;
                  return (
                    <div
                      key={idx}
                      className={`flex h-14 w-12 items-center justify-center rounded-2xl font-display text-3xl font-bold border-3 ${
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

            <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
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
                    className={`btn-3d flex h-18 w-16 items-center justify-center rounded-3xl font-display text-3xl font-bold border-4 cursor-pointer ${
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
