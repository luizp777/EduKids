import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Palette,
  Hash,
  MessageCircleHeart,
  Compass,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp, type RoundReward } from '../../state/AppContext';
import { CELEBRATE_PHRASES, COLORS, ENCOURAGE_PHRASES, FIGURES } from '../../data/catalog';
import {
  COLOR_TRANSLATIONS,
  FIGURE_TRANSLATIONS,
  GREETINGS,
  NUMBER_TRANSLATIONS,
} from '../../data/languagesCatalog';
import {
  generateLangColorQuestions,
  generateLangGreetingQuestions,
  generateLangNumberQuestions,
  generateLangVocabQuestions,
  pickRandom,
  type LangColorQuestion,
  type LangGreetingQuestion,
  type LangNumberQuestion,
  type LangVocabQuestion,
} from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { ForeignLanguage, MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { LumiPromptBanner } from '../ui/LumiPromptBanner';
import { FigureSvg } from '../illustrations/FigureSvg';

interface Props {
  onBack: () => void;
}

type LangMode = 'vocab' | 'colors' | 'numbers' | 'greetings' | 'explore';
type ExploreCategory = 'figures' | 'colors' | 'numbers' | 'greetings';

const EXPLORE_TARGET = 6;

/** Atividade de Idiomas (Inglês e Espanhol): Vocabulário, Cores, Números, Cumprimentos e Cartões de Descoberta. */
export const LanguagesActivity: React.FC<Props> = ({ onBack }) => {
  const {
    activeProfile,
    setPreferredLanguage,
    recordCorrectAnswer,
    completeRound,
    say,
    sayClips,
    sfx,
  } = useApp();

  const [lang, setLang] = useState<ForeignLanguage>(activeProfile.preferredLanguage || 'en');
  const [mode, setMode] = useState<LangMode>('vocab');
  const [exploreCat, setExploreCat] = useState<ExploreCategory>('figures');
  const [exploreFigPage, setExploreFigPage] = useState(0);
  const [exploredKeys, setExploredKeys] = useState<string[]>([]);
  const [activeExploreLabel, setActiveExploreLabel] = useState<string>('');
  const [activeExploreClipId, setActiveExploreClipId] = useState<string>('');

  const [vocabQs, setVocabQs] = useState<LangVocabQuestion[]>(() =>
    generateLangVocabQuestions(activeProfile.preferredLanguage || 'en', activeProfile.ageLevel, 5)
  );
  const [colorQs, setColorQs] = useState<LangColorQuestion[]>(() =>
    generateLangColorQuestions(activeProfile.preferredLanguage || 'en', activeProfile.ageLevel, 4)
  );
  const [numberQs, setNumberQs] = useState<LangNumberQuestion[]>(() =>
    generateLangNumberQuestions(activeProfile.preferredLanguage || 'en', activeProfile.ageLevel, 5)
  );
  const [greetingQs, setGreetingQs] = useState<LangGreetingQuestion[]>(() =>
    generateLangGreetingQuestions(activeProfile.preferredLanguage || 'en', activeProfile.ageLevel, 4)
  );

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [manualHint, setManualHint] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState<RoundReward | null>(null);
  const [roundSeq, setRoundSeq] = useState(0);
  const { schedule, clearAll } = useTimers();

  const showHint = (wrongAttempts >= 2 || manualHint) && !locked;
  const isOlder = activeProfile.ageLevel === '5-6';

  const totalSteps =
    mode === 'vocab'
      ? vocabQs.length
      : mode === 'colors'
        ? colorQs.length
        : mode === 'numbers'
          ? numberQs.length
          : mode === 'greetings'
            ? greetingQs.length
            : EXPLORE_TARGET;

  const currentStepProgress = mode === 'explore' ? exploredKeys.length : step;

  const getCurrentClips = (): string[] => {
    if (mode === 'vocab') return vocabQs[step]?.promptClips || [];
    if (mode === 'colors') return colorQs[step]?.promptClips || [];
    if (mode === 'numbers') return numberQs[step]?.promptClips || [];
    if (mode === 'greetings') return greetingQs[step]?.promptClips || [];
    return activeExploreClipId ? [activeExploreClipId] : ['p-lang-explorar'];
  };

  const getCurrentNativeClip = (): string => {
    if (mode === 'vocab') return vocabQs[step]?.nativeClipId || '';
    if (mode === 'colors') return colorQs[step]?.nativeClipId || '';
    if (mode === 'numbers') return numberQs[step]?.nativeClipId || '';
    if (mode === 'greetings') return greetingQs[step]?.nativeClipId || '';
    return '';
  };

  const getPromptText = (): string => {
    if (mode === 'vocab') return vocabQs[step]?.promptText || '';
    if (mode === 'colors') return colorQs[step]?.promptText || '';
    if (mode === 'numbers') return numberQs[step]?.promptText || '';
    if (mode === 'greetings') return greetingQs[step]?.promptText || '';
    return activeExploreLabel || 'Toque em qualquer cartão para ouvir a pronúncia!';
  };

  useEffect(() => {
    if (reward) return;
    const clips = getCurrentClips();
    if (clips.length > 0) {
      sayClips(clips);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, mode, step, roundSeq, vocabQs, colorQs, numberQs, greetingQs]);

  const regenerateMode = (nextLang: ForeignLanguage, nextMode: LangMode) => {
    clearAll();
    setLang(nextLang);
    setMode(nextMode);
    setStep(0);
    setMood('happy');
    setFeedback('');
    setWrongId(null);
    setWrongAttempts(0);
    setManualHint(false);
    setLocked(false);
    setReward(null);
    setExploredKeys([]);
    setActiveExploreLabel('');
    setActiveExploreClipId('');
    setExploreFigPage(0);
    setRoundSeq((r) => r + 1);

    if (nextMode === 'vocab') {
      setVocabQs(generateLangVocabQuestions(nextLang, activeProfile.ageLevel, 5));
    } else if (nextMode === 'colors') {
      setColorQs(generateLangColorQuestions(nextLang, activeProfile.ageLevel, 4));
    } else if (nextMode === 'numbers') {
      setNumberQs(generateLangNumberQuestions(nextLang, activeProfile.ageLevel, 5));
    } else if (nextMode === 'greetings') {
      setGreetingQs(generateLangGreetingQuestions(nextLang, activeProfile.ageLevel, 4));
    }
  };

  const handleLanguageSwitch = (nextLang: ForeignLanguage) => {
    if (nextLang === lang) return;
    sfx('pop');
    setPreferredLanguage(nextLang);
    regenerateMode(nextLang, mode);
  };

  const handleCorrect = (wordLabel: string, nativeClipId: string) => {
    setLocked(true);
    setMood('excited');
    sfx('success');
    const praiseIdx = Math.floor(Math.random() * CELEBRATE_PHRASES.length);
    const praiseText = CELEBRATE_PHRASES[praiseIdx];
    setFeedback(`${praiseText} ${wordLabel}`);
    sayClips([`cel-${praiseIdx}`, nativeClipId]);
    recordCorrectAnswer('languages');

    schedule(() => {
      if (step + 1 >= totalSteps) {
        sfx('celebration');
        setReward(completeRound('languages', 3));
      } else {
        setStep((s) => s + 1);
        setMood('happy');
        setFeedback('');
        setWrongAttempts(0);
        setManualHint(false);
        setLocked(false);
      }
    }, 1500);
  };

  const handleWrong = (id: string) => {
    sfx('encourage');
    setMood('encouraging');
    setWrongId(id);
    setWrongAttempts((c) => c + 1);
    const phrase = pickRandom(ENCOURAGE_PHRASES);
    setFeedback(phrase);
    say(phrase);
    schedule(() => setWrongId(null), 480);
  };

  const handleExploreTap = (key: string, label: string, clipId: string) => {
    if (locked) return;
    sfx('pop');
    setMood('excited');
    setActiveExploreLabel(label);
    setActiveExploreClipId(clipId);
    sayClips([clipId]);

    if (!exploredKeys.includes(key)) {
      const next = [...exploredKeys, key];
      setExploredKeys(next);
      recordCorrectAnswer('languages');
      if (next.length >= EXPLORE_TARGET) {
        setLocked(true);
        schedule(() => {
          sfx('celebration');
          setReward(completeRound('languages', 3));
        }, 950);
      }
    }
  };

  const currentVocab = vocabQs[step];
  const currentColor = colorQs[step];
  const currentNumber = numberQs[step];
  const currentGreeting = greetingQs[step];
  const exploreNumbers = isOlder ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5];

  return (
    <div className="activity-shell bg-gradient-to-b from-[#EBF5FF] to-[#FFF9F0]">
      <ActivityHeader
        title={lang === 'en' ? 'Idiomas • Inglês' : 'Idiomas • Espanhol'}
        currentStep={currentStepProgress}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => sayClips(getCurrentClips())}
        onRequestHint={
          mode !== 'explore'
            ? () => {
                sfx('pop');
                setManualHint(true);
              }
            : undefined
        }
        hintActive={showHint}
        accentColor="#4F46E5"
      />

      {/* Integrated Language Pill (EN | ES) + 5 Sub-mode Tabs */}
      <div className="activity-tabs activity-tabs-fade no-scrollbar snap-x">
        <div
          role="group"
          aria-label="Escolher idioma"
          className="snap-start shrink-0 flex items-center rounded-2xl bg-indigo-100/90 p-1 border-2 border-indigo-200"
        >
          {(
            [
              { id: 'en' as ForeignLanguage, label: 'EN', full: 'Inglês' },
              { id: 'es' as ForeignLanguage, label: 'ES', full: 'Espanhol' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={lang === item.id}
              onClick={() => handleLanguageSwitch(item.id)}
              className={`min-h-9 sm:min-h-10 rounded-xl px-3 py-1.5 sm:px-3.5 font-display text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                lang === item.id
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'text-indigo-700 hover:bg-indigo-200/60'
              }`}
            >
              <span className="sm:hidden">{item.label}</span>
              <span className="hidden sm:inline">{item.full}</span>
            </button>
          ))}
        </div>

        {[
          { id: 'vocab' as LangMode, label: 'Vocabulário', icon: BookOpen },
          { id: 'colors' as LangMode, label: 'Cores', icon: Palette },
          { id: 'numbers' as LangMode, label: 'Números', icon: Hash },
          { id: 'greetings' as LangMode, label: 'Cumprimentos', icon: MessageCircleHeart },
          { id: 'explore' as LangMode, label: 'Explorar', icon: Compass },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={(e) => {
              sfx('pop');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              regenerateMode(lang, id);
            }}
            className={`btn-3d snap-start shrink-0 flex items-center gap-1.5 rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 font-display text-xs sm:text-base font-bold cursor-pointer ${
              mode === id
                ? 'bg-[#4F46E5] text-white'
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
          borderClass="border-indigo-100"
          badge={lang === 'en' ? 'EN' : 'ES'}
          badgeClass="bg-indigo-100 text-indigo-700"
          onTap={() => sayClips(getCurrentClips())}
        />

        {/* Mode 1: Vocabulary */}
        {mode === 'vocab' && currentVocab && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => sayClips([getCurrentNativeClip()])}
              className="btn-3d flex flex-col items-center gap-1.5 rounded-[28px] bg-gradient-to-br from-[#0EA5E9] to-[#4F46E5] px-7 py-4 sm:px-9 sm:py-5 text-white border-4 border-white cursor-pointer shrink-0"
            >
              <Volume2 className="h-9 w-9 sm:h-11 sm:w-11" />
              <span className="font-display text-2xl sm:text-3xl font-bold drop-shadow-xs">
                {currentVocab.word}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/85">
                Toque para ouvir
              </span>
            </button>

            <div
              className={`grid w-full max-w-2xl gap-2.5 sm:gap-4 ${
                currentVocab.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentVocab.options.map((fig) => {
                const isShaking = wrongId === fig.id;
                const isRight = locked && fig.id === currentVocab.target.id;
                const isHinted = showHint && fig.id === currentVocab.target.id;
                const showWordText = isRight || isOlder;
                return (
                  <button
                    key={fig.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (fig.id === currentVocab.target.id) {
                        handleCorrect(
                          `${currentVocab.word} (${fig.name})`,
                          currentVocab.nativeClipId
                        );
                      } else {
                        handleWrong(fig.id);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-indigo-100 hover:border-indigo-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={fig.id} size={70} className="sm:w-[88px] sm:h-[88px]" />
                    {showWordText && (
                      <span className="font-display text-xs sm:text-base font-bold text-slate-700 truncate max-w-full">
                        {isRight ? currentVocab.word : fig.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 2: Colors */}
        {mode === 'colors' && currentColor && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => sayClips([currentColor.nativeClipId])}
              className="btn-3d flex flex-col items-center gap-1.5 rounded-[28px] bg-gradient-to-br from-[#0EA5E9] to-[#4F46E5] px-7 py-4 sm:px-9 sm:py-5 text-white border-4 border-white cursor-pointer shrink-0"
            >
              <Volume2 className="h-9 w-9 sm:h-11 sm:w-11" />
              <span className="font-display text-2xl sm:text-3xl font-bold drop-shadow-xs">
                {currentColor.word}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/85">
                Ouvir cor
              </span>
            </button>

            <div
              className={`grid w-full max-w-xl gap-3 sm:gap-4 ${
                currentColor.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentColor.options.map((col) => {
                const isShaking = wrongId === col.id;
                const isRight = locked && col.id === currentColor.target.id;
                const isHinted = showHint && col.id === currentColor.target.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (col.id === currentColor.target.id) {
                        handleCorrect(
                          `${currentColor.word} (${col.name})`,
                          currentColor.nativeClipId
                        );
                      } else {
                        handleWrong(col.id);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-indigo-100 hover:border-indigo-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <span
                      className="h-14 w-14 sm:h-18 sm:w-18 rounded-full border-4 border-white ring-1 ring-slate-200 shadow-md"
                      style={{ backgroundColor: col.hex }}
                    />
                    {(isRight || isOlder) && (
                      <span className="font-display text-xs sm:text-base font-bold text-slate-700">
                        {isRight ? currentColor.word : col.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 3: Numbers */}
        {mode === 'numbers' && currentNumber && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => sayClips([currentNumber.nativeClipId])}
              className="btn-3d flex flex-col items-center gap-1.5 rounded-[28px] bg-gradient-to-br from-[#0EA5E9] to-[#4F46E5] px-7 py-4 sm:px-9 sm:py-5 text-white border-4 border-white cursor-pointer shrink-0"
            >
              <Volume2 className="h-9 w-9 sm:h-11 sm:w-11" />
              <span className="font-display text-2xl sm:text-3xl font-bold drop-shadow-xs">
                {currentNumber.word}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/85">
                Ouvir número
              </span>
            </button>

            <div
              className={`grid w-full max-w-lg gap-2.5 sm:gap-4 ${
                currentNumber.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-2'
              }`}
            >
              {currentNumber.options.map((num) => {
                const isShaking = wrongId === String(num);
                const isRight = locked && num === currentNumber.target;
                const isHinted = showHint && num === currentNumber.target;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (num === currentNumber.target) {
                        handleCorrect(
                          `${currentNumber.word} (${num})`,
                          currentNumber.nativeClipId
                        );
                      } else {
                        handleWrong(String(num));
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl sm:rounded-3xl py-3.5 sm:py-5 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] text-[#A67800] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-indigo-200 text-[#4F46E5] hover:bg-indigo-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <span className="font-display text-4xl sm:text-5xl font-bold">{num}</span>
                    {num <= 6 && (
                      <div className="flex flex-wrap justify-center gap-1 max-w-[64px]">
                        {Array.from({ length: num }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-2 w-2 rounded-full ${isRight ? 'bg-white' : 'bg-[#4F46E5]'}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 4: Greetings */}
        {mode === 'greetings' && currentGreeting && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => sayClips([currentGreeting.nativeClipId])}
              className="btn-3d flex flex-col items-center gap-1.5 rounded-[28px] bg-gradient-to-br from-[#0EA5E9] to-[#4F46E5] px-7 py-4 sm:px-9 sm:py-5 text-white border-4 border-white cursor-pointer shrink-0"
            >
              <Volume2 className="h-9 w-9 sm:h-11 sm:w-11" />
              <span className="font-display text-2xl sm:text-3xl font-bold drop-shadow-xs">
                {currentGreeting.word}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/85">
                Ouvir expressão
              </span>
            </button>

            <div
              className={`grid w-full max-w-2xl gap-2.5 sm:gap-4 ${
                currentGreeting.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {currentGreeting.options.map((greet) => {
                const isShaking = wrongId === greet.id;
                const isRight = locked && greet.id === currentGreeting.target.id;
                const isHinted = showHint && greet.id === currentGreeting.target.id;
                return (
                  <button
                    key={greet.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (greet.id === currentGreeting.target.id) {
                        handleCorrect(
                          `${currentGreeting.word} (${greet.ptLabel})`,
                          currentGreeting.nativeClipId
                        );
                      } else {
                        handleWrong(greet.id);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-indigo-100 hover:border-indigo-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={greet.figureId} size={66} className="sm:w-[82px] sm:h-[82px]" />
                    <span className="font-display text-xs sm:text-base font-bold text-slate-700 text-center">
                      {greet.ptLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 5: Explore Flashcards (free discovery with reward after 6 cards) */}
        {mode === 'explore' && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {(
                [
                  { id: 'figures' as ExploreCategory, label: 'Figuras' },
                  { id: 'colors' as ExploreCategory, label: 'Cores' },
                  { id: 'numbers' as ExploreCategory, label: 'Números' },
                  { id: 'greetings' as ExploreCategory, label: 'Cumprimentos' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={exploreCat === cat.id}
                  onClick={() => {
                    sfx('pop');
                    setExploreCat(cat.id);
                    setActiveExploreLabel('');
                    setActiveExploreClipId('');
                  }}
                  className={`rounded-xl px-3 py-1.5 font-display text-xs sm:text-sm font-bold border-2 cursor-pointer transition-colors ${
                    exploreCat === cat.id
                      ? 'bg-indigo-100 border-[#4F46E5] text-[#4F46E5]'
                      : 'bg-white border-indigo-100 text-slate-600 hover:bg-indigo-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {exploreCat === 'figures' && (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5 w-full">
                  {FIGURES.slice(exploreFigPage * 12, exploreFigPage * 12 + 12).map((fig) => {
                    const word = FIGURE_TRANSLATIONS[fig.id][lang];
                    const key = `fig-${fig.id}`;
                    const seen = exploredKeys.includes(key);
                    return (
                      <button
                        key={fig.id}
                        type="button"
                        disabled={locked}
                        onClick={() =>
                          handleExploreTap(key, `${word} = ${fig.name}`, `lang-${lang}-fig-${fig.id}`)
                        }
                        className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 border-3 cursor-pointer ${
                          seen
                            ? 'bg-[#E0E7FF] border-[#4F46E5]'
                            : 'bg-white border-indigo-100 hover:border-indigo-300'
                        }`}
                      >
                        <FigureSvg figureId={fig.id} size={50} />
                        <span className="font-display text-xs sm:text-sm font-bold text-[#4F46E5] truncate max-w-full">
                          {word}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-full">
                          {fig.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={exploreFigPage === 0}
                    onClick={() => {
                      sfx('pop');
                      setExploreFigPage((p) => Math.max(0, p - 1));
                    }}
                    aria-label="Página anterior de figuras"
                    className="btn-3d flex h-10 w-10 items-center justify-center rounded-xl bg-white border-2 border-indigo-200 text-[#4F46E5] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[0, 1, 2].map((pageIdx) => (
                    <button
                      key={pageIdx}
                      type="button"
                      aria-pressed={exploreFigPage === pageIdx}
                      aria-label={`Página ${pageIdx + 1} de figuras`}
                      onClick={() => {
                        sfx('pop');
                        setExploreFigPage(pageIdx);
                      }}
                      className={`btn-3d flex h-10 min-w-10 items-center justify-center rounded-xl px-3 font-display text-sm sm:text-base font-bold border-2 cursor-pointer ${
                        exploreFigPage === pageIdx
                          ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                          : 'bg-white text-slate-600 border-indigo-100 hover:bg-indigo-50'
                      }`}
                    >
                      {pageIdx + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={exploreFigPage === 2}
                    onClick={() => {
                      sfx('pop');
                      setExploreFigPage((p) => Math.min(2, p + 1));
                    }}
                    aria-label="Próxima página de figuras"
                    className="btn-3d flex h-10 w-10 items-center justify-center rounded-xl bg-white border-2 border-indigo-200 text-[#4F46E5] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {exploreCat === 'colors' && (
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-lg">
                {COLORS.map((col) => {
                  const word = COLOR_TRANSLATIONS[col.id][lang];
                  const key = `col-${col.id}`;
                  const seen = exploredKeys.includes(key);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      disabled={locked}
                      onClick={() =>
                        handleExploreTap(key, `${word} = ${col.name}`, `lang-${lang}-color-${col.id}`)
                      }
                      className={`btn-3d flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3.5 border-3 cursor-pointer ${
                        seen
                          ? 'bg-[#E0E7FF] border-[#4F46E5]'
                          : 'bg-white border-indigo-100 hover:border-indigo-300'
                      }`}
                    >
                      <span
                        className="h-11 w-11 rounded-full border-3 border-white ring-1 ring-slate-200 shadow"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="font-display text-sm font-bold text-[#4F46E5]">{word}</span>
                      <span className="text-[11px] font-bold text-slate-400">{col.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {exploreCat === 'numbers' && (
              <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-xl">
                {exploreNumbers.map((num) => {
                  const word = NUMBER_TRANSLATIONS[num][lang];
                  const key = `num-${num}`;
                  const seen = exploredKeys.includes(key);
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={locked}
                      onClick={() =>
                        handleExploreTap(key, `${num} = ${word}`, `lang-${lang}-num-${num}`)
                      }
                      className={`btn-3d flex flex-col items-center justify-center gap-0.5 rounded-2xl py-3 px-2 border-3 cursor-pointer ${
                        seen
                          ? 'bg-[#E0E7FF] border-[#4F46E5]'
                          : 'bg-white border-indigo-100 hover:border-indigo-300'
                      }`}
                    >
                      <span className="font-display text-2xl sm:text-3xl font-bold text-slate-800">
                        {num}
                      </span>
                      <span className="font-display text-xs sm:text-sm font-bold text-[#4F46E5]">
                        {word}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {exploreCat === 'greetings' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-xl">
                {GREETINGS.map((g) => {
                  const word = g.translations[lang];
                  const key = `greet-${g.id}`;
                  const seen = exploredKeys.includes(key);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      disabled={locked}
                      onClick={() =>
                        handleExploreTap(key, `${word} = ${g.ptLabel}`, `lang-${lang}-greet-${g.id}`)
                      }
                      className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl p-3 border-3 cursor-pointer ${
                        seen
                          ? 'bg-[#E0E7FF] border-[#4F46E5]'
                          : 'bg-white border-indigo-100 hover:border-indigo-300'
                      }`}
                    >
                      <FigureSvg figureId={g.figureId} size={52} />
                      <span className="font-display text-sm sm:text-base font-bold text-[#4F46E5]">
                        {word}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">{g.ptLabel}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {reward && (
        <CelebrationModal
          starsAwarded={reward.starsAwarded}
          newStickerId={reward.newStickerId}
          newGoldenStickerId={reward.newGoldenStickerId}
          onPlayAgain={() => regenerateMode(lang, mode)}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
