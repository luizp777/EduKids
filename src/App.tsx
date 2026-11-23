import React, { useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import type { PillarId } from './types';
import { stopSpeaking } from './utils/audio';
import { HomePage } from './pages/HomePage';
import { StickerAlbumPage } from './pages/StickerAlbumPage';
import { ParentsDashboardPage } from './pages/ParentsDashboardPage';
import { ParentalGateModal } from './components/ui/ParentalGateModal';
import { LiteracyActivity } from './components/activities/LiteracyActivity';
import { MathActivity } from './components/activities/MathActivity';
import { ShapesColorsActivity } from './components/activities/ShapesColorsActivity';
import { FiguresLogicActivity } from './components/activities/FiguresLogicActivity';
import { TracingActivity } from './components/activities/TracingActivity';
import { MusicSoundsActivity } from './components/activities/MusicSoundsActivity';
import { EmotionsRoutineActivity } from './components/activities/EmotionsRoutineActivity';
import { NatureHabitatsActivity } from './components/activities/NatureHabitatsActivity';

type View =
  | { type: 'home' }
  | { type: 'album' }
  | { type: 'parents' }
  | { type: 'activity'; pillar: PillarId };

const AppContent: React.FC = () => {
  const { activeProfile } = useApp();
  const [view, setView] = useState<View>({ type: 'home' });
  const [showParentalGate, setShowParentalGate] = useState(false);
  const activityKey = `${activeProfile.id}-${activeProfile.ageLevel}`;

  const navigateTo = useCallback((nextView: View) => {
    stopSpeaking();
    setView(nextView);
    if (typeof window !== 'undefined' && nextView.type !== 'home') {
      if (window.history.state?.edukidsView) {
        window.history.replaceState({ edukidsView: nextView }, '');
      } else {
        window.history.pushState({ edukidsView: nextView }, '');
      }
    }
  }, []);

  const goHome = useCallback(() => {
    stopSpeaking();
    if (typeof window !== 'undefined' && window.history.state?.edukidsView) {
      window.history.back();
      return;
    }
    setView({ type: 'home' });
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      stopSpeaking();
      setShowParentalGate(false);
      const next = e.state?.edukidsView as View | undefined;
      setView(next ?? { type: 'home' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <>
      {view.type === 'home' && (
        <HomePage
          onSelectPillar={(pillar) => navigateTo({ type: 'activity', pillar })}
          onOpenAlbum={() => navigateTo({ type: 'album' })}
          onRequestParents={() => setShowParentalGate(true)}
        />
      )}

      {view.type === 'album' && <StickerAlbumPage onBack={goHome} />}

      {view.type === 'parents' && <ParentsDashboardPage onBack={goHome} />}

      {view.type === 'activity' && view.pillar === 'literacy' && (
        <LiteracyActivity key={activityKey} onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'math' && (
        <MathActivity key={activityKey} onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'shapes-colors' && (
        <ShapesColorsActivity key={activityKey} onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'figures-logic' && (
        <FiguresLogicActivity key={activityKey} onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'tracing' && (
        <TracingActivity key={activityKey} onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'music-sounds' && (
        <MusicSoundsActivity key={activityKey} onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'emotions-routine' && (
        <EmotionsRoutineActivity key={activityKey} onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'nature-habitats' && (
        <NatureHabitatsActivity key={activityKey} onBack={goHome} />
      )}

      {showParentalGate && (
        <ParentalGateModal
          onSuccess={() => {
            setShowParentalGate(false);
            navigateTo({ type: 'parents' });
          }}
          onCancel={() => setShowParentalGate(false)}
        />
      )}
    </>
  );
};

export const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
