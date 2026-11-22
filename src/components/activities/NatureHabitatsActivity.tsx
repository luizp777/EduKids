import React, { useEffect, useState } from 'react';
import { Trees, CloudSun, Waves, Cloud } from 'lucide-react';
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

type NatureMode = 'habitat' | 'weather';
type HabitatId = 'agua' | 'floresta' | 'ceu';

const HABITATS: { id: HabitatId; label: string; color: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'agua', label: 'Mar / Água', color: '#3A86FF', icon: Waves },
  { id: 'floresta', label: 'Floresta', color: '#52B788', icon: Trees },
  { id: 'ceu', label: 'Céu', color: '#FF9F43', icon: Cloud },
];

const HABITAT_QUESTIONS: { figureId: FigureId; name: string; habitat: HabitatId }[] = [
  { figureId: 'peixe', name: 'PEIXE', habitat: 'agua' },
  { figureId: 'sapo', name: 'SAPO', habitat: 'agua' },
  { figureId: 'elefante', name: 'ELEFANTE', habitat: 'floresta' },
  { figureId: 'urso', name: 'URSO', habitat: 'floresta' },
  { figureId: 'abelha', name: 'ABELHA', habitat: 'ceu' },
  { figureId: 'borboleta', name: 'BORBOLETA', habitat: 'ceu' },
];

const WEATHER_QUESTIONS: {
  weatherLabel: string;
  weatherFig: FigureId;
  answerLabel: string;
  answerColor: string;
  distractorLabel: string;
  distractorColor: string;
}[] = [
  {
    weatherLabel: 'Dia de Sol!',
    weatherFig: 'sol',
    answerLabel: 'Boné e Água',
    answerColor: '#FFCA3A',
    distractorLabel: 'Guarda-chuva',
    distractorColor: '#74B9FF',
  },
  {
    weatherLabel: 'Dia de Chuva!',
    weatherFig: 'nuvem',
    answerLabel: 'Guarda-chuva',
    answerColor: '#3A86FF',
    distractorLabel: 'Óculos de Sol',
    distractorColor: '#FF924C',
  },
  {
    weatherLabel: 'Passeio na Ilha!',
    weatherFig: 'ilha',
    answerLabel: 'Protetor Solar',
    answerColor: '#FF9F43',
    distractorLabel: 'Casaco Pesado',
    distractorColor: '#8338EC',
  },
];

interface WeatherOption {
  id: string;
  label: string;
  color: string;
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
        isRight: true,
      },
      {
        id: 'wrong',
        label: q.distractorLabel,
        color: q.distractorColor,
        isRight: false,
      },
    ]),
  }));
}

/** Atividade de Natureza e Habitats: moradia dos animais e vestuário por clima. */
export const NatureHabitatsActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [mode, setMode] = useState<NatureMode>('habitat');
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState<{ starsAwarded: number; newStickerId: string | null } | null>(null);
  const { schedule, clearAll } = useTimers();

  const [habitatQs, setHabitatQs] = useState(() => shuffle(HABITAT_QUESTIONS).slice(0, 4));
  const [weatherQs, setWeatherQs] = useState(() => createWeatherQuestions());

  const totalSteps = mode === 'habitat' ? habitatQs.length : weatherQs.length;

  const getPromptText = () =>
    mode === 'habitat' ? 'Onde este bichinho mora?' : 'O que devemos usar neste clima?';

  const getSpokenPrompt = () => {
    if (mode === 'habitat' && habitatQs[step]) {
      return `Onde este bichinho mora? ${habitatQs[step].name}!`;
    }
    if (mode === 'weather' && weatherQs[step]) {
      return `${weatherQs[step].weatherLabel} O que devemos usar neste clima?`;
    }
    return getPromptText();
  };

  useEffect(() => {
    if (!reward) say(getSpokenPrompt());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  const resetMode = (nextMode: NatureMode) => {
    clearAll();
    setMode(nextMode);
    setStep(0);
    setMood('happy');
    setFeedback('');
    setWrongId(null);
    setLocked(false);
    setReward(null);
    setHabitatQs(shuffle(HABITAT_QUESTIONS).slice(0, 4));
    setWeatherQs(createWeatherQuestions());
  };

  const handleSuccess = () => {
    setLocked(true);
    setMood('excited');
    sfx('success');
    recordCorrectAnswer('nature-habitats');
    const praise = pickRandom(CELEBRATE_PHRASES);
    setFeedback(praise);
    say(praise);
    schedule(() => {
      if (step + 1 >= totalSteps) {
        sfx('celebration');
        setReward(completeRound('nature-habitats', 3));
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

  const currentHab = habitatQs[step];
  const currentWeather = weatherQs[step];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#E6FFF5] to-[#FFF9F0]">
      <ActivityHeader
        title="Natureza e Habitats"
        currentStep={step}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getSpokenPrompt())}
        accentColor="#10B981"
      />

      <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
        {[
          { id: 'habitat' as NatureMode, label: 'Habitats', icon: Trees },
          { id: 'weather' as NatureMode, label: 'Clima', icon: CloudSun },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              sfx('pop');
              resetMode(id);
            }}
            className={`btn-3d flex items-center gap-1.5 rounded-2xl px-4 py-2 font-display text-sm sm:text-base font-bold cursor-pointer ${
              mode === id
                ? 'bg-[#10B981] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4 w-full max-w-xl bg-white rounded-3xl p-4 border-2 border-emerald-100 card-3d">
          <LumiMascot mood={mood} size={74} />
          <p className="font-display text-lg sm:text-xl font-bold text-slate-800">
            {feedback || getPromptText()}
          </p>
        </div>

        {mode === 'habitat' && currentHab && (
          <>
            <div className="flex flex-col items-center gap-2 rounded-[32px] bg-white border-4 border-emerald-200 px-8 py-5 card-3d">
              <FigureSvg figureId={currentHab.figureId} size={108} />
              <span className="font-display text-2xl font-bold text-slate-800">
                {currentHab.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-xl">
              {HABITATS.map(({ id, label, color, icon: Icon }) => {
                const isShaking = wrongId === id;
                const isRight = locked && id === currentHab.habitat;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={locked}
                    onClick={() => (id === currentHab.habitat ? handleSuccess() : handleWrong(id))}
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-[28px] py-6 px-3 text-white border-4 border-white cursor-pointer ${
                      isRight ? 'ring-4 ring-[#FFCA3A] scale-105' : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-10 w-10" />
                    <span className="font-display text-base sm:text-lg font-bold text-center">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === 'weather' && currentWeather && (
          <>
            <button
              type="button"
              onClick={() => say(getSpokenPrompt())}
              className="flex flex-col items-center gap-2 rounded-[32px] bg-white border-4 border-emerald-200 px-8 py-5 card-3d cursor-pointer hover:border-emerald-300"
            >
              <FigureSvg figureId={currentWeather.weatherFig} size={104} />
              <span className="font-display text-2xl font-bold text-slate-800">
                {currentWeather.weatherLabel}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              {currentWeather.options.map((opt) => {
                const isShaking = wrongId === opt.id;
                const showRight = locked && opt.isRight;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() => (opt.isRight ? handleSuccess() : handleWrong(opt.id))}
                    className={`btn-3d flex items-center justify-center rounded-[28px] py-7 px-4 text-white border-4 border-white cursor-pointer ${
                      showRight ? 'ring-4 ring-[#52B788] scale-105' : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: opt.color }}
                  >
                    <span className="font-display text-xl sm:text-2xl font-bold text-center drop-shadow-xs">
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
