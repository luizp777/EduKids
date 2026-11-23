import React, { useEffect, useState } from 'react';
import { Music, Sparkles, Volume2, AudioWaveform, Play, Drum } from 'lucide-react';
import { useApp, type RoundReward } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES } from '../../data/catalog';
import {
  playAnimalSynthSound,
  playMusicalNote,
  playPitchSound,
  playRhythmBeat,
} from '../../utils/audio';
import { generateAnimalSoundQuestions, pickRandom, shuffle, type AnimalSoundQuestion } from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { LumiPromptBanner } from '../ui/LumiPromptBanner';
import { FigureSvg } from '../illustrations/FigureSvg';

interface Props {
  onBack: () => void;
}

type MusicMode = 'xylophone' | 'simon' | 'animals' | 'pitch' | 'rhythm';

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

const GUIDED_SONGS = [
  { id: 'brilha', title: 'Brilha, Brilha, Estrelinha', notes: [0, 0, 4, 4, 5, 5, 4] },
  { id: 'escala', title: 'Escala Dó-Ré-Mi', notes: [0, 1, 2, 3, 4, 5, 6, 7] },
  { id: 'balao', title: 'Cai, Cai, Balão', notes: [4, 4, 2, 4, 4, 2, 0] },
  { id: 'marcha', title: 'Marcha Soldado', notes: [0, 2, 4, 4, 2, 0, 4] },
];

interface PitchQuestion {
  kind: 'low' | 'high';
  label: string;
  figureId: 'elefante' | 'passaro';
  spokenPrompt: string;
}

function createPitchQuestions(count = 4): PitchQuestion[] {
  const pool: PitchQuestion[] = [
    {
      kind: 'low',
      label: 'Som Grave (Elefante)',
      figureId: 'elefante',
      spokenPrompt: 'Ouça o som! Ele é grave como o elefante ou agudo como o passarinho?',
    },
    {
      kind: 'high',
      label: 'Som Agudo (Pássaro)',
      figureId: 'passaro',
      spokenPrompt: 'Ouça o som! Ele é grave como o elefante ou agudo como o passarinho?',
    },
    {
      kind: 'low',
      label: 'Som Grave (Elefante)',
      figureId: 'elefante',
      spokenPrompt: 'Ouça com atenção! Esse som é grave ou agudo?',
    },
    {
      kind: 'high',
      label: 'Som Agudo (Pássaro)',
      figureId: 'passaro',
      spokenPrompt: 'Ouça com atenção! Esse som é grave ou agudo?',
    },
  ];
  return shuffle(pool).slice(0, count);
}

function createSimonSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * 5));
}

function createRhythmRounds(ageLevel: '3-4' | '5-6', count = 4): number[] {
  const pool = ageLevel === '3-4' ? [2, 3, 4, 2] : [2, 3, 4, 5];
  return shuffle(pool).slice(0, count);
}

/** Atividade de Música e Sons: Xilofone Mágico, Memória Musical, Sons dos Bichos, Grave/Agudo e Ritmo. */
export const MusicSoundsActivity: React.FC<Props> = ({ onBack }) => {
  const { state, activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [mode, setMode] = useState<MusicMode>('xylophone');
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const [reward, setReward] = useState<RoundReward | null>(null);
  const { schedule, clearAll } = useTimers();

  // Xylophone guided melody progress
  const [songIdx, setSongIdx] = useState(0);
  const [guideStep, setGuideStep] = useState(0);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const currentSong = GUIDED_SONGS[songIdx % GUIDED_SONGS.length];

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

  // Pitch (grave/agudo) state
  const [pitchQs, setPitchQs] = useState<PitchQuestion[]>(() => createPitchQuestions(4));
  const [pitchStep, setPitchStep] = useState(0);

  // Rhythm (batidas do tambor) state
  const [rhythmQs, setRhythmQs] = useState<number[]>(() =>
    createRhythmRounds(activeProfile.ageLevel, 4)
  );
  const [rhythmStep, setRhythmStep] = useState(0);
  const [rhythmPlaying, setRhythmPlaying] = useState(false);
  const [rhythmPulse, setRhythmPulse] = useState(false);

  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [manualHint, setManualHint] = useState(false);
  const [locked, setLocked] = useState(false);
  const showHint = (wrongAttempts >= 2 || manualHint) && !locked;

  const playRhythmPattern = (beats: number) => {
    clearAll();
    setRhythmPlaying(true);
    const stepMs = 460;
    for (let i = 0; i < beats; i++) {
      schedule(() => {
        setRhythmPulse(true);
        playRhythmBeat(state.audio.sfxEnabled);
        schedule(() => setRhythmPulse(false), 200);
      }, 200 + i * stepMs);
    }
    schedule(() => {
      setRhythmPlaying(false);
    }, 200 + beats * stepMs + 220);
  };

  const playSongDemo = () => {
    clearAll();
    setIsDemoPlaying(true);
    setFeedback(`Ouvindo: ${currentSong.title}!`);
    const stepMs = 480;
    currentSong.notes.forEach((noteIdx, i) => {
      schedule(() => {
        setActiveKey(noteIdx);
        playMusicalNote(noteIdx, state.audio.sfxEnabled);
        schedule(() => setActiveKey(null), 280);
      }, 150 + i * stepMs);
    });
    schedule(() => {
      setIsDemoPlaying(false);
      setFeedback('Sua vez! Siga a estrelinha nas teclas!');
    }, 150 + currentSong.notes.length * stepMs + 200);
  };

  const playSimonSequence = (seq: number[]) => {
    clearAll();
    setSimonPlaying(true);
    setSimonUserIdx(0);
    setFeedback('Ouça a melodia com atenção!');

    say('Ouça a melodia com atenção!', {
      onEnd: () => {
        const startDelay = 350;
        const stepMs = 620;

        seq.forEach((noteIdx, i) => {
          schedule(() => {
            setActiveKey(noteIdx);
            playMusicalNote(noteIdx, state.audio.sfxEnabled);
            schedule(() => setActiveKey(null), 350);
          }, startDelay + i * stepMs);
        });

        schedule(() => {
          setSimonPlaying(false);
          setFeedback('Agora é a sua vez! Repita a melodia!');
          say('Agora é a sua vez! Repita a melodia!');
        }, startDelay + seq.length * stepMs + 250);
      },
    });
  };

  useEffect(() => {
    if (reward) return;
    if (mode === 'xylophone') {
      say('Toque nas teclas coloridas para fazer música!');
    } else if (mode === 'simon') {
      playSimonSequence(simonSeq);
    } else if (mode === 'pitch' && pitchQs[pitchStep]) {
      say(pitchQs[pitchStep].spokenPrompt, {
        onEnd: () => {
          schedule(() => playPitchSound(pitchQs[pitchStep].kind, state.audio.sfxEnabled), 250);
        },
      });
    } else if (mode === 'rhythm' && rhythmQs[rhythmStep]) {
      say('Ouça as batidas do tambor! Quantas batidas você ouviu?', {
        onEnd: () => {
          schedule(() => playRhythmPattern(rhythmQs[rhythmStep]), 200);
        },
      });
    } else if (animalQs[animalStep]) {
      const targetId = animalQs[animalStep].target.id;
      say(animalQs[animalStep].spokenPrompt, {
        onEnd: () => {
          schedule(() => playAnimalSynthSound(targetId, state.audio.sfxEnabled), 180);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, animalStep, pitchStep, rhythmStep]);

  const resetMode = (nextMode: MusicMode) => {
    clearAll();
    setMode(nextMode);
    setMood('happy');
    setFeedback('');
    setActiveKey(null);
    setIsDemoPlaying(false);
    setReward(null);
    setWrongId(null);
    setWrongAttempts(0);
    setManualHint(false);
    setLocked(false);

    if (nextMode === 'xylophone') {
      setGuideStep(0);
    } else if (nextMode === 'simon') {
      const nextSeq = createSimonSequence(simonLen);
      setSimonSeq(nextSeq);
      setSimonRound(0);
      setSimonUserIdx(0);
    } else if (nextMode === 'pitch') {
      setPitchQs(createPitchQuestions(4));
      setPitchStep(0);
    } else if (nextMode === 'rhythm') {
      setRhythmQs(createRhythmRounds(activeProfile.ageLevel, 4));
      setRhythmStep(0);
    } else {
      setAnimalQs(generateAnimalSoundQuestions(activeProfile.ageLevel, 4));
      setAnimalStep(0);
    }
  };

  const handleXylophoneTap = (idx: number) => {
    if (isDemoPlaying) return;
    playMusicalNote(idx, state.audio.sfxEnabled);
    setActiveKey(idx);
    schedule(() => setActiveKey(null), 220);

    if (idx === currentSong.notes[guideStep]) {
      const next = guideStep + 1;
      setGuideStep(next);
      setMood('excited');
      if (next >= currentSong.notes.length) {
        recordCorrectAnswer('music-sounds');
        setFeedback(`Você tocou ${currentSong.title}!`);
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

        const nextRound = simonRound + 1;
        setSimonRound(nextRound);
        say(praise, {
          onEnd: () => {
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
            }, 400);
          },
        });
      }
    } else {
      sfx('encourage');
      setMood('encouraging');
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase, {
        onEnd: () => {
          schedule(() => playSimonSequence(simonSeq), 400);
        },
      });
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
      say(`${praise} ${name.toLowerCase()}!`);
      schedule(() => {
        if (animalStep + 1 >= animalQs.length) {
          sfx('celebration');
          setReward(completeRound('music-sounds', 3));
        } else {
          setAnimalStep((s) => s + 1);
          setMood('happy');
          setFeedback('');
          setWrongAttempts(0);
          setManualHint(false);
          setLocked(false);
        }
      }, 1250);
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongId(figId);
      setWrongAttempts((c) => c + 1);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongId(null), 480);
    }
  };

  const getPromptText = () => {
    if (mode === 'xylophone') return 'Toque nas teclas ou siga a estrelinha!';
    if (mode === 'simon') return 'Ouça e repita a melodia nas teclas!';
    if (mode === 'pitch') return 'Esse som é grave (elefante) ou agudo (pássaro)?';
    if (mode === 'rhythm') return 'Quantas batidas do tambor você ouviu?';
    return animalQs[animalStep]?.spokenPrompt || '';
  };

  const getSpokenPrompt = () => {
    if (mode === 'xylophone') return 'Toque nas teclas coloridas para fazer música!';
    if (mode === 'pitch') return pitchQs[pitchStep]?.spokenPrompt || '';
    if (mode === 'rhythm') return 'Ouça as batidas do tambor! Quantas batidas você ouviu?';
    return getPromptText();
  };

  const progressCurrent =
    mode === 'xylophone'
      ? guideStep
      : mode === 'simon'
        ? simonRound
        : mode === 'pitch'
          ? pitchStep
          : mode === 'rhythm'
            ? rhythmStep
            : animalStep;
  const progressTotal =
    mode === 'xylophone'
      ? currentSong.notes.length
      : mode === 'simon'
        ? 3
        : mode === 'pitch'
          ? pitchQs.length
          : mode === 'rhythm'
            ? rhythmQs.length
            : animalQs.length;

  return (
    <div className="activity-shell bg-gradient-to-b from-[#FFEAF4] to-[#FFF9F0]">
      <ActivityHeader
        title="Música e Sons"
        currentStep={progressCurrent}
        totalSteps={progressTotal}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() =>
          mode === 'simon'
            ? playSimonSequence(simonSeq)
            : mode === 'rhythm'
              ? playRhythmPattern(rhythmQs[rhythmStep])
              : say(getSpokenPrompt())
        }
        onRequestHint={
          mode === 'animals' || mode === 'pitch' || mode === 'rhythm'
            ? () => {
                sfx('pop');
                setManualHint(true);
              }
            : undefined
        }
        hintActive={showHint}
        accentColor="#F15BB5"
      />

      {/* Sub-mode tabs: horizontal scroll on phones, centered wrap on tablet/laptop */}
      <div className="activity-tabs activity-tabs-fade no-scrollbar snap-x">
        {[
          { id: 'xylophone' as MusicMode, label: 'Xilofone', icon: Music },
          { id: 'simon' as MusicMode, label: 'Melodia', icon: Sparkles },
          { id: 'animals' as MusicMode, label: 'Sons dos Bichos', icon: Volume2 },
          { id: 'pitch' as MusicMode, label: 'Grave ou Agudo', icon: AudioWaveform },
          { id: 'rhythm' as MusicMode, label: 'Ritmo', icon: Drum },
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
                ? 'bg-[#F15BB5] text-white'
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
          borderClass="border-pink-100"
          onTap={() => (mode === 'simon' ? playSimonSequence(simonSeq) : say(getSpokenPrompt()))}
        />

        {(mode === 'xylophone' || mode === 'simon') && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-4">
            {mode === 'xylophone' && (
              <div className="w-full flex flex-wrap items-center justify-center gap-1.5 px-1">
                {GUIDED_SONGS.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={idx === songIdx}
                    onClick={() => {
                      clearAll();
                      setIsDemoPlaying(false);
                      sfx('pop');
                      setSongIdx(idx);
                      setGuideStep(0);
                      setFeedback('');
                    }}
                    className={`shrink-0 rounded-xl px-3 py-1 font-display text-xs sm:text-sm font-bold border-2 cursor-pointer transition-colors ${
                      idx === songIdx
                        ? 'bg-[#FFE5F1] border-[#F15BB5] text-[#C9368C]'
                        : 'bg-white/80 border-pink-100 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={isDemoPlaying}
                  onClick={playSongDemo}
                  className="btn-3d shrink-0 flex items-center gap-1 rounded-xl bg-[#F15BB5] px-3 py-1 font-display text-xs sm:text-sm font-bold text-white cursor-pointer disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Ouvir Música
                </button>
              </div>
            )}

            <div className="flex items-end justify-center gap-1.5 sm:gap-3 w-full rounded-[28px] sm:rounded-[32px] bg-white border-4 border-pink-100 p-3 sm:p-6 card-3d">
              {(mode === 'simon' ? XYLOPHONE_KEYS.slice(0, 5) : XYLOPHONE_KEYS).map((k, idx) => {
                const isLit = activeKey === idx;
                const isTarget = mode === 'xylophone' && currentSong.notes[guideStep] === idx;
                return (
                  <button
                    key={k.note}
                    type="button"
                    disabled={mode === 'simon' && simonPlaying}
                    onClick={() =>
                      mode === 'xylophone' ? handleXylophoneTap(idx) : handleSimonTap(idx)
                    }
                    className={`btn-3d flex-1 min-w-[32px] ${k.heightClass} max-h-[36dvh] sm:max-h-none rounded-2xl sm:rounded-3xl flex flex-col items-center justify-between py-2.5 sm:py-3 text-white font-display font-bold border-3 sm:border-4 border-white transition-transform cursor-pointer ${
                      isLit ? 'scale-110 brightness-110 ring-4 ring-yellow-300' : ''
                    } ${isTarget ? 'ring-4 ring-amber-300' : ''}`}
                    style={{ backgroundColor: k.color }}
                  >
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/70" />
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
                className="btn-3d rounded-2xl bg-white border-2 border-pink-200 px-5 py-2 font-display text-sm sm:text-base font-bold text-pink-600 cursor-pointer disabled:opacity-50"
              >
                Ouvir Melodia Novamente
              </button>
            )}
          </div>
        )}

        {mode === 'animals' && animalQs[animalStep] && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => {
                playAnimalSynthSound(animalQs[animalStep].target.id, state.audio.sfxEnabled);
                schedule(() => say(animalQs[animalStep].spokenPrompt), 380);
              }}
              className="btn-3d flex items-center gap-3 rounded-[24px] sm:rounded-[28px] bg-[#F15BB5] px-6 py-3.5 sm:px-8 sm:py-4 text-white border-4 border-white cursor-pointer shrink-0"
            >
              <Volume2 className="h-7 w-7 sm:h-8 sm:w-8" />
              <span className="font-display text-xl sm:text-3xl font-bold">
                {animalQs[animalStep].onomatopoeia}
              </span>
            </button>

            <div
              className={`grid w-full max-w-2xl gap-2.5 sm:gap-4 ${
                animalQs[animalStep].options.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {animalQs[animalStep].options.map((fig) => {
                const isShaking = wrongId === fig.id;
                const isRight = locked && fig.id === animalQs[animalStep].target.id;
                const isHinted = showHint && fig.id === animalQs[animalStep].target.id;
                return (
                  <button
                    key={fig.id}
                    type="button"
                    disabled={locked}
                    onClick={() => handleAnimalPick(fig.id, fig.name)}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-pink-100 hover:border-pink-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={fig.id} size={66} className="sm:w-[84px] sm:h-[84px]" />
                    <span className="font-display text-xs sm:text-base font-bold text-slate-700 truncate max-w-full">
                      {fig.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {mode === 'pitch' && pitchQs[pitchStep] && (
          <div className="activity-split">
            <button
              type="button"
              onClick={() => playPitchSound(pitchQs[pitchStep].kind, state.audio.sfxEnabled)}
              className="btn-3d flex items-center gap-3 rounded-[24px] sm:rounded-[28px] bg-[#F15BB5] px-6 py-3.5 sm:px-8 sm:py-4 text-white border-4 border-white cursor-pointer shrink-0"
            >
              <AudioWaveform className="h-7 w-7 sm:h-8 sm:w-8" />
              <span className="font-display text-xl sm:text-3xl font-bold">
                Ouvir o Som
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              {[
                { kind: 'low' as const, label: 'Grave', sub: 'Elefante', fig: 'elefante' as const },
                { kind: 'high' as const, label: 'Agudo', sub: 'Passarinho', fig: 'passaro' as const },
              ].map((opt) => {
                const isShaking = wrongId === opt.kind;
                const isRight = locked && opt.kind === pitchQs[pitchStep].kind;
                const isHinted = showHint && opt.kind === pitchQs[pitchStep].kind;
                return (
                  <button
                    key={opt.kind}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (opt.kind === pitchQs[pitchStep].kind) {
                        setLocked(true);
                        setMood('excited');
                        sfx('success');
                        recordCorrectAnswer('music-sounds');
                        const praise = pickRandom(CELEBRATE_PHRASES);
                        setFeedback(`${praise} ${opt.label}!`);
                        say(praise);
                        schedule(() => {
                          if (pitchStep + 1 >= pitchQs.length) {
                            sfx('celebration');
                            setReward(completeRound('music-sounds', 3));
                          } else {
                            setPitchStep((s) => s + 1);
                            setMood('happy');
                            setFeedback('');
                            setWrongAttempts(0);
                            setManualHint(false);
                            setLocked(false);
                          }
                        }, 1150);
                      } else {
                        sfx('encourage');
                        setMood('encouraging');
                        setWrongId(opt.kind);
                        setWrongAttempts((c) => c + 1);
                        const phrase = pickRandom(ENCOURAGE_PHRASES);
                        setFeedback(phrase);
                        say(phrase);
                        schedule(() => setWrongId(null), 480);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-pink-100 hover:border-pink-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={opt.fig} size={68} className="sm:w-[86px] sm:h-[86px]" />
                    <span className="font-display text-lg sm:text-xl font-bold text-slate-800">
                      {opt.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {mode === 'rhythm' && rhythmQs[rhythmStep] && (
          <div className="activity-split">
            <button
              type="button"
              disabled={rhythmPlaying}
              onClick={() => playRhythmPattern(rhythmQs[rhythmStep])}
              className={`btn-3d flex flex-col items-center gap-2 rounded-[28px] bg-[#F15BB5] px-7 py-5 text-white border-4 border-white cursor-pointer shrink-0 transition-transform ${
                rhythmPulse ? 'scale-110 ring-4 ring-amber-300' : ''
              }`}
            >
              <Drum className="h-12 w-12 sm:h-14 sm:w-14" />
              <span className="font-display text-lg sm:text-2xl font-bold">
                {rhythmPlaying ? 'Ouvindo...' : 'Tocar Ritmo'}
              </span>
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-md">
              {(activeProfile.ageLevel === '3-4' ? [1, 2, 3, 4] : [2, 3, 4, 5]).map((count) => {
                const isShaking = wrongId === String(count);
                const isRight = locked && count === rhythmQs[rhythmStep];
                const isHinted = showHint && count === rhythmQs[rhythmStep];
                return (
                  <button
                    key={count}
                    type="button"
                    disabled={locked || rhythmPlaying}
                    onClick={() => {
                      if (count === rhythmQs[rhythmStep]) {
                        setLocked(true);
                        setMood('excited');
                        sfx('success');
                        recordCorrectAnswer('music-sounds');
                        const praise = pickRandom(CELEBRATE_PHRASES);
                        setFeedback(`${praise} São ${count} batidas!`);
                        say(`${praise} São ${count}!`);
                        schedule(() => {
                          if (rhythmStep + 1 >= rhythmQs.length) {
                            sfx('celebration');
                            setReward(completeRound('music-sounds', 3));
                          } else {
                            setRhythmStep((s) => s + 1);
                            setMood('happy');
                            setFeedback('');
                            setWrongAttempts(0);
                            setManualHint(false);
                            setLocked(false);
                          }
                        }, 1200);
                      } else {
                        sfx('encourage');
                        setMood('encouraging');
                        setWrongId(String(count));
                        setWrongAttempts((c) => c + 1);
                        const phrase = pickRandom(ENCOURAGE_PHRASES);
                        setFeedback(phrase);
                        say(phrase);
                        schedule(() => setWrongId(null), 480);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-2xl sm:rounded-3xl py-3.5 sm:py-5 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#6BCB77] border-[#3D9E49] text-white scale-105'
                        : isHinted
                          ? 'bg-amber-50 border-[#FFCA3A] text-[#A67800] ring-4 ring-amber-300/70 animate-pulse'
                          : 'bg-white border-pink-200 text-[#C9368C] hover:bg-pink-50'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <span className="font-display text-3xl sm:text-4xl font-bold">{count}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: count }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-2 rounded-full ${isRight ? 'bg-white' : 'bg-[#F15BB5]'}`}
                        />
                      ))}
                    </div>
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
