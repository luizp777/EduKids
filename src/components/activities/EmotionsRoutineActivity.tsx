import React, { useEffect, useState } from 'react';
import { Smile, Sun, Moon, HeartHandshake, ListOrdered, Heart } from 'lucide-react';
import { useApp, type RoundReward } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES, FIGURES } from '../../data/catalog';
import { pickRandom, shuffle } from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { FigureId, MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { LumiPromptBanner } from '../ui/LumiPromptBanner';
import { FigureSvg } from '../illustrations/FigureSvg';

interface Props {
  onBack: () => void;
}

type EmotionMode = 'feelings' | 'day-night' | 'habits' | 'routine-order' | 'empathy';
type FeelingId = 'feliz' | 'triste' | 'surpreso' | 'sono' | 'calmo' | 'bravo';

const FEELINGS: { id: FeelingId; label: string; color: string }[] = [
  { id: 'feliz', label: 'Feliz', color: '#FFCA3A' },
  { id: 'triste', label: 'Triste', color: '#74B9FF' },
  { id: 'surpreso', label: 'Surpreso', color: '#FF924C' },
  { id: 'sono', label: 'Com Sono', color: '#B57BFF' },
  { id: 'calmo', label: 'Calmo', color: '#52B788' },
  { id: 'bravo', label: 'Bravo', color: '#FF595E' },
];

const FEELING_QUESTIONS: { situation: string; answer: FeelingId }[] = [
  { situation: 'Ganhou um abraço bem apertado!', answer: 'feliz' },
  { situation: 'O sorvete caiu no chão!', answer: 'triste' },
  { situation: 'Abriu um presente surpresa!', answer: 'surpreso' },
  { situation: 'Hora de dormir na caminha!', answer: 'sono' },
  { situation: 'Respirar fundo olhando o jardim!', answer: 'calmo' },
  { situation: 'O brinquedo quebrou sem querer!', answer: 'bravo' },
  { situation: 'Brincar no parque com os amigos!', answer: 'feliz' },
  { situation: 'O amigo foi embora mais cedo!', answer: 'triste' },
  { situation: 'Viu um arco-íris gigante no céu!', answer: 'surpreso' },
  { situation: 'Ouvir uma historinha calminha antes de dormir!', answer: 'calmo' },
];

const DAY_NIGHT_ITEMS: { label: string; figureId: FigureId; period: 'day' | 'night' }[] = [
  { label: 'Sol brilhando', figureId: 'sol', period: 'day' },
  { label: 'Brincar com a bola', figureId: 'bola', period: 'day' },
  { label: 'Lua no céu', figureId: 'lua', period: 'night' },
  { label: 'Ver as estrelas', figureId: 'estrela', period: 'night' },
  { label: 'Passear no jardim', figureId: 'flor', period: 'day' },
  { label: 'Ver o arco-íris', figureId: 'arcoiris', period: 'day' },
  { label: 'Ouvir os passarinhos', figureId: 'passaro', period: 'day' },
  { label: 'Andar de carro ao passeio', figureId: 'carro', period: 'day' },
  { label: 'Ler historinha na cama', figureId: 'livro', period: 'night' },
  { label: 'Dormir com o ursinho', figureId: 'urso', period: 'night' },
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
  {
    situation: 'Comer frutas refrescantes no calor!',
    answerLabel: 'Comer Melancia',
    answerFigure: 'melancia',
    distractorLabel: 'Jogar Dado',
    distractorFigure: 'dado',
  },
  {
    situation: 'Aprender e descansar com uma história!',
    answerLabel: 'Ler um Livro',
    answerFigure: 'livro',
    distractorLabel: 'Andar de Avião',
    distractorFigure: 'aviao',
  },
  {
    situation: 'Comer uvas docinhas no lanche!',
    answerLabel: 'Comer Uva',
    answerFigure: 'uva',
    distractorLabel: 'Soltar Foguete',
    distractorFigure: 'foguete',
  },
  {
    situation: 'Tomar café da manhã saudável!',
    answerLabel: 'Comer Pão',
    answerFigure: 'pao',
    distractorLabel: 'Brincar de Carro',
    distractorFigure: 'carro',
  },
];

interface RoutineStepItem {
  id: string;
  order: number;
  label: string;
  figureId: FigureId;
}

interface RoutineOrderQuestion {
  title: string;
  items: RoutineStepItem[];
}

const ROUTINE_SEQUENCES: { title: string; steps: { label: string; figureId: FigureId }[] }[] = [
  {
    title: 'Rotina da Manhã: do começo ao fim!',
    steps: [
      { label: 'Acordar com o Sol', figureId: 'sol' },
      { label: 'Tomar Café', figureId: 'pao' },
      { label: 'Brincar com Bola', figureId: 'bola' },
    ],
  },
  {
    title: 'Rotina da Noite: antes de dormir!',
    steps: [
      { label: 'Comer Fruta', figureId: 'maca' },
      { label: 'Ler Historinha', figureId: 'livro' },
      { label: 'Dormir na Lua', figureId: 'lua' },
    ],
  },
  {
    title: 'Ciclo da Florzinha no Jardim!',
    steps: [
      { label: 'Chuva da Nuvem', figureId: 'nuvem' },
      { label: 'Flor Crescendo', figureId: 'flor' },
      { label: 'Abelha Visitando', figureId: 'abelha' },
    ],
  },
  {
    title: 'Dia de Passeio Feliz!',
    steps: [
      { label: 'Lavar as Mãos', figureId: 'mao' },
      { label: 'Ir de Carro', figureId: 'carro' },
      { label: 'Chegar na Ilha', figureId: 'ilha' },
    ],
  },
];

function createRoutineOrderQuestions(): RoutineOrderQuestion[] {
  return shuffle(ROUTINE_SEQUENCES).map((seq, qIdx) => ({
    title: seq.title,
    items: shuffle(
      seq.steps.map((s, idx) => ({
        id: `rt-${qIdx}-${idx}`,
        order: idx + 1,
        label: s.label,
        figureId: s.figureId,
      }))
    ),
  }));
}

interface EmpathyQuestion {
  situation: string;
  options: { id: string; label: string; fig: FigureId; isRight: boolean }[];
}

const EMPATHY_RAW: {
  situation: string;
  rightLabel: string;
  rightFig: FigureId;
  wrongLabel: string;
  wrongFig: FigureId;
}[] = [
  {
    situation: 'O amigo caiu e ficou triste!',
    rightLabel: 'Dar Carinho e Flor',
    rightFig: 'flor',
    wrongLabel: 'Correr de Carro',
    wrongFig: 'carro',
  },
  {
    situation: 'O cachorrinho está com sede!',
    rightLabel: 'Dar Água Fresquinha',
    rightFig: 'nuvem',
    wrongLabel: 'Jogar Dado',
    wrongFig: 'dado',
  },
  {
    situation: 'Começou a chover no parque!',
    rightLabel: 'Abrigar na Casinha',
    rightFig: 'casa',
    wrongLabel: 'Soltar Foguete',
    wrongFig: 'foguete',
  },
  {
    situation: 'O amigo está com fome na hora do lanche!',
    rightLabel: 'Dividir a Maçã',
    rightFig: 'maca',
    wrongLabel: 'Brincar de Avião',
    wrongFig: 'aviao',
  },
  {
    situation: 'Está na hora de descansar!',
    rightLabel: 'Ler uma Historinha',
    rightFig: 'livro',
    wrongLabel: 'Jogar Bola',
    wrongFig: 'bola',
  },
];

function createEmpathyQuestions(): EmpathyQuestion[] {
  return shuffle(EMPATHY_RAW).map((item) => ({
    situation: item.situation,
    options: shuffle([
      { id: 'right', label: item.rightLabel, fig: item.rightFig, isRight: true },
      { id: 'wrong', label: item.wrongLabel, fig: item.wrongFig, isRight: false },
    ]),
  }));
}

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
        {id === 'calmo' && (
          <path d="M36 60 Q50 68 64 60" stroke="#2D3436" strokeWidth="4" fill="none" strokeLinecap="round" />
        )}
        {id === 'bravo' && (
          <>
            <path d="M28 33 L42 39 M72 33 L58 39" stroke="#2D3436" strokeWidth="4" strokeLinecap="round" />
            <path d="M35 68 Q50 56 65 68" stroke="#2D3436" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </>
        )}
      </>
    )}
  </svg>
);

/** Atividade de Emoções e Rotina: sentimentos, dia/noite, hábitos saudáveis, ordem da rotina e empatia. */
export const EmotionsRoutineActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [mode, setMode] = useState<EmotionMode>('feelings');
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [manualHint, setManualHint] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState<RoundReward | null>(null);
  const { schedule, clearAll } = useTimers();
  const showHint = (wrongAttempts >= 2 || manualHint) && !locked;

  const [feelingQs, setFeelingQs] = useState(() => shuffle(FEELING_QUESTIONS).slice(0, 5));
  const [dayNightQs, setDayNightQs] = useState(() => shuffle(DAY_NIGHT_ITEMS).slice(0, 5));
  const [habitQs, setHabitQs] = useState(() => createHabitQuestions().slice(0, 4));
  const [routineQs, setRoutineQs] = useState(() => createRoutineOrderQuestions());
  const [empathyQs, setEmpathyQs] = useState(() => createEmpathyQuestions().slice(0, 4));
  const [pickedRoutineIds, setPickedRoutineIds] = useState<string[]>([]);

  const totalSteps =
    mode === 'feelings'
      ? feelingQs.length
      : mode === 'day-night'
        ? dayNightQs.length
        : mode === 'routine-order'
          ? routineQs.length
          : mode === 'empathy'
            ? empathyQs.length
            : habitQs.length;

  const getPromptText = () => {
    if (mode === 'feelings') return 'Qual rostinho combina com essa situação?';
    if (mode === 'day-night') return 'Isso acontece de dia ou de noite?';
    if (mode === 'routine-order') return routineQs[step]?.title || 'Toque na ordem certa!';
    if (mode === 'empathy') return 'Como podemos ajudar o amigo?';
    return 'O que usamos para cuidar da nossa saúde?';
  };

  const getSpokenPrompt = () => {
    if (mode === 'feelings' && feelingQs[step]) {
      return `${feelingQs[step].situation} Qual rostinho combina com essa situação?`;
    }
    if (mode === 'day-night' && dayNightQs[step]) {
      return `${dayNightQs[step].label}! Isso acontece de dia ou de noite?`;
    }
    if (mode === 'routine-order' && routineQs[step]) {
      return `${routineQs[step].title} Toque do primeiro ao último passo!`;
    }
    if (mode === 'empathy' && empathyQs[step]) {
      return `${empathyQs[step].situation} Como podemos ajudar?`;
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
    setWrongAttempts(0);
    setManualHint(false);
    setLocked(false);
    setReward(null);
    setPickedRoutineIds([]);
    setFeelingQs(shuffle(FEELING_QUESTIONS).slice(0, 5));
    setDayNightQs(shuffle(DAY_NIGHT_ITEMS).slice(0, 5));
    setHabitQs(createHabitQuestions().slice(0, 4));
    setRoutineQs(createRoutineOrderQuestions());
    setEmpathyQs(createEmpathyQuestions().slice(0, 4));
  };

  const handleSuccess = (spokenFigureId?: FigureId) => {
    setLocked(true);
    setMood('excited');
    sfx('success');
    recordCorrectAnswer('emotions-routine');
    const praise = pickRandom(CELEBRATE_PHRASES);
    const figName = spokenFigureId
      ? FIGURES.find((f) => f.id === spokenFigureId)?.name
      : undefined;
    setFeedback(figName ? `${praise} ${figName}!` : praise);
    say(figName ? `${praise} Isso! ${figName.toLowerCase()}!` : praise);
    schedule(() => {
      if (step + 1 >= totalSteps) {
        sfx('celebration');
        setReward(completeRound('emotions-routine', 3));
      } else {
        setStep((s) => s + 1);
        setMood('happy');
        setFeedback('');
        setWrongAttempts(0);
        setManualHint(false);
        setLocked(false);
        setPickedRoutineIds([]);
      }
    }, 1150);
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

  const currentFeeling = feelingQs[step];
  const currentDN = dayNightQs[step];
  const currentHabit = habitQs[step];
  const currentRoutine = routineQs[step];
  const currentEmpathy = empathyQs[step];

  return (
    <div className="activity-shell bg-gradient-to-b from-[#E6F8FF] to-[#FFF9F0]">
      <ActivityHeader
        title="Emoções e Rotina"
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
        accentColor="#00BBF9"
      />

      <div className="activity-tabs activity-tabs-fade no-scrollbar snap-x">
        {[
          { id: 'feelings' as EmotionMode, label: 'Emoções', icon: Smile },
          { id: 'day-night' as EmotionMode, label: 'Dia e Noite', icon: Sun },
          { id: 'habits' as EmotionMode, label: 'Hábitos', icon: HeartHandshake },
          { id: 'routine-order' as EmotionMode, label: 'Ordem da Rotina', icon: ListOrdered },
          { id: 'empathy' as EmotionMode, label: 'Ajudar Amigo', icon: Heart },
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
                ? 'bg-[#00BBF9] text-white'
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
          borderClass="border-sky-100"
          onTap={() => say(getSpokenPrompt())}
        />

        {mode === 'feelings' && currentFeeling && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => say(getSpokenPrompt())}
              className="rounded-[24px] sm:rounded-[28px] bg-white border-4 border-sky-200 px-5 py-4 sm:px-6 sm:py-5 text-center card-3d max-w-md w-full cursor-pointer hover:border-sky-300 shrink-0"
            >
              <p className="font-display text-lg sm:text-2xl font-bold text-slate-800">
                {currentFeeling.situation}
              </p>
            </button>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-xl">
              {FEELINGS.map((f) => {
                const isShaking = wrongId === f.id;
                const isRight = locked && f.id === currentFeeling.answer;
                const isHinted = showHint && f.id === currentFeeling.answer;
                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      f.id === currentFeeling.answer ? handleSuccess() : handleWrong(f.id)
                    }
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-sky-100 hover:border-sky-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FeelingFaceSvg id={f.id} size={58} />
                    <span className="font-display text-xs sm:text-base font-bold text-slate-700">
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'day-night' && currentDN && (
          <div className="activity-split">
            <div className="flex flex-col items-center gap-1.5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-sky-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d shrink-0">
              <FigureSvg figureId={currentDN.figureId} size={82} className="sm:w-[104px] sm:h-[104px]" />
              <span className="font-display text-lg sm:text-xl font-bold text-slate-800">
                {currentDN.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              {[
                { id: 'day', label: 'Dia', icon: Sun, bg: '#FFCA3A', text: '#5C4100' },
                { id: 'night', label: 'Noite', icon: Moon, bg: '#5E1DB8', text: '#FFFFFF' },
              ].map(({ id, label, icon: Icon, bg, text }) => {
                const isShaking = wrongId === id;
                const isRight = locked && id === currentDN.period;
                const isHinted = showHint && id === currentDN.period;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      id === currentDN.period ? handleSuccess(currentDN.figureId) : handleWrong(id)
                    }
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-[24px] sm:rounded-[28px] py-5 sm:py-6 border-4 border-white cursor-pointer ${
                      isRight
                        ? 'ring-4 ring-[#52B788] scale-105'
                        : isHinted
                          ? 'ring-4 ring-[#FFCA3A] animate-pulse'
                          : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: bg, color: text }}
                  >
                    <Icon className="h-10 w-10 sm:h-12 sm:w-12" />
                    <span className="font-display text-xl sm:text-2xl font-bold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'habits' && currentHabit && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => say(getSpokenPrompt())}
              className="rounded-[24px] sm:rounded-[28px] bg-white border-4 border-sky-200 px-5 py-4 sm:px-6 sm:py-5 text-center card-3d max-w-md w-full cursor-pointer hover:border-sky-300 shrink-0"
            >
              <p className="font-display text-lg sm:text-2xl font-bold text-slate-800">
                {currentHabit.situation}
              </p>
            </button>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              {currentHabit.options.map((opt) => {
                const isShaking = wrongId === opt.id;
                const showRight = locked && opt.isRight;
                const isHinted = showHint && opt.isRight;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() => (opt.isRight ? handleSuccess(opt.fig) : handleWrong(opt.id))}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-4 cursor-pointer ${
                      showRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-sky-100 hover:border-sky-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={opt.fig} size={68} className="sm:w-[88px] sm:h-[88px]" />
                    <span className="font-display text-sm sm:text-lg font-bold text-slate-700 text-center">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {mode === 'routine-order' && currentRoutine && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-2xl">
            {currentRoutine.items.map((item) => {
              const pickedOrder = pickedRoutineIds.indexOf(item.id) + 1;
              const isPicked = pickedOrder > 0;
              const isShaking = wrongId === item.id;
              const expectedOrder = pickedRoutineIds.length + 1;
              const isHinted = showHint && !isPicked && item.order === expectedOrder;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={locked || isPicked}
                  onClick={() => {
                    if (item.order === expectedOrder) {
                      sfx('pop');
                      setWrongAttempts(0);
                      setManualHint(false);
                      const next = [...pickedRoutineIds, item.id];
                      setPickedRoutineIds(next);
                      if (next.length >= currentRoutine.items.length) {
                        handleSuccess();
                      }
                    } else {
                      handleWrong(item.id);
                    }
                  }}
                  className={`btn-3d relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border-4 cursor-pointer ${
                    isPicked
                      ? 'bg-[#D3F9D8] border-[#52B788] scale-95'
                      : isHinted
                        ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                        : 'bg-white border-sky-100 hover:border-sky-300'
                  } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                >
                  {isPicked && (
                    <span className="absolute top-2 right-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#52B788] font-display text-sm sm:text-lg font-bold text-white">
                      {pickedOrder}º
                    </span>
                  )}
                  <FigureSvg figureId={item.figureId} size={64} className="sm:w-[86px] sm:h-[86px]" />
                  <span className="font-display text-xs sm:text-lg font-bold text-slate-700 text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {mode === 'empathy' && currentEmpathy && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => say(getSpokenPrompt())}
              className="rounded-[24px] sm:rounded-[28px] bg-white border-4 border-sky-200 px-5 py-4 sm:px-6 sm:py-5 text-center card-3d max-w-md w-full cursor-pointer hover:border-sky-300 shrink-0"
            >
              <p className="font-display text-lg sm:text-2xl font-bold text-slate-800">
                {currentEmpathy.situation}
              </p>
            </button>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              {currentEmpathy.options.map((opt) => {
                const isShaking = wrongId === opt.id;
                const showRight = locked && opt.isRight;
                const isHinted = showHint && opt.isRight;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() => (opt.isRight ? handleSuccess(opt.fig) : handleWrong(opt.id))}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-4 cursor-pointer ${
                      showRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-sky-100 hover:border-sky-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={opt.fig} size={68} className="sm:w-[88px] sm:h-[88px]" />
                    <span className="font-display text-sm sm:text-lg font-bold text-slate-700 text-center">
                      {opt.label}
                    </span>
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
