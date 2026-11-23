import React, { useEffect, useState } from 'react';
import {
  Trees,
  CloudSun,
  Waves,
  Cloud,
  Sprout,
  Compass,
  Sun,
  Umbrella,
  Glasses,
  Shirt,
  Moon,
  Recycle,
  Package,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, FIGURES } from '../../data/catalog';
import { pickRandom, shuffle } from '../../utils/gameGenerators';
import { useActivityFeedback } from '../../utils/useActivityFeedback';
import type { FigureId } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { LumiPromptBanner } from '../ui/LumiPromptBanner';
import { FigureSvg } from '../illustrations/FigureSvg';

interface Props {
  onBack: () => void;
}

type NatureMode = 'habitat' | 'weather' | 'plant-care' | 'nature-elements' | 'park-care';
type HabitatId = 'agua' | 'floresta' | 'ceu';

const HABITATS: { id: HabitatId; label: string; color: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'agua', label: 'Mar / Água', color: '#2563EB', icon: Waves },
  { id: 'floresta', label: 'Floresta / Terra', color: '#059669', icon: Trees },
  { id: 'ceu', label: 'Céu', color: '#EA580C', icon: Cloud },
];

const HABITAT_QUESTIONS: { figureId: FigureId; name: string; habitat: HabitatId }[] = [
  { figureId: 'peixe', name: 'PEIXE', habitat: 'agua' },
  { figureId: 'sapo', name: 'SAPO', habitat: 'agua' },
  { figureId: 'tartaruga', name: 'TARTARUGA', habitat: 'agua' },
  { figureId: 'pato', name: 'PATO', habitat: 'agua' },
  { figureId: 'elefante', name: 'ELEFANTE', habitat: 'floresta' },
  { figureId: 'urso', name: 'URSO', habitat: 'floresta' },
  { figureId: 'leao', name: 'LEÃO', habitat: 'floresta' },
  { figureId: 'cachorro', name: 'CACHORRO', habitat: 'floresta' },
  { figureId: 'gato', name: 'GATO', habitat: 'floresta' },
  { figureId: 'ovelha', name: 'OVELHA', habitat: 'floresta' },
  { figureId: 'abelha', name: 'ABELHA', habitat: 'ceu' },
  { figureId: 'borboleta', name: 'BORBOLETA', habitat: 'ceu' },
  { figureId: 'passaro', name: 'PÁSSARO', habitat: 'ceu' },
];

type WeatherIcon = React.ComponentType<{ className?: string }>;

const WEATHER_QUESTIONS: {
  weatherLabel: string;
  weatherFig: FigureId;
  answerLabel: string;
  answerColor: string;
  answerIcon: WeatherIcon;
  distractorLabel: string;
  distractorColor: string;
  distractorIcon: WeatherIcon;
}[] = [
  {
    weatherLabel: 'Dia de Sol!',
    weatherFig: 'sol',
    answerLabel: 'Boné e Água',
    answerColor: '#D97706',
    answerIcon: Sun,
    distractorLabel: 'Guarda-chuva',
    distractorColor: '#0284C7',
    distractorIcon: Umbrella,
  },
  {
    weatherLabel: 'Dia de Chuva!',
    weatherFig: 'nuvem',
    answerLabel: 'Guarda-chuva',
    answerColor: '#2563EB',
    answerIcon: Umbrella,
    distractorLabel: 'Óculos de Sol',
    distractorColor: '#EA580C',
    distractorIcon: Glasses,
  },
  {
    weatherLabel: 'Passeio na Ilha!',
    weatherFig: 'ilha',
    answerLabel: 'Protetor Solar',
    answerColor: '#D97706',
    answerIcon: Sun,
    distractorLabel: 'Casaco Pesado',
    distractorColor: '#7C3AED',
    distractorIcon: Shirt,
  },
  {
    weatherLabel: 'Dia de Arco-Íris!',
    weatherFig: 'arcoiris',
    answerLabel: 'Passear no Jardim',
    answerColor: '#059669',
    answerIcon: Trees,
    distractorLabel: 'Dormir no Escuro',
    distractorColor: '#475569',
    distractorIcon: Moon,
  },
  {
    weatherLabel: 'Noite Fresca!',
    weatherFig: 'lua',
    answerLabel: 'Pijama Quentinho',
    answerColor: '#7C3AED',
    answerIcon: Moon,
    distractorLabel: 'Roupa de Praia',
    distractorColor: '#EA580C',
    distractorIcon: Sun,
  },
  {
    weatherLabel: 'Dia Nublado!',
    weatherFig: 'nuvem',
    answerLabel: 'Casaco Leve',
    answerColor: '#2563EB',
    answerIcon: Shirt,
    distractorLabel: 'Óculos de Sol',
    distractorColor: '#D97706',
    distractorIcon: Glasses,
  },
  {
    weatherLabel: 'Noite Estrelada!',
    weatherFig: 'estrela',
    answerLabel: 'Cobertor Macio',
    answerColor: '#6D28D9',
    answerIcon: Moon,
    distractorLabel: 'Boné de Sol',
    distractorColor: '#D97706',
    distractorIcon: Sun,
  },
];

interface PlantCareOption {
  id: string;
  label: string;
  figureId: FigureId;
  isRight: boolean;
}

interface PlantCareQuestion {
  prompt: string;
  targetFig: FigureId;
  options: PlantCareOption[];
}

const PLANT_CARE_RAW: {
  prompt: string;
  targetFig: FigureId;
  rightLabel: string;
  rightFig: FigureId;
  wrongLabel: string;
  wrongFig: FigureId;
}[] = [
  {
    prompt: 'A florzinha está com sede! O que ajuda ela a crescer?',
    targetFig: 'flor',
    rightLabel: 'Água da Chuva',
    rightFig: 'nuvem',
    wrongLabel: 'Dado de Brinquedo',
    wrongFig: 'dado',
  },
  {
    prompt: 'A árvore precisa de luz e calor! Quem ajuda?',
    targetFig: 'arvore',
    rightLabel: 'Luz do Sol',
    rightFig: 'sol',
    wrongLabel: 'Carro de Corrida',
    wrongFig: 'carro',
  },
  {
    prompt: 'Quem ajuda a levar o pólen de flor em flor?',
    targetFig: 'flor',
    rightLabel: 'Abelha Amiga',
    rightFig: 'abelha',
    wrongLabel: 'Foguete Espacial',
    wrongFig: 'foguete',
  },
  {
    prompt: 'Qual bichinho também mora e cuida do jardim?',
    targetFig: 'arvore',
    rightLabel: 'Borboleta',
    rightFig: 'borboleta',
    wrongLabel: 'Avião',
    wrongFig: 'aviao',
  },
];

function createPlantCareQuestions(): PlantCareQuestion[] {
  return shuffle(PLANT_CARE_RAW).map((item) => ({
    prompt: item.prompt,
    targetFig: item.targetFig,
    options: shuffle([
      { id: 'right', label: item.rightLabel, figureId: item.rightFig, isRight: true },
      { id: 'wrong', label: item.wrongLabel, figureId: item.wrongFig, isRight: false },
    ]),
  }));
}

const NATURE_ELEMENT_QUESTIONS: { figureId: FigureId; name: string; place: HabitatId }[] = [
  { figureId: 'aviao', name: 'AVIÃO', place: 'ceu' },
  { figureId: 'foguete', name: 'FOGUETE', place: 'ceu' },
  { figureId: 'nuvem', name: 'NUVEM', place: 'ceu' },
  { figureId: 'arcoiris', name: 'ARCO-ÍRIS', place: 'ceu' },
  { figureId: 'estrela', name: 'ESTRELA', place: 'ceu' },
  { figureId: 'carro', name: 'CARRO', place: 'floresta' },
  { figureId: 'casa', name: 'CASA', place: 'floresta' },
  { figureId: 'arvore', name: 'ÁRVORE', place: 'floresta' },
  { figureId: 'flor', name: 'FLOR', place: 'floresta' },
  { figureId: 'ilha', name: 'ILHA', place: 'agua' },
  { figureId: 'peixe', name: 'PEIXE', place: 'agua' },
  { figureId: 'tartaruga', name: 'TARTARUGA', place: 'agua' },
];

const PARK_CARE_ITEMS: { figureId: FigureId; name: string; dest: 'nature' | 'store' }[] = [
  { figureId: 'flor', name: 'FLOR', dest: 'nature' },
  { figureId: 'arvore', name: 'ÁRVORE', dest: 'nature' },
  { figureId: 'borboleta', name: 'BORBOLETA', dest: 'nature' },
  { figureId: 'passaro', name: 'PÁSSARO', dest: 'nature' },
  { figureId: 'abelha', name: 'ABELHA', dest: 'nature' },
  { figureId: 'bola', name: 'BOLA', dest: 'store' },
  { figureId: 'livro', name: 'LIVRO', dest: 'store' },
  { figureId: 'dado', name: 'DADO', dest: 'store' },
  { figureId: 'carro', name: 'CARRO', dest: 'store' },
];

interface WeatherOption {
  id: string;
  label: string;
  color: string;
  icon: WeatherIcon;
  isRight: boolean;
}

interface WeatherQuestion {
  weatherLabel: string;
  weatherFig: FigureId;
  options: WeatherOption[];
}

function createWeatherQuestions(): WeatherQuestion[] {
  return shuffle(WEATHER_QUESTIONS).map((q) => ({
    weatherLabel: q.weatherLabel,
    weatherFig: q.weatherFig,
    options: shuffle([
      {
        id: 'right',
        label: q.answerLabel,
        color: q.answerColor,
        icon: q.answerIcon,
        isRight: true,
      },
      {
        id: 'wrong',
        label: q.distractorLabel,
        color: q.distractorColor,
        icon: q.distractorIcon,
        isRight: false,
      },
    ]),
  }));
}

/** Atividade de Natureza e Habitats: moradia dos animais, clima, cuidar da natureza, elementos e cuidar do parque. */
export const NatureHabitatsActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, isChallengeActive, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const challengeMode = isChallengeActive('nature-habitats');
  const [mode, setMode] = useState<NatureMode>('habitat');
  const [step, setStep] = useState(0);
  const {
    mood,
    setMood,
    feedback,
    setFeedback,
    wrongId,
    locked,
    setLocked,
    reward,
    setReward,
    showHint,
    schedule,
    resetFeedbackState,
    clearStepFeedback,
    requestManualHint,
    triggerWrongFeedback: handleWrong,
  } = useActivityFeedback({ say, sfx });

  const [habitatQs, setHabitatQs] = useState(() => shuffle(HABITAT_QUESTIONS).slice(0, challengeMode ? 6 : 5));
  const [weatherQs, setWeatherQs] = useState(() => createWeatherQuestions().slice(0, challengeMode ? 5 : 4));
  const [plantQs, setPlantQs] = useState(() => createPlantCareQuestions());
  const [elementQs, setElementQs] = useState(() => shuffle(NATURE_ELEMENT_QUESTIONS).slice(0, challengeMode ? 6 : 5));
  const [parkQs, setParkQs] = useState(() => shuffle(PARK_CARE_ITEMS).slice(0, challengeMode ? 6 : 5));

  const totalSteps =
    mode === 'habitat'
      ? habitatQs.length
      : mode === 'weather'
        ? weatherQs.length
        : mode === 'plant-care'
          ? plantQs.length
          : mode === 'park-care'
            ? parkQs.length
            : elementQs.length;

  const getPromptText = () => {
    if (mode === 'habitat') return 'Onde este bichinho mora?';
    if (mode === 'weather') return 'O que devemos usar neste clima?';
    if (mode === 'plant-care') return plantQs[step]?.prompt || 'Como cuidar da natureza?';
    if (mode === 'park-care') return 'Isso fica na Natureza ou devemos Guardar?';
    return 'Onde encontramos isso: Água, Terra ou Céu?';
  };

  const getSpokenPrompt = () => {
    if (mode === 'habitat' && habitatQs[step]) {
      return `Onde este bichinho mora? ${habitatQs[step].name}!`;
    }
    if (mode === 'weather' && weatherQs[step]) {
      return `${weatherQs[step].weatherLabel} O que devemos usar neste clima?`;
    }
    if (mode === 'plant-care' && plantQs[step]) {
      return plantQs[step].prompt;
    }
    if (mode === 'park-care' && parkQs[step]) {
      return `${parkQs[step].name.toLowerCase()} fica na natureza ou devemos guardar?`;
    }
    if (mode === 'nature-elements' && elementQs[step]) {
      return `Onde encontramos ${elementQs[step].name.toLowerCase()}?`;
    }
    return getPromptText();
  };

  useEffect(() => {
    if (!reward) say(getSpokenPrompt());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  const resetMode = (nextMode: NatureMode) => {
    resetFeedbackState();
    setMode(nextMode);
    setStep(0);
    setHabitatQs(shuffle(HABITAT_QUESTIONS).slice(0, challengeMode ? 6 : 5));
    setWeatherQs(createWeatherQuestions().slice(0, challengeMode ? 5 : 4));
    setPlantQs(createPlantCareQuestions());
    setElementQs(shuffle(NATURE_ELEMENT_QUESTIONS).slice(0, challengeMode ? 6 : 5));
    setParkQs(shuffle(PARK_CARE_ITEMS).slice(0, challengeMode ? 6 : 5));
  };

  const handleSuccess = (spokenFigureId?: FigureId) => {
    setLocked(true);
    setMood('excited');
    sfx('success');
    recordCorrectAnswer('nature-habitats');
    const praise = pickRandom(CELEBRATE_PHRASES);
    const figName = spokenFigureId
      ? FIGURES.find((f) => f.id === spokenFigureId)?.name
      : undefined;
    setFeedback(figName ? `${praise} ${figName}!` : praise);
    say(figName ? `${praise} Isso! ${figName.toLowerCase()}!` : praise);
    schedule(() => {
      if (step + 1 >= totalSteps) {
        sfx('celebration');
        setReward(completeRound('nature-habitats', 3));
      } else {
        setStep((s) => s + 1);
        clearStepFeedback();
      }
    }, 1150);
  };

  const currentHab = habitatQs[step];
  const currentWeather = weatherQs[step];
  const currentPlant = plantQs[step];
  const currentElement = elementQs[step];
  const currentPark = parkQs[step];

  return (
    <div className="activity-shell bg-gradient-to-b from-[#E6FFF5] to-[#FFF9F0]">
      <ActivityHeader
        title="Natureza e Habitats"
        currentStep={step}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getSpokenPrompt())}
        onRequestHint={requestManualHint}
        hintActive={showHint}
        accentColor="#10B981"
      />

      <div className="activity-tabs activity-tabs-fade no-scrollbar snap-x">
        {[
          { id: 'habitat' as NatureMode, label: 'Habitats', icon: Trees },
          { id: 'weather' as NatureMode, label: 'Clima', icon: CloudSun },
          { id: 'plant-care' as NatureMode, label: 'Cuidar da Natureza', icon: Sprout },
          { id: 'nature-elements' as NatureMode, label: 'Terra, Água ou Céu', icon: Compass },
          { id: 'park-care' as NatureMode, label: 'Cuidar do Parque', icon: Recycle },
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
            className={`btn-3d snap-start shrink-0 flex items-center gap-1.5 rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 font-display text-xs sm:text-base font-bold cursor-pointer ${
              mode === id
                ? 'bg-[#10B981] text-white'
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
          borderClass="border-emerald-100"
          onTap={() => say(getSpokenPrompt())}
        />

        {mode === 'habitat' && currentHab && (
          <div className="activity-split">
            <div className="flex flex-col items-center gap-1.5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-emerald-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d shrink-0">
              <FigureSvg figureId={currentHab.figureId} size={84} className="sm:w-[108px] sm:h-[108px]" />
              <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                {currentHab.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-xl">
              {HABITATS.map(({ id, label, color, icon: Icon }) => {
                const isShaking = wrongId === id;
                const isRight = locked && id === currentHab.habitat;
                const isHinted = showHint && id === currentHab.habitat;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      id === currentHab.habitat
                        ? handleSuccess(currentHab.figureId)
                        : handleWrong(id)
                    }
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-[24px] sm:rounded-[28px] py-4 sm:py-6 px-2.5 sm:px-3 text-white border-4 border-white cursor-pointer ${
                      isRight
                        ? 'ring-4 ring-[#FFCA3A] scale-105'
                        : isHinted
                          ? 'ring-4 ring-[#FFCA3A] animate-pulse'
                          : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                    <span className="font-display text-xs sm:text-lg font-bold text-center leading-tight">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'weather' && currentWeather && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => say(getSpokenPrompt())}
              className="flex flex-col items-center gap-1.5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-emerald-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d cursor-pointer hover:border-emerald-300 shrink-0"
            >
              <FigureSvg figureId={currentWeather.weatherFig} size={82} className="sm:w-[104px] sm:h-[104px]" />
              <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                {currentWeather.weatherLabel}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              {currentWeather.options.map((opt) => {
                const isShaking = wrongId === opt.id;
                const showRight = locked && opt.isRight;
                const isHinted = showHint && opt.isRight;
                const OptionIcon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() => (opt.isRight ? handleSuccess() : handleWrong(opt.id))}
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-[24px] sm:rounded-[28px] py-5 sm:py-6 px-3 sm:px-4 text-white border-4 border-white cursor-pointer ${
                      showRight
                        ? 'ring-4 ring-[#52B788] scale-105'
                        : isHinted
                          ? 'ring-4 ring-[#FFCA3A] animate-pulse'
                          : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: opt.color }}
                  >
                    <OptionIcon className="h-9 w-9 sm:h-11 sm:w-11 drop-shadow-xs" />
                    <span className="font-display text-base sm:text-xl font-bold text-center drop-shadow-xs leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {mode === 'plant-care' && currentPlant && (
          <div className="activity-split">
            <div className="flex flex-col items-center gap-1.5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-emerald-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d shrink-0">
              <FigureSvg figureId={currentPlant.targetFig} size={84} className="sm:w-[108px] sm:h-[108px]" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              {currentPlant.options.map((opt) => {
                const isShaking = wrongId === opt.id;
                const showRight = locked && opt.isRight;
                const isHinted = showHint && opt.isRight;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      opt.isRight ? handleSuccess(opt.figureId) : handleWrong(opt.id)
                    }
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-4 cursor-pointer ${
                      showRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-emerald-100 hover:border-emerald-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={opt.figureId} size={68} className="sm:w-[88px] sm:h-[88px]" />
                    <span className="font-display text-sm sm:text-lg font-bold text-slate-700 text-center">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'nature-elements' && currentElement && (
          <div className="activity-split">
            <div className="flex flex-col items-center gap-1.5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-emerald-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d shrink-0">
              <FigureSvg figureId={currentElement.figureId} size={84} className="sm:w-[108px] sm:h-[108px]" />
              <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                {currentElement.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-xl">
              {HABITATS.map(({ id, label, color, icon: Icon }) => {
                const isShaking = wrongId === id;
                const isRight = locked && id === currentElement.place;
                const isHinted = showHint && id === currentElement.place;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      id === currentElement.place
                        ? handleSuccess(currentElement.figureId)
                        : handleWrong(id)
                    }
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-[24px] sm:rounded-[28px] py-4 sm:py-6 px-2.5 sm:px-3 text-white border-4 border-white cursor-pointer ${
                      isRight
                        ? 'ring-4 ring-[#FFCA3A] scale-105'
                        : isHinted
                          ? 'ring-4 ring-[#FFCA3A] animate-pulse'
                          : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                    <span className="font-display text-xs sm:text-lg font-bold text-center leading-tight">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {mode === 'park-care' && currentPark && (
          <div className="activity-split">
            <div className="flex flex-col items-center gap-1.5 rounded-[28px] sm:rounded-[32px] bg-white border-4 border-emerald-200 px-6 py-3.5 sm:px-8 sm:py-5 card-3d shrink-0">
              <FigureSvg figureId={currentPark.figureId} size={84} className="sm:w-[108px] sm:h-[108px]" />
              <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                {currentPark.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              {[
                { id: 'nature' as const, label: 'Fica na Natureza', color: '#059669', icon: Trees },
                { id: 'store' as const, label: 'Guardar / Organizar', color: '#2563EB', icon: Package },
              ].map(({ id, label, color, icon: Icon }) => {
                const isShaking = wrongId === id;
                const isRight = locked && id === currentPark.dest;
                const isHinted = showHint && id === currentPark.dest;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      id === currentPark.dest
                        ? handleSuccess(currentPark.figureId)
                        : handleWrong(id)
                    }
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-[24px] sm:rounded-[28px] py-5 sm:py-6 px-3 sm:px-4 text-white border-4 border-white cursor-pointer ${
                      isRight
                        ? 'ring-4 ring-[#FFCA3A] scale-105'
                        : isHinted
                          ? 'ring-4 ring-[#FFCA3A] animate-pulse'
                          : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-9 w-9 sm:h-11 sm:w-11" />
                    <span className="font-display text-base sm:text-xl font-bold text-center leading-tight">
                      {label}
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
