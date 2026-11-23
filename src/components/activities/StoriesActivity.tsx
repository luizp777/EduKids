import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  ListOrdered,
  Wand2,
  Volume2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, FIGURES } from '../../data/catalog';
import {
  INTERACTIVE_STORIES,
  STORY_BUILDER_HEROES,
  STORY_BUILDER_OBJECTS,
  STORY_BUILDER_PLACES,
  STORY_COMPREHENSION,
  STORY_SEQUENCES,
} from '../../data/storiesCatalog';
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

type StoriesMode = 'tales' | 'comprehension' | 'sequence' | 'builder';

/** 10º Pilar: Hora da História — Contos Interativos, Compreensão, Começo-Meio-Fim e Fábrica de Histórias. */
export const StoriesActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, isChallengeActive, recordCorrectAnswer, completeRound, say, sayClips, sfx } = useApp();
  const challengeMode = isChallengeActive('stories');
  const [mode, setMode] = useState<StoriesMode>('tales');

  // Mode 1: Interactive Tales
  const [storyIdx, setStoryIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);

  // Mode 2: Comprehension
  const [compQs, setCompQs] = useState(() => shuffle(STORY_COMPREHENSION).slice(0, 4));
  const [compStep, setCompStep] = useState(0);

  // Mode 3: Beginning / Middle / End
  const [seqQs, setSeqQs] = useState(() => shuffle(STORY_SEQUENCES).slice(0, 3));
  const [seqStep, setSeqStep] = useState(0);
  const [seqPicked, setSeqPicked] = useState<string[]>([]);

  // Mode 4: Story Builder
  const [heroId, setHeroId] = useState(STORY_BUILDER_HEROES[0].id);
  const [placeId, setPlaceId] = useState(STORY_BUILDER_PLACES[0].id);
  const [objId, setObjId] = useState(STORY_BUILDER_OBJECTS[0].id);
  const [storiesCreated, setStoriesCreated] = useState(0);

  const {
    mood,
    setMood,
    feedback,
    setFeedback,
    wrongId,
    setWrongAttempts,
    setManualHint,
    locked,
    setLocked,
    reward,
    setReward,
    showHint,
    schedule,
    resetFeedbackState: resetCommon,
    clearStepFeedback,
    requestManualHint,
    triggerWrongFeedback,
  } = useActivityFeedback({ say, sfx });

  const currentStory = INTERACTIVE_STORIES[storyIdx];
  const currentPage = currentStory.pages[pageIdx];
  const currentComp = compQs[compStep];
  const currentSeq = seqQs[seqStep];

  const compOptions = useMemo(() => {
    if (!currentComp) return [];
    const optCount = activeProfile.ageLevel === '3-4' && !challengeMode ? 3 : 4;
    const ids: FigureId[] = [
      currentComp.answerId,
      ...currentComp.distractorIds.slice(0, optCount - 1),
    ];
    return shuffle(
      ids.map((id) => FIGURES.find((f) => f.id === id) || FIGURES[0])
    );
  }, [currentComp, activeProfile.ageLevel, challengeMode]);

  const shuffledSeqSteps = useMemo(() => {
    if (!currentSeq) return [];
    const items = shuffle(currentSeq.steps);
    if (items.every((s, idx) => s.id === currentSeq.steps[idx].id)) {
      return [items[1], items[2], items[0]];
    }
    return items;
  }, [currentSeq]);

  const selectedHero = STORY_BUILDER_HEROES.find((h) => h.id === heroId) || STORY_BUILDER_HEROES[0];
  const selectedPlace = STORY_BUILDER_PLACES.find((p) => p.id === placeId) || STORY_BUILDER_PLACES[0];
  const selectedObj = STORY_BUILDER_OBJECTS.find((o) => o.id === objId) || STORY_BUILDER_OBJECTS[0];

  const currentStep =
    mode === 'tales'
      ? pageIdx
      : mode === 'comprehension'
        ? compStep
        : mode === 'sequence'
          ? seqStep
          : storiesCreated;

  const totalSteps =
    mode === 'tales'
      ? currentStory.pages.length
      : mode === 'comprehension'
        ? compQs.length
        : mode === 'sequence'
          ? seqQs.length
          : 2;

  const speakCurrent = () => {
    if (mode === 'tales' && currentPage) {
      sayClips([currentPage.clipId]);
    } else if (mode === 'comprehension' && currentComp) {
      sayClips([currentComp.clipId]);
    } else if (mode === 'sequence' && currentSeq) {
      sayClips([currentSeq.clipId]);
    } else if (mode === 'builder') {
      sayClips(['st-builder-prompt']);
    }
  };

  useEffect(() => {
    if (!reward) {
      speakCurrent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, storyIdx, pageIdx, compStep, seqStep, reward]);

  const switchMode = (next: StoriesMode) => {
    sfx('pop');
    resetCommon();
    setMode(next);
    if (next === 'tales') {
      setPageIdx(0);
    } else if (next === 'comprehension') {
      setCompQs(shuffle(STORY_COMPREHENSION).slice(0, 4));
      setCompStep(0);
    } else if (next === 'sequence') {
      setSeqQs(shuffle(STORY_SEQUENCES).slice(0, 3));
      setSeqStep(0);
      setSeqPicked([]);
    } else {
      setStoriesCreated(0);
    }
  };

  const handleTaleFigureTap = (figId: FigureId) => {
    if (locked || !currentPage) return;
    if (figId === currentPage.magicTargetId) {
      setLocked(true);
      setMood('excited');
      sfx('success');
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(praise);
      say(praise);
      recordCorrectAnswer('stories');

      schedule(() => {
        if (pageIdx + 1 >= currentStory.pages.length) {
          sfx('celebration');
          setReward(completeRound('stories', 3));
        } else {
          setPageIdx((p) => p + 1);
          clearStepFeedback();
        }
      }, 1100);
    } else {
      triggerWrongFeedback(figId, currentPage.magicPrompt);
    }
  };

  const handleCompSelect = (figId: FigureId) => {
    if (locked || !currentComp) return;
    if (figId === currentComp.answerId) {
      setLocked(true);
      setMood('excited');
      sfx('success');
      const fig = FIGURES.find((f) => f.id === figId);
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(`${praise} ${fig?.name || ''}!`);
      say(praise);
      recordCorrectAnswer('stories');

      schedule(() => {
        if (compStep + 1 >= compQs.length) {
          sfx('celebration');
          setReward(completeRound('stories', 3));
        } else {
          setCompStep((s) => s + 1);
          clearStepFeedback();
        }
      }, 1200);
    } else {
      triggerWrongFeedback(figId);
    }
  };

  const handleSeqSelect = (stepId: string) => {
    if (locked || !currentSeq || seqPicked.includes(stepId)) return;
    const expected = currentSeq.steps[seqPicked.length];
    if (stepId === expected.id) {
      sfx('success');
      const nextPicked = [...seqPicked, stepId];
      setSeqPicked(nextPicked);
      setWrongAttempts(0);
      setManualHint(false);

      if (nextPicked.length === currentSeq.steps.length) {
        setLocked(true);
        setMood('excited');
        const praise = pickRandom(CELEBRATE_PHRASES);
        setFeedback(praise);
        say(praise);
        recordCorrectAnswer('stories');

        schedule(() => {
          if (seqStep + 1 >= seqQs.length) {
            sfx('celebration');
            setReward(completeRound('stories', 3));
          } else {
            setSeqStep((s) => s + 1);
            setSeqPicked([]);
            clearStepFeedback();
          }
        }, 1200);
      }
    } else {
      triggerWrongFeedback(stepId);
    }
  };

  const handlePlayCustomStory = () => {
    if (locked) return;
    setLocked(true);
    setMood('excited');
    sfx('success');
    const storyText = `${selectedHero.label} ${selectedPlace.label} ${selectedObj.label}`;
    setFeedback(storyText);
    recordCorrectAnswer('stories');

    sayClips([selectedHero.clipId, selectedPlace.clipId, selectedObj.clipId], {
      onEnd: () => {
        const nextCount = storiesCreated + 1;
        setStoriesCreated(nextCount);
        if (nextCount >= 2) {
          schedule(() => {
            sfx('celebration');
            setReward(completeRound('stories', 3));
          }, 450);
        } else {
          setLocked(false);
        }
      },
    });
  };

  const handlePlayAgain = () => {
    resetCommon();
    if (mode === 'tales') {
      setStoryIdx((i) => (i + 1) % INTERACTIVE_STORIES.length);
      setPageIdx(0);
    } else if (mode === 'comprehension') {
      setCompQs(shuffle(STORY_COMPREHENSION).slice(0, 4));
      setCompStep(0);
    } else if (mode === 'sequence') {
      setSeqQs(shuffle(STORY_SEQUENCES).slice(0, 3));
      setSeqStep(0);
      setSeqPicked([]);
    } else {
      setStoriesCreated(0);
    }
  };

  const bannerText =
    feedback ||
    (mode === 'tales'
      ? currentPage?.text || ''
      : mode === 'comprehension'
        ? currentComp?.question || ''
        : mode === 'sequence'
          ? `${currentSeq?.title}: toque do começo até o fim!`
          : 'Monte sua própria história e toque em Ouvir!');

  return (
    <div className="activity-shell bg-gradient-to-b from-[#FCE7F3] via-[#F5F3FF] to-[#FFF9F0]">
      <ActivityHeader
        title="Hora da História"
        currentStep={currentStep}
        totalSteps={totalSteps}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={speakCurrent}
        onRequestHint={mode === 'builder' ? undefined : requestManualHint}
        hintActive={showHint}
        accentColor="#EC4899"
      />

      {/* Mode tabs */}
      <div className="activity-tabs activity-tabs-fade no-scrollbar snap-x">
        {[
          { id: 'tales' as const, label: 'Contos da Lumi', icon: BookOpen },
          { id: 'comprehension' as const, label: 'Perguntas', icon: HelpCircle },
          { id: 'sequence' as const, label: 'Começo, Meio e Fim', icon: ListOrdered },
          { id: 'builder' as const, label: 'Fábrica de Histórias', icon: Wand2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              onClick={(e) => {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                switchMode(tab.id);
              }}
              className={`btn-3d snap-start shrink-0 flex items-center gap-1.5 rounded-2xl px-3.5 py-2 font-display text-xs sm:text-sm font-bold cursor-pointer ${
                active
                  ? 'bg-[#EC4899] text-white'
                  : 'bg-white text-slate-600 border-2 border-pink-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <main className="activity-stage">
        <LumiPromptBanner
          mood={mood}
          text={bannerText}
          borderClass="border-pink-200"
          badge={
            mode === 'tales'
              ? `${pageIdx + 1}/${currentStory.pages.length}`
              : mode === 'builder'
                ? `${storiesCreated}/2`
                : undefined
          }
          badgeClass="bg-pink-100 text-pink-700"
          onTap={speakCurrent}
        />

        {/* MODE 1: INTERACTIVE TALES */}
        {mode === 'tales' && currentPage && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-3">
            {/* Story selector pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
              {INTERACTIVE_STORIES.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  aria-pressed={storyIdx === idx}
                  onClick={() => {
                    sfx('pop');
                    resetCommon();
                    setStoryIdx(idx);
                    setPageIdx(0);
                  }}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1 text-xs font-extrabold border-2 cursor-pointer transition-colors ${
                    storyIdx === idx
                      ? 'bg-[#9333EA] text-white border-[#9333EA]'
                      : 'bg-white text-slate-600 border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shrink-0">
                    <FigureSvg figureId={st.coverFigure} size={18} />
                  </span>
                  {st.title}
                </button>
              ))}
            </div>

            {/* Illustrated Story Book Card */}
            <div
              className={`w-full rounded-[28px] sm:rounded-[32px] bg-gradient-to-br ${currentPage.bgClass} border-4 border-white p-4 sm:p-6 card-3d flex flex-col items-center gap-4`}
            >
              <div className="flex items-center justify-center gap-4 sm:gap-7 flex-wrap py-2">
                {currentPage.sceneFigures.map((figId) => {
                  const isTarget = figId === currentPage.magicTargetId;
                  const isWrong = wrongId === figId;
                  const highlight = showHint && isTarget;
                  return (
                    <button
                      key={figId}
                      type="button"
                      onClick={() => handleTaleFigureTap(figId)}
                      className={`btn-3d relative flex flex-col items-center justify-center rounded-3xl bg-white/95 p-3 sm:p-4 border-4 cursor-pointer transition-transform ${
                        isWrong
                          ? 'border-rose-400 animate-gentle-shake'
                          : highlight
                            ? 'border-[#FFCA3A] ring-4 ring-amber-300 scale-105'
                            : 'border-white hover:scale-105'
                      }`}
                      aria-label={`Tocar em ${figId}`}
                    >
                      {highlight && (
                        <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFCA3A] text-[#5C4100] shadow">
                          <Sparkles className="h-4 w-4" />
                        </span>
                      )}
                      <FigureSvg figureId={figId} size={84} />
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-white/90 border-2 border-pink-200 px-4 py-2 text-center">
                <p className="font-display text-sm sm:text-base font-bold text-[#9333EA]">
                  {currentPage.magicPrompt}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: COMPREHENSION */}
        {mode === 'comprehension' && currentComp && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl">
            {compOptions.map((fig) => {
              const isAnswer = fig.id === currentComp.answerId;
              const isWrong = wrongId === fig.id;
              const highlight = showHint && isAnswer;
              return (
                <button
                  key={fig.id}
                  type="button"
                  onClick={() => handleCompSelect(fig.id)}
                  className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-3xl bg-white p-3.5 sm:p-5 border-4 cursor-pointer ${
                    isWrong
                      ? 'border-rose-400 bg-rose-50 animate-gentle-shake'
                      : highlight
                        ? 'border-[#FFCA3A] bg-[#FFF9DB] ring-4 ring-amber-200'
                        : 'border-pink-200 hover:border-pink-400'
                  }`}
                >
                  <FigureSvg figureId={fig.id} size={76} />
                  <span className="font-display text-sm sm:text-base font-bold text-slate-700">
                    {fig.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* MODE 3: BEGINNING, MIDDLE, END */}
        {mode === 'sequence' && currentSeq && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {currentSeq.steps.map((st, idx) => {
                const done = idx < seqPicked.length;
                return (
                  <div
                    key={st.id}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold border-2 ${
                      done
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : idx === seqPicked.length
                          ? 'bg-pink-100 border-pink-400 text-pink-800'
                          : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {idx === 0 ? 'Começo' : idx === 1 ? 'Meio' : 'Fim'}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
              {shuffledSeqSteps.map((st) => {
                const pickedIdx = seqPicked.indexOf(st.id);
                const isPicked = pickedIdx !== -1;
                const isExpected = currentSeq.steps[seqPicked.length]?.id === st.id;
                const highlight = showHint && isExpected && !isPicked;
                const isWrong = wrongId === st.id;

                return (
                  <button
                    key={st.id}
                    type="button"
                    disabled={isPicked}
                    onClick={() => handleSeqSelect(st.id)}
                    className={`btn-3d relative flex flex-col items-center justify-center gap-2 rounded-3xl p-3 sm:p-4 border-4 transition-all ${
                      isPicked
                        ? 'bg-emerald-50 border-emerald-400 opacity-80 cursor-default'
                        : isWrong
                          ? 'bg-rose-50 border-rose-400 animate-gentle-shake cursor-pointer'
                          : highlight
                            ? 'bg-[#FFF9DB] border-[#FFCA3A] ring-4 ring-amber-200 cursor-pointer'
                            : 'bg-white border-purple-200 hover:border-purple-400 cursor-pointer'
                    }`}
                  >
                    {isPicked && (
                      <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white font-display text-sm font-bold shadow">
                        {pickedIdx + 1}
                      </span>
                    )}
                    <FigureSvg figureId={st.figureId} size={68} />
                    <span className="font-display text-xs sm:text-sm font-bold text-slate-700 text-center">
                      {st.label.replace(/^\d+\.\s*/, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 4: STORY BUILDER */}
        {mode === 'builder' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-3">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full">
              {/* Column 1: Hero */}
              <div className="rounded-2xl bg-white/90 border-2 border-pink-200 p-2.5 flex flex-col gap-1.5">
                <div className="text-center text-[11px] font-extrabold uppercase text-pink-600">
                  1. Personagem
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {STORY_BUILDER_HEROES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        sfx('pop');
                        setHeroId(item.id);
                      }}
                      className={`flex flex-col items-center rounded-xl p-1.5 border-2 cursor-pointer ${
                        heroId === item.id
                          ? 'bg-pink-100 border-pink-500'
                          : 'bg-slate-50 border-transparent hover:border-pink-200'
                      }`}
                    >
                      <FigureSvg figureId={item.figureId} size={42} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 2: Place */}
              <div className="rounded-2xl bg-white/90 border-2 border-purple-200 p-2.5 flex flex-col gap-1.5">
                <div className="text-center text-[11px] font-extrabold uppercase text-purple-600">
                  2. Lugar
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {STORY_BUILDER_PLACES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        sfx('pop');
                        setPlaceId(item.id);
                      }}
                      className={`flex flex-col items-center rounded-xl p-1.5 border-2 cursor-pointer ${
                        placeId === item.id
                          ? 'bg-purple-100 border-purple-500'
                          : 'bg-slate-50 border-transparent hover:border-purple-200'
                      }`}
                    >
                      <FigureSvg figureId={item.figureId} size={42} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 3: Magic Object */}
              <div className="rounded-2xl bg-white/90 border-2 border-amber-200 p-2.5 flex flex-col gap-1.5">
                <div className="text-center text-[11px] font-extrabold uppercase text-amber-600">
                  3. Surpresa
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {STORY_BUILDER_OBJECTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        sfx('pop');
                        setObjId(item.id);
                      }}
                      className={`flex flex-col items-center rounded-xl p-1.5 border-2 cursor-pointer ${
                        objId === item.id
                          ? 'bg-amber-100 border-amber-500'
                          : 'bg-slate-50 border-transparent hover:border-amber-200'
                      }`}
                    >
                      <FigureSvg figureId={item.figureId} size={42} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview + Narrate button */}
            <div className="w-full rounded-3xl bg-white border-4 border-pink-200 p-3.5 sm:p-4 card-3d flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FigureSvg figureId={selectedHero.figureId} size={46} />
                <span className="font-display text-lg font-bold text-pink-400">+</span>
                <FigureSvg figureId={selectedPlace.figureId} size={46} />
                <span className="font-display text-lg font-bold text-purple-400">+</span>
                <FigureSvg figureId={selectedObj.figureId} size={46} />
              </div>
              <p className="flex-1 text-center sm:text-left font-display text-sm sm:text-base font-bold text-slate-700">
                {selectedHero.label} {selectedPlace.label} {selectedObj.label}
              </p>
              <button
                type="button"
                disabled={locked}
                onClick={handlePlayCustomStory}
                className="btn-3d shrink-0 flex items-center gap-2 rounded-2xl bg-[#EC4899] hover:bg-[#db2777] px-5 py-3 font-display text-base font-bold text-white cursor-pointer disabled:opacity-60"
              >
                <Volume2 className="h-5 w-5" />
                Ouvir História!
              </button>
            </div>
          </div>
        )}
      </main>

      {reward && (
        <CelebrationModal
          starsAwarded={reward.starsAwarded}
          newStickerId={reward.newStickerId}
          newGoldenStickerId={reward.newGoldenStickerId}
          onPlayAgain={handlePlayAgain}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
