import React, { useState } from 'react';
import { AppProvider } from './state/AppContext';
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

type View =
  | { type: 'home' }
  | { type: 'album' }
  | { type: 'parents' }
  | { type: 'activity'; pillar: PillarId };

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>({ type: 'home' });
  const [showParentalGate, setShowParentalGate] = useState(false);

  const goHome = () => {
    stopSpeaking();
    setView({ type: 'home' });
  };

  return (
    <>
      {view.type === 'home' && (
        <HomePage
          onSelectPillar={(pillar) => setView({ type: 'activity', pillar })}
          onOpenAlbum={() => setView({ type: 'album' })}
          onRequestParents={() => setShowParentalGate(true)}
        />
      )}

      {view.type === 'album' && <StickerAlbumPage onBack={goHome} />}

      {view.type === 'parents' && <ParentsDashboardPage onBack={goHome} />}

      {view.type === 'activity' && view.pillar === 'literacy' && (
        <LiteracyActivity onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'math' && (
        <MathActivity onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'shapes-colors' && (
        <ShapesColorsActivity onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'figures-logic' && (
        <FiguresLogicActivity onBack={goHome} />
      )}
      {view.type === 'activity' && view.pillar === 'tracing' && (
        <TracingActivity onBack={goHome} />
      )}

      {showParentalGate && (
        <ParentalGateModal
          onSuccess={() => {
            setShowParentalGate(false);
            setView({ type: 'parents' });
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
