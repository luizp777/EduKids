import React, { useEffect, useState } from 'react';
import { Smile, Sun, Moon, HeartHandshake } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES } from '../../data/catalog';
import { pickRandom, shuffle } from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { FigureId, MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { FigureSvg } from '../illustrations/FigureSvg';
import { LumiMascot } from '../illustrations/LumiMascot';

interface Props {
  onBack: () => void;
}

type EmotionMode = 'feelings' | 'day-night' | 'habits';
type FeelingId = 'feliz' | 'triste' | 'surpreso' | 'sono';

const FEELINGS: { id: FeelingId; label: string; color: string }[] = [
  { id: 'feliz', label: 'Feliz', color: '#FFCA3A' },
  { id: 'triste', label: 'Triste', color: '#74B9FF' },
  { id: 'surpreso', label: 'Surpreso', color: '#FF924C' },
  { id: 'sono', label: 'Com Sono', color: '#B57BFF' },
];

const FEELING_QUESTIONS: { situation: string; answer: FeelingId }[] = [
  { situation: 'Ganhou um abraço bem apertado!', answer: 'feliz' },
  { situation: 'O sorvete caiu no chão!', answer: 'triste' },
  { situation: 'Abriu um presente surpresa!', answer: 'surpreso' },
  { situation: 'Hora de dormir na caminha!', answer: 'sono' },
];

const DAY_NIGHT_ITEMS: { label: string; figureId: FigureId; period: 'day' | 'night' }[] = [
  { label: 'Sol brilhando', figureId: 'sol', period: 'day' },
  { label: 'Brincar com a bola', figureId: 'bola', period: 'day' },
  { label: 'Lua no céu', figureId: 'lua', period: 'night' },
  { label: 'Ver as estrelas', figureId: 'estrela', period: 'night' },
  { label: 'Passear no jardim', figureId: 'flor', period: 'day' },
];

interface HabitOption {
  id: string;
  label: string;
  fig: FigureId;
  isRight: boolean;
}

interface HabitQuestion {
  situation: string;
  options: HabitOption[];
}

function createHabitQuestions(): HabitQuestion[] {
  return shuffle(HABIT_ITEMS).map((item) => ({
    situation: item.situation,
    options: shuffle([
      {
        id: 'right',
        label: item.answerLabel,
        fig: item.answerFigure,
        isRight: true,
      },
      {
        id: 'wrong',
        label: item.distractorLabel,
        fig: item.distractorFigure,
        isRight: false,
      },
    ]),
  }));
}

const HABIT_ITEMS: {
  situation: string;
  answerLabel: string;
  answerFigure: FigureId;
  distractorLabel: string;
  distractorFigure: FigureId;
}[] = [
  {
    situation: 'Hora do lanchinho saudável!',
    answerLabel: 'Comer Maçã',
    answerFigure: 'maca',
    distractorLabel: 'Jogar Dado',
    distractorFigure: 'dado',
  },
  {
    situation: 'Vamos comer uma fruta gostosa!',
    answerLabel: 'Comer Banana',
    answerFigure: 'banana',
    distractorLabel: 'Andar de Carro',
    distractorFigure: 'carro',
  },
  {
    situation: 'Lavar as mãos antes de comer!',
    answerLabel: 'Mão Limpa',
    answerFigure: 'mao',
    distractorLabel: 'Bola',
    distractorFigure: 'bola',
  },
  {
    situation: 'Brincar ao ar livre faz bem!',
    answerLabel: 'Brincar de Bola',
    answerFigure: 'bola',
    distractorLabel: 'Foguete',
    distractorFigure: 'foguete',
  },
];

const FeelingFaceSvg: React.FC<{ id: FeelingId; size?: number }> = ({ id, size = 76 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-label={id}>
    <circle
      cx="50"
      cy="50"
      r="42"
      fill={FEELINGS.find((f) => f.id === id)?.color || '#FFCA3A'}
      stroke="#FFFFFF"
      strokeWidth="4"
    />
    {id === 'sono' ? (
      <>
        <path d="M28 45 Q36 52 44 45" stroke="#2D3436" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M56 45 Q64 52 72 45" stroke="#2D3436" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="50" cy="68" rx="6" ry="8" fill="#2D3436" />
      </>
    ) : (
      <>
        <circle cx="36" cy="42" r="5" fill="#2D3436" />
        <circle cx="64" cy="42" r="5" fill="#2D3436" />
        {id === 'feliz' && (
          <path d="M32 58 Q50 76 68 58" stroke="#2D3436" strokeWidth="5" fill="none" strokeLinecap="round" />
        )}
        {id === 'triste' && (
          <path d="M34 68 Q50 54 66 68" stroke="#2D3436" strokeWidth="5" fill="none" strokeLinecap="round" />
        )}
        {id === 'surpreso' && (
          <circle cx="50" cy="64" r="9" fill="#2D3436" />
        )}
      </>
    )}
  </svg>
);

/** Atividade de Emoções e Rotina: sentimentos, dia/noite e hábitos saudáveis. */
export const EmotionsRoutineActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [mode, setMode] = useState<EmotionMode>('feelings');
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState<{ starsAwarded: number; newStickerId: string | null } | null>(null);
  const { schedule, clearAll } = useTimers();

  const [feelingQs, setFeelingQs] = useState(() => shuffle(FEELING_QUESTIONS));
  const [dayNightQs, setDayNightQs] = useState(() => shuffle(DAY_NIGHT_ITEMS).slice(0, 4));
  const [habitQs, setHabitQs] = useState(() => createHabitQuestions());

  const totalSteps =
    mode === 'feelings' ? feelingQs.length : mode === 'day-night' ? dayNightQs.length : habitQs.length;

  const getPromptText = () => {
    if (mode === 'feelings') return 'Qual rostinho combina com essa situação?';
    if (mode === 'day-night') return 'Isso acontece de dia ou de noite?';
    return 'O que usamos para cuidar da nossa saúde?';
  };

  const getSpokenPrompt = () => {
    if (mode === 'feelings' && feelingQs[step]) {
      return `${feelingQs[step].situation} Qual rostinho combina com essa situação?`;
    }
    if (mode === 'day-night' && dayNightQs[step]) {
      return `${dayNightQs[step].label}! Isso acontece de dia ou de noite?`;
    }
    if (mode === 'habits' && habitQs[step]) {
      return `${habitQs[step].situation} O que usamos para cuidar da nossa saúde?`;
    }
    return getPromptText();
  };

  useEffect(() => {
    if (!reward) say(getSpokenPrompt());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  const resetMode = (nextMode: EmotionMode) => {
    clearAll();
    setMode(nextMode);
    setStep(0);
    setMood('happy');
    setFeedback('');
    setWrongId(null);
    setLocked(false);
    setReward(null);
    setFeelingQs(shuffle(FEELING_QUESTIONS));
    setDayNightQs(shuffle(DAY_NIGHT_ITEMS).slice(0, 4));
    setHabitQs(createHabitQuestions());
  };

  const handleSuccess = () => {
    setLocked(true);
    setMood('excited');
    sfx('success');
    recordCorrectAnswer('emotions-routine');
    const praise = pickRandom(CELEBRATE_PHRASES);
    setFeedback(praise);
    say(praise);
    schedule(() => {
      if (step + 1 >= totalSteps) {
        sfx('celebration');
        setReward(completeRound('emotions-routine', 3));
      } else {
        setStep((s) => s + 1);
        setMood('happy');
        setFeedback('');
        setLocked(false);
      }
    }, 1150);
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

  const currentFeeling = feelingQs[step];
  const currentDN = dayNightQs[step];
  const currentHabit = habitQs[step];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#E6F8FF] to-[#FFF9F0]">
      <ActivityHeader
        title="Emoções e Rotina"
        currentStep={step}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getSpokenPrompt())}
        accentColor="#00BBF9"
      />

      <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
        {[
          { id: 'feelings' as EmotionMode, label: 'Emoções', icon: Smile },
          { id: 'day-night' as EmotionMode, label: 'Dia e Noite', icon: Sun },
          { id: 'habits' as EmotionMode, label: 'Hábitos', icon: HeartHandshake },
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
                ? 'bg-[#00BBF9] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4 w-full max-w-xl bg-white rounded-3xl p-4 border-2 border-sky-100 card-3d">
          <LumiMascot mood={mood} size={74} />
          <p className="font-display text-lg sm:text-xl font-bold text-slate-800">
            {feedback || getPromptText()}
          </p>
        </div>

        {mode === 'feelings' && currentFeeling && (
          <>
            <button
              type="button"
              onClick={() => say(getSpokenPrompt())}
              className="rounded-[28px] bg-white border-4 border-sky-200 px-6 py-5 text-center card-3d max-w-lg w-full cursor-pointer hover:border-sky-300"
            >
              <p className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                {currentFeeling.situation}
              </p>
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
              {FEELINGS.map((f) => {
                const isShaking = wrongId === f.id;
                const isRight = locked && f.id === currentFeeling.answer;
                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      f.id === currentFeeling.answer ? handleSuccess() : handleWrong(f.id)
                    }
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-3xl p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-sky-100 hover:border-sky-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FeelingFaceSvg id={f.id} size={74} />
                    <span className="font-display text-base font-bold text-slate-700">
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === 'day-night' && currentDN && (
          <>
            <div className="flex flex-col items-center gap-2 rounded-[32px] bg-white border-4 border-sky-200 px-8 py-5 card-3d">
              <FigureSvg figureId={currentDN.figureId} size={104} />
              <span className="font-display text-xl font-bold text-slate-800">
                {currentDN.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              {[
                { id: 'day', label: 'Dia', icon: Sun, bg: '#FFCA3A', text: '#5C4100' },
                { id: 'night', label: 'Noite', icon: Moon, bg: '#5E1DB8', text: '#FFFFFF' },
              ].map(({ id, label, icon: Icon, bg, text }) => {
                const isShaking = wrongId === id;
                const isRight = locked && id === currentDN.period;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={locked}
                    onClick={() => (id === currentDN.period ? handleSuccess() : handleWrong(id))}
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-[28px] py-6 border-4 border-white cursor-pointer ${
                      isRight ? 'ring-4 ring-[#52B788] scale-105' : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: bg, color: text }}
                  >
                    <Icon className="h-12 w-12" />
                    <span className="font-display text-2xl font-bold">{label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === 'habits' && currentHabit && (
          <>
            <button
              type="button"
              onClick={() => say(getSpokenPrompt())}
              className="rounded-[28px] bg-white border-4 border-sky-200 px-6 py-5 text-center card-3d max-w-lg w-full cursor-pointer hover:border-sky-300"
            >
              <p className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                {currentHabit.situation}
              </p>
            </button>

            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              {currentHabit.options.map((opt) => {
                const isShaking = wrongId === opt.id;
                const showRight = locked && opt.isRight;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() => (opt.isRight ? handleSuccess() : handleWrong(opt.id))}
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-3xl p-5 border-4 cursor-pointer ${
                      showRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-sky-100 hover:border-sky-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={opt.fig} size={88} />
                    <span className="font-display text-base sm:text-lg font-bold text-slate-700">
                      {opt.label}
                    </span>
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
