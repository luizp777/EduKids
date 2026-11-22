import React, { useEffect, useState } from 'react';
import { Sparkles, Eye, Search, FolderKanban, Puzzle, Check, Link2 } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { CELEBRATE_PHRASES, ENCOURAGE_PHRASES, FIGURES } from '../../data/catalog';
import {
  generateAssociationQuestions,
  generateCategoryRound,
  generateOddOneOutQuestions,
  generateShadowQuestions,
  pickRandom,
  shuffle,
  type AssociationQuestion,
  type CategorySortRound,
  type OddOneOutQuestion,
  type ShadowQuestion,
} from '../../utils/gameGenerators';
import { useTimers } from '../../utils/useTimers';
import type { AgeLevel, FigureId, FigureItem, MascotMood } from '../../types';
import { ActivityHeader } from '../ui/ActivityHeader';
import { CelebrationModal } from '../ui/CelebrationModal';
import { FigureSvg } from '../illustrations/FigureSvg';
import { LumiMascot } from '../illustrations/LumiMascot';

interface Props {
  onBack: () => void;
}

type LogicMode = 'memory' | 'shadow' | 'odd' | 'category' | 'puzzle' | 'match';

interface MemoryCard {
  uid: string;
  figureId: FigureId;
  name: string;
}

function createMemoryDeck(pairCount: number): MemoryCard[] {
  const chosen = shuffle(FIGURES).slice(0, pairCount);
  const pairs: MemoryCard[] = [];
  chosen.forEach((f) => {
    pairs.push({ uid: `${f.id}-a`, figureId: f.id, name: f.name });
    pairs.push({ uid: `${f.id}-b`, figureId: f.id, name: f.name });
  });
  return shuffle(pairs);
}

interface PuzzleState {
  figure: FigureItem;
  cols: number;
  rows: number;
  order: number[]; // order[slotIndex] = originalPieceIndex
}

function createPuzzleState(ageLevel: AgeLevel): PuzzleState {
  const cols = ageLevel === '3-4' ? 2 : 3;
  const rows = 2;
  const total = cols * rows;
  const solved = Array.from({ length: total }, (_, i) => i);
  let order = shuffle(solved);
  if (order.every((v, i) => v === i)) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  const figure = pickRandom(FIGURES);
  return { figure, cols, rows, order };
}

function getPuzzleViewBox(pieceIdx: number, cols: number, rows: number): string {
  const col = pieceIdx % cols;
  const row = Math.floor(pieceIdx / cols);
  const w = 100 / cols;
  const h = 100 / rows;
  return `${(col * w).toFixed(2)} ${(row * h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
}

export const FiguresLogicActivity: React.FC<Props> = ({ onBack }) => {
  const { activeProfile, recordCorrectAnswer, completeRound, say, sfx } = useApp();
  const [mode, setMode] = useState<LogicMode>('memory');
  const [mood, setMood] = useState<MascotMood>('happy');
  const [feedback, setFeedback] = useState('');
  const [reward, setReward] = useState<{ starsAwarded: number; newStickerId: string | null } | null>(null);
  const { schedule, clearAll } = useTimers();

  // Memory state
  const pairCount = activeProfile.ageLevel === '3-4' ? 3 : 6;
  const [deck, setDeck] = useState<MemoryCard[]>(() => createMemoryDeck(pairCount));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<FigureId[]>([]);
  const [memoryLocked, setMemoryLocked] = useState(false);

  // Shadow state
  const [shadowQs, setShadowQs] = useState<ShadowQuestion[]>(() =>
    generateShadowQuestions(activeProfile.ageLevel, 4)
  );
  const [shadowStep, setShadowStep] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [stepLocked, setStepLocked] = useState(false);

  // Odd one out state
  const [oddQs, setOddQs] = useState<OddOneOutQuestion[]>(() =>
    generateOddOneOutQuestions(activeProfile.ageLevel, 4)
  );
  const [oddStep, setOddStep] = useState(0);

  // Category sort state
  const [catRound, setCatRound] = useState<CategorySortRound>(() =>
    generateCategoryRound(activeProfile.ageLevel)
  );
  const [catIndex, setCatIndex] = useState(0);

  // Jigsaw puzzle state
  const [puzzle, setPuzzle] = useState<PuzzleState>(() =>
    createPuzzleState(activeProfile.ageLevel)
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Association match state
  const [assocQs, setAssocQs] = useState<AssociationQuestion[]>(() =>
    generateAssociationQuestions(activeProfile.ageLevel, 4)
  );
  const [assocStep, setAssocStep] = useState(0);

  const getPrompt = () => {
    if (mode === 'memory') return 'Encontre os pares de figuras iguais!';
    if (mode === 'shadow') return 'De qual figura é esta sombra?';
    if (mode === 'odd') return 'Qual figura é diferente das outras?';
    if (mode === 'category') {
      const item = catRound.items[catIndex];
      return item
        ? `${item.name} pertence a qual grupo?`
        : 'Muito bem!';
    }
    if (mode === 'match') return assocQs[assocStep]?.spokenPrompt || '';
    return `Toque em duas peças para trocar e montar: ${puzzle.figure.name}!`;
  };

  useEffect(() => {
    if (!reward) say(getPrompt());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, shadowStep, oddStep, catIndex, assocStep, puzzle.figure.id]);

  const resetMode = (nextMode: LogicMode) => {
    clearAll();
    setMode(nextMode);
    setMood('happy');
    setFeedback('');
    setReward(null);
    setWrongId(null);
    setStepLocked(false);
    if (nextMode === 'memory') {
      setDeck(createMemoryDeck(pairCount));
      setFlipped([]);
      setMatchedPairs([]);
      setMemoryLocked(false);
    } else if (nextMode === 'shadow') {
      setShadowQs(generateShadowQuestions(activeProfile.ageLevel, 4));
      setShadowStep(0);
    } else if (nextMode === 'odd') {
      setOddQs(generateOddOneOutQuestions(activeProfile.ageLevel, 4));
      setOddStep(0);
    } else if (nextMode === 'category') {
      setCatRound(generateCategoryRound(activeProfile.ageLevel));
      setCatIndex(0);
    } else if (nextMode === 'match') {
      setAssocQs(generateAssociationQuestions(activeProfile.ageLevel, 4));
      setAssocStep(0);
    } else {
      setPuzzle(createPuzzleState(activeProfile.ageLevel));
      setSelectedSlot(null);
    }
  };

  const handleCardClick = (card: MemoryCard) => {
    if (memoryLocked) return;
    if (flipped.includes(card.uid) || matchedPairs.includes(card.figureId)) return;

    sfx('pop');
    const nextFlipped = [...flipped, card.uid];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryLocked(true);
      const first = deck.find((c) => c.uid === nextFlipped[0])!;
      const second = card;

      if (first.figureId === second.figureId) {
        const nextMatched = [...matchedPairs, first.figureId];
        setMatchedPairs(nextMatched);
        setMood('excited');
        sfx('success');
        recordCorrectAnswer('figures-logic');
        setFeedback(`Par encontrado: ${first.name}!`);
        say(`Par de ${first.name.toLowerCase()}!`);

        schedule(() => {
          setFlipped([]);
          setMemoryLocked(false);
          if (nextMatched.length >= pairCount) {
            sfx('celebration');
            setReward(completeRound('figures-logic', 3));
          }
        }, 650);
      } else {
        setMood('thinking');
        schedule(() => {
          setFlipped([]);
          setMemoryLocked(false);
          setMood('happy');
        }, 900);
      }
    }
  };

  const handleShadowPick = (figId: FigureId, figName: string) => {
    if (stepLocked) return;
    const current = shadowQs[shadowStep];
    if (figId === current.target.id) {
      setStepLocked(true);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('figures-logic');
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(`${praise} É ${figName.toLowerCase()}!`);
      say(`${praise} ${figName.toLowerCase()}!`);
      schedule(() => {
        if (shadowStep + 1 >= shadowQs.length) {
          sfx('celebration');
          setReward(completeRound('figures-logic', 3));
        } else {
          setShadowStep((s) => s + 1);
          setMood('happy');
          setFeedback('');
          setStepLocked(false);
        }
      }, 1200);
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

  const handleOddPick = (key: string, isOdd: boolean, name: string) => {
    if (stepLocked) return;
    if (isOdd) {
      setStepLocked(true);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('figures-logic');
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(`${praise} ${name} era diferente!`);
      say(`${praise}`);
      schedule(() => {
        if (oddStep + 1 >= oddQs.length) {
          sfx('celebration');
          setReward(completeRound('figures-logic', 3));
        } else {
          setOddStep((s) => s + 1);
          setMood('happy');
          setFeedback('');
          setStepLocked(false);
        }
      }, 1200);
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongId(key);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongId(null), 480);
    }
  };

  const handleCategoryPick = (groupId: string, groupLabel: string) => {
    if (stepLocked) return;
    const item = catRound.items[catIndex];
    if (!item) return;

    if (item.category === groupId) {
      setStepLocked(true);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('figures-logic');
      setFeedback(`Isso! ${item.name} vai em ${groupLabel}!`);
      say(`Isso! ${groupLabel}!`);
      schedule(() => {
        if (catIndex + 1 >= catRound.items.length) {
          sfx('celebration');
          setReward(completeRound('figures-logic', 3));
        } else {
          setCatIndex((i) => i + 1);
          setMood('happy');
          setFeedback('');
          setStepLocked(false);
        }
      }, 950);
    } else {
      sfx('encourage');
      setMood('encouraging');
      setWrongId(groupId);
      const phrase = pickRandom(ENCOURAGE_PHRASES);
      setFeedback(phrase);
      say(phrase);
      schedule(() => setWrongId(null), 480);
    }
  };

  const handlePuzzleSlotClick = (slotIdx: number) => {
    if (stepLocked) return;
    sfx('pop');
    if (selectedSlot === null) {
      setSelectedSlot(slotIdx);
      return;
    }
    if (selectedSlot === slotIdx) {
      setSelectedSlot(null);
      return;
    }

    const nextOrder = [...puzzle.order];
    [nextOrder[selectedSlot], nextOrder[slotIdx]] = [
      nextOrder[slotIdx],
      nextOrder[selectedSlot],
    ];
    setPuzzle({ ...puzzle, order: nextOrder });
    setSelectedSlot(null);

    const isSolved = nextOrder.every((piece, idx) => piece === idx);
    if (isSolved) {
      setStepLocked(true);
      setMood('excited');
      sfx('success');
      recordCorrectAnswer('figures-logic');
      const praise = pickRandom(CELEBRATE_PHRASES);
      setFeedback(`${praise} Você montou: ${puzzle.figure.name}!`);
      say(`${praise} Você montou ${puzzle.figure.name.toLowerCase()}!`);
      schedule(() => {
        sfx('celebration');
        setReward(completeRound('figures-logic', 3));
      }, 1100);
    }
  };

  const progressCurrent =
    mode === 'memory'
      ? matchedPairs.length
      : mode === 'shadow'
        ? shadowStep
        : mode === 'odd'
          ? oddStep
          : mode === 'category'
            ? catIndex
            : mode === 'match'
              ? assocStep
              : puzzle.order.filter((piece, idx) => piece === idx).length;

  const progressTotal =
    mode === 'memory'
      ? pairCount
      : mode === 'shadow'
        ? shadowQs.length
        : mode === 'odd'
          ? oddQs.length
          : mode === 'category'
            ? catRound.items.length
            : mode === 'match'
              ? assocQs.length
              : puzzle.order.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F5EEFF] to-[#FFF9F0]">
      <ActivityHeader
        title="Figuras e Lógica"
        currentStep={progressCurrent}
        totalSteps={progressTotal}
        stars={activeProfile.stars}
        onBack={onBack}
        onRepeatVoice={() => say(getPrompt())}
        accentColor="#9B5DE5"
      />

      {/* Sub-mode tabs */}
      <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
        {[
          { id: 'memory' as LogicMode, label: 'Memória', icon: Sparkles },
          { id: 'shadow' as LogicMode, label: 'Sombras', icon: Eye },
          { id: 'odd' as LogicMode, label: 'Diferente', icon: Search },
          { id: 'category' as LogicMode, label: 'Grupos', icon: FolderKanban },
          { id: 'puzzle' as LogicMode, label: 'Quebra-Cabeça', icon: Puzzle },
          { id: 'match' as LogicMode, label: 'Combinar', icon: Link2 },
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
                ? 'bg-[#9B5DE5] text-white'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-5">
        <div className="flex items-center gap-4 w-full max-w-xl bg-white rounded-3xl p-4 border-2 border-purple-100 card-3d">
          <LumiMascot mood={mood} size={74} />
          <p className="font-display text-lg sm:text-xl font-bold text-slate-800">
            {feedback || getPrompt()}
          </p>
        </div>

        {mode === 'memory' && (
          <div
            className={`grid gap-3 sm:gap-4 w-full max-w-xl ${
              pairCount === 3 ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'
            }`}
          >
            {deck.map((card) => {
              const isOpen =
                flipped.includes(card.uid) || matchedPairs.includes(card.figureId);
              const isMatched = matchedPairs.includes(card.figureId);
              return (
                <button
                  key={card.uid}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  className={`btn-3d aspect-square flex flex-col items-center justify-center rounded-3xl border-4 transition-all cursor-pointer ${
                    isMatched
                      ? 'bg-[#D3F9D8] border-[#52B788]'
                      : isOpen
                        ? 'bg-white border-[#9B5DE5]'
                        : 'bg-gradient-to-br from-[#9B5DE5] to-[#7235B8] border-white/60 hover:brightness-105'
                  }`}
                >
                  {isOpen ? (
                    <FigureSvg figureId={card.figureId} size={74} />
                  ) : (
                    <span className="font-display text-4xl font-bold text-white/90">?</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {mode === 'shadow' && shadowQs[shadowStep] && (
          <>
            <div className="flex h-40 w-40 items-center justify-center rounded-[32px] bg-white border-4 border-purple-200 card-3d">
              <FigureSvg
                figureId={shadowQs[shadowStep].target.id}
                size={115}
                silhouette={!stepLocked}
              />
            </div>

            <div
              className={`grid gap-4 w-full max-w-2xl ${
                shadowQs[shadowStep].options.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {shadowQs[shadowStep].options.map((fig) => {
                const isShaking = wrongId === fig.id;
                const isRight = stepLocked && fig.id === shadowQs[shadowStep].target.id;
                return (
                  <button
                    key={fig.id}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => handleShadowPick(fig.id, fig.name)}
                    className={`btn-3d flex flex-col items-center justify-center gap-1 rounded-3xl p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788]'
                        : 'bg-white border-purple-100 hover:border-purple-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={fig.id} size={82} />
                    <span className="font-display text-sm sm:text-base font-bold text-slate-700">
                      {fig.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === 'odd' && oddQs[oddStep] && (
          <div
            className={`grid gap-4 w-full max-w-xl ${
              oddQs[oddStep].items.length === 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {oddQs[oddStep].items.map((item) => {
              const isShaking = wrongId === item.key;
              const isRight = stepLocked && item.isOdd;
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={stepLocked}
                  onClick={() => handleOddPick(item.key, item.isOdd, item.figure.name)}
                  className={`btn-3d flex items-center justify-center rounded-3xl p-6 border-4 cursor-pointer ${
                    isRight
                      ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                      : 'bg-white border-purple-100 hover:border-purple-300'
                  } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                >
                  <FigureSvg figureId={item.figure.id} size={90} />
                </button>
              );
            })}
          </div>
        )}

        {mode === 'category' && catRound.items[catIndex] && (
          <div className="w-full max-w-xl flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 rounded-[32px] bg-white border-4 border-purple-200 px-10 py-5 card-3d">
              <FigureSvg figureId={catRound.items[catIndex].id} size={110} />
              <span className="font-display text-2xl font-bold text-slate-800">
                {catRound.items[catIndex].name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              {[catRound.groupA, catRound.groupB].map((group) => {
                const isShaking = wrongId === group.id;
                const isRight =
                  stepLocked && catRound.items[catIndex].category === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => handleCategoryPick(group.id, group.label)}
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-[28px] py-6 px-4 border-4 text-white cursor-pointer ${
                      isRight ? 'ring-4 ring-[#52B788] scale-105' : ''
                    } ${isShaking ? 'animate-gentle-shake' : ''}`}
                    style={{ backgroundColor: group.colorHex, borderColor: '#FFFFFF' }}
                  >
                    <span className="font-display text-2xl sm:text-3xl font-bold drop-shadow-xs">
                      {group.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'puzzle' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 border-2 border-purple-100 shadow-xs">
              <span className="text-xs font-extrabold uppercase text-purple-600">Modelo:</span>
              <FigureSvg figureId={puzzle.figure.id} size={46} />
              <span className="font-display font-bold text-slate-700">{puzzle.figure.name}</span>
            </div>

            <div
              className="grid gap-1.5 rounded-[28px] bg-purple-100 p-3 border-4 border-white shadow-xl"
              style={{
                gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
              }}
            >
              {puzzle.order.map((pieceIdx, slotIdx) => {
                const isSelected = selectedSlot === slotIdx;
                const isInRightPlace = pieceIdx === slotIdx;
                const vb = getPuzzleViewBox(pieceIdx, puzzle.cols, puzzle.rows);
                return (
                  <button
                    key={slotIdx}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => handlePuzzleSlotClick(slotIdx)}
                    className={`relative flex items-center justify-center rounded-2xl bg-white overflow-hidden border-4 transition-transform cursor-pointer ${
                      puzzle.cols === 2 ? 'h-32 w-32 sm:h-36 sm:w-36' : 'h-24 w-24 sm:h-28 sm:w-28'
                    } ${
                      isSelected
                        ? 'border-[#FFCA3A] scale-105 z-10 shadow-lg'
                        : isInRightPlace
                          ? 'border-[#52B788]'
                          : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <FigureSvg
                      figureId={puzzle.figure.id}
                      viewBox={vb}
                      size={puzzle.cols === 2 ? 132 : 102}
                    />
                    {isInRightPlace && (
                      <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#52B788] text-white">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'match' && assocQs[assocStep] && (
          <>
            <div className="flex flex-col items-center gap-2 rounded-[32px] bg-white border-4 border-purple-200 px-8 py-5 card-3d">
              <FigureSvg figureId={assocQs[assocStep].anchor.id} size={102} />
              <span className="font-display text-2xl font-bold text-purple-700">
                {assocQs[assocStep].anchor.name}
              </span>
            </div>

            <div
              className={`grid gap-4 w-full max-w-2xl ${
                assocQs[assocStep].options.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {assocQs[assocStep].options.map((fig) => {
                const isShaking = wrongId === fig.id;
                const isRight = stepLocked && fig.id === assocQs[assocStep].match.id;
                return (
                  <button
                    key={fig.id}
                    type="button"
                    disabled={stepLocked}
                    onClick={() => {
                      if (fig.id === assocQs[assocStep].match.id) {
                        setStepLocked(true);
                        setMood('excited');
                        sfx('success');
                        recordCorrectAnswer('figures-logic');
                        const praise = pickRandom(CELEBRATE_PHRASES);
                        setFeedback(`${praise} ${fig.name}!`);
                        say(praise);
                        schedule(() => {
                          if (assocStep + 1 >= assocQs.length) {
                            sfx('celebration');
                            setReward(completeRound('figures-logic', 3));
                          } else {
                            setAssocStep((s) => s + 1);
                            setMood('happy');
                            setFeedback('');
                            setStepLocked(false);
                          }
                        }, 1150);
                      } else {
                        sfx('encourage');
                        setMood('encouraging');
                        setWrongId(fig.id);
                        const phrase = pickRandom(ENCOURAGE_PHRASES);
                        setFeedback(phrase);
                        say(phrase);
                        schedule(() => setWrongId(null), 480);
                      }
                    }}
                    className={`btn-3d flex flex-col items-center justify-center gap-2 rounded-3xl p-4 border-4 cursor-pointer ${
                      isRight
                        ? 'bg-[#D3F9D8] border-[#52B788] scale-105'
                        : 'bg-white border-purple-100 hover:border-purple-300'
                    } ${isShaking ? 'animate-gentle-shake border-amber-300' : ''}`}
                  >
                    <FigureSvg figureId={fig.id} size={82} />
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
