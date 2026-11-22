import React, { useEffect, useState } from 'react';
import { Music, Sparkles, Volume2 } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES } from '../../data/catalog';
import { playMusicalNote } from '../../utils/audio';
import { generateAnimalSoundQuestions, pickRandom, type AnimalSoundQuestion } from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { FigureSvg } from '../illustrations/FigureSvg';
import { LumiMascot } from '../illustrations/LumiMascot';

interface Props {
  onBack: () => void;
}

type MusicMode = 'xylophone' | 'simon' | 'animals';

const XYLOPHONE_KEYS = [
  { note: 'Dó', color: '#FF595E', heightClass: 'h-48 sm:h-56' },
  { note: 'Ré', color: '#FF924C', heightClass: 'h-44 sm:h-52' },
  { note: 'Mi', color: '#FFCA3A', heightClass: 'h-40 sm:h-48' },
  { note: 'Fá', color: '#8AC926', heightClass: 'h-38 sm:h-44' },
  { note: 'Sol', color: '#52B788', heightClass: 'h-36 sm:h-40' },
  { note: 'Lá', color: '#3A86FF', heightClass: 'h-34 sm:h-38' },
  { note: 'Si', color: '#8338EC', heightClass: 'h-32 sm:h-36' },
  { note: 'Dó+', color: '#F15BB5', heightClass: 'h-30 sm:h-34' },
];

// Twinkle, Twinkle first phrase (0-based indices)
const MELODY_GUIDE = [0, 0, 4, 4, 5, 5, 4];

function createSimonSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * 5));
}

/** Atividade de Música e Sons: Xilofone Mágico, Memória Musical e Sons dos Bichos. */
export const MusicSoundsActivity: React.FC<Props> = ({ onBack }) => {
  const { state, activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [mode, setMode] = useState<MusicMode>('xylophone');
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const [reward, setReward] = useState<{ starsAwarded: number; newStickerId: string | null } | null>(null);
  const { schedule, clearAll } = useTimers();

  // Xylophone guided melody progress
  const [guideStep, setGuideStep] = useState(0);

  // Simon musical memory state
  const simonLen = activeProfile.ageLevel === '3-4' ? 3 : 4;
  const [simonSeq, setSimonSeq] = useState<number[]>(() => createSimonSequence(simonLen));
  const [simonUserIdx, setSimonUserIdx] = useState(0);
  const [simonPlaying, setSimonPlaying] = useState(false);
  const [simonRound, setSimonRound] = useState(0);

  // Animal sounds state
  const [animalQs, setAnimalQs] = useState<AnimalSoundQuestion[]>(() =>
    generateAnimalSoundQuestions(activeProfile.ageLevel, 4)
  );
  const [animalStep, setAnimalStep] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const playSimonSequence = (seq: number[]) => {
    clearAll();
    setSimonPlaying(true);
    setSimonUserIdx(0);
    setFeedback('Ouça a melodia com atenção!');
    say('Ouça a melodia com atenção!');

    seq.forEach((noteIdx, i) => {
      schedule(() => {
        setActiveKey(noteIdx);
        playMusicalNote(noteIdx, state.audio.sfxEnabled);
        schedule(() => setActiveKey(null), 350);
      }, 900 + i * 580);
    });

    schedule(() => {
      setSimonPlaying(false);
      setFeedback('Agora é a sua vez! Repita a melodia!');
      say('Agora é a sua vez! Repita a melodia!');
    }, 950 + seq.length * 580);
  };

  useEffect(() => {
    if (reward) return;
    if (mode === 'xylophone') {
      say('Toque nas teclas coloridas para fazer música!');
    } else if (mode === 'simon') {
      playSimonSequence(simonSeq);
    } else if (animalQs[animalStep]) {
      say(animalQs[animalStep].spokenPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, animalStep]);

  const resetMode = (nextMode: MusicMode) => {
    clearAll();
    setMode(nextMode);
    setMood('happy');
    setFeedback('');
    setActiveKey(null);
    setReward(null);
    setWrongId(null);
    setLocked(false);

    if (nextMode === 'xylophone') {
      setGuideStep(0);
    } else if (nextMode === 'simon') {
      const nextSeq = createSimonSequence(simonLen);
      setSimonSeq(nextSeq);
      setSimonRound(0);
      setSimonUserIdx(0);
    } else {
      setAnimalQs(generateAnimalSoundQuestions(activeProfile.ageLevel, 4));
      setAnimalStep(0);
    }
  };

  const handleXylophoneTap = (idx: number) => {
    playMusicalNote(idx, state.audio.sfxEnabled);
    setActiveKey(idx);
    schedule(() => setActiveKey(null), 220);

    if (idx === MELODY_GUIDE[guideStep]) {
      const next = guideStep + 1;
      setGuideStep(next);
      setMood('excited');
      if (next >= MELODY_GUIDE.length) {
        recordCorrectAnswer('music-sounds');
        setFeedback('Você tocou Brilha, Brilha, Estrelinha!');
        schedule(() => {
          sfx('celebration');
          setReward(completeRound('music-sounds', 3));
        }, 700);
      }
    }
  };

  const handleSimonTap = (idx: number) => {
    if (simonPlaying || locked) return;
    playMusicalNote(idx, state.audio.sfxEnabled);
    setActiveKey(idx);
    schedule(() => setActiveKey(null), 220);

    if (idx === simonSeq[simonUserIdx]) {
      const nextIdx = simonUserIdx + 1;
      setSimonUserIdx(nextIdx);
      if (nextIdx >= simonSeq.length) {
        setLocked(true);
        setMood('excited');
        sfx('success');
        recordCorrectAnswer('music-sounds');
        const praise = pickRandom(CELEBRATE_PHRASES);
        setFeedback(praise);
        say(praise);

        const nextRound = simonRound + 1;
        setSimonRound(nextRound);
        schedule(() => {
          setLocked(false);
          if (nextRound >= 3) {
            sfx('celebration');
            setReward(completeRound('music-sounds', 3));
          } else {
            const nextSeq = createSimonSequence(simonLen);
            setSimonSeq(nextSeq);
            playSimonSequence(nextSeq);
          }
        }, 1200);
      }
    } else {
      sfx('encourage');
      setMood('encouraging');
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => playSimonSequence(simonSeq), 1400);
    }
  };

  const handleAnimalPick = (figId: string, name: string) => {
    if (locked || !animalQs[animalStep]) return;
    if (figId === animalQs[animalStep].target.id) {
      setLocked(true);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('music-sounds');
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(`${praise} É ${name.toLowerCase()}!`);
      say(praise);
      schedule(() => {
        if (animalStep + 1 >= animalQs.length) {
          sfx('celebration');
          setReward(completeRound('music-sounds', 3));
        } else {
          setAnimalStep((s) => s + 1);
          setMood('happy');
          setFeedback('');
          setLocked(false);
        }
      }, 1250);
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongId(figId);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongId(null), 480);
    }
  };

  const getPromptText = () => {
    if (mode === 'xylophone') return 'Toque nas teclas ou siga a estrelinha!';
    if (mode === 'simon') return 'Ouça e repita a melodia nas teclas!';
    return animalQs[animalStep]?.spokenPrompt || '';
  };

  const getSpokenPrompt = () => {
    if (mode === 'xylophone') return 'Toque nas teclas coloridas para fazer música!';
    return getPromptText();
  };

  const progressCurrent =
    mode === 'xylophone' ? guideStep : mode === 'simon' ? simonRound : animalStep;
  const progressTotal =
    mode === 'xylophone' ? MELODY_GUIDE.length : mode === 'simon' ? 3 : animalQs.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFEAF4] to-[#FFF9F0]">
      <ActivityHeader
        title="Música e Sons"
        currentStep={progressCurrent}
        totalSteps={progressTotal}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() =>
          mode === 'simon' ? playSimonSequence(simonSeq) : say(getSpokenPrompt())
        }
        accentColor="#F15BB5"
      />

      {/* Sub-mode tabs */}
      <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
        {[
          { id: 'xylophone' as MusicMode, label: 'Xilofone', icon: Music },
          { id: 'simon' as MusicMode, label: 'Melodia', icon: Sparkles },
          { id: 'animals' as MusicMode, label: 'Sons dos Bichos', icon: Volume2 },
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
                ? 'bg-[#F15BB5] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4 w-full max-w-xl bg-white rounded-3xl p-4 border-2 border-pink-100 card-3d">
          <LumiMascot mood={mood} size={74} />
          <p className="font-display text-lg sm:text-xl font-bold text-slate-800">
            {feedback || getPromptText()}
          </p>
        </div>

        {(mode === 'xylophone' || mode === 'simon') && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="flex items-end justify-center gap-2 sm:gap-3 w-full rounded-[32px] bg-white border-4 border-pink-100 p-4 sm:p-6 card-3d">
              {(mode === 'simon' ? XYLOPHONE_KEYS.slice(0, 5) : XYLOPHONE_KEYS).map((k, idx) => {
                const isLit = activeKey === idx;
                const isTarget = mode === 'xylophone' && MELODY_GUIDE[guideStep] === idx;
                return (
                  <button
                    key={k.note}
                    type="button"
                    disabled={mode === 'simon' && simonPlaying}
                    onClick={() =>
                      mode === 'xylophone' ? handleXylophoneTap(idx) : handleSimonTap(idx)
                    }
                    className={`btn-3d flex-1 min-w-[34px] ${k.heightClass} rounded-2xl sm:rounded-3xl flex flex-col items-center justify-between py-3 text-white font-display font-bold border-4 border-white transition-transform cursor-pointer ${
                      isLit ? 'scale-110 brightness-110 ring-4 ring-yellow-300' : ''
                    } ${isTarget ? 'ring-4 ring-amber-300' : ''}`}
                    style={{ backgroundColor: k.color }}
                  >
                    <span className="h-3 w-3 rounded-full bg-white/70" />
                    <span className="text-xs sm:text-base drop-shadow-xs">{k.note}</span>
                  </button>
                );
              })}
            </div>

            {mode === 'simon' && (
              <button
                type="button"
                disabled={simonPlaying}
                onClick={() => playSimonSequence(simonSeq)}
                className="btn-3d rounded-2xl bg-white border-2 border-pink-200 px-5 py-2.5 font-display font-bold text-pink-600 cursor-pointer disabled:opacity-50"
              >
                Ouvir Melodia Novamente
              </button>
            )}
          </div>
        )}

        {mode === 'animals' && animalQs[animalStep] && (
          <>
            <button
              type="button"
              onClick={() => say(animalQs[animalStep].spokenPrompt)}
              className="btn-3d flex items-center gap-3 rounded-[28px] bg-[#F15BB5] px-8 py-4 text-white border-4 border-white cursor-pointer"
            >
              <Volume2 className="h-8 w-8" />
              <span className="font-display text-2xl sm:text-3xl font-bold">
                {animalQs[animalStep].onomatopoeia}
              </span>
            </button>

            <div
              className={`grid w-full max-w-2xl gap-4 ${
                animalQs[animalStep].options.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {animalQs[animalStep].options.map((fig) => {
                const isShaking = wrongId === fig.id;
                const isRight = locked && fig.id === animalQs[animalStep].target.id;
                return (
                  <button
                    key={fig.id}
                    type="button"
                    disabled={locked}
                    onClick={() => handleAnimalPick(fig.id, fig.name)}
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-3xl p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-pink-100 hover:border-pink-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={fig.id} size={84} />
                    <span className="font-display text-base font-bold text-slate-700">
                      {fig.name}
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
