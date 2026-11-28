import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import type { PillarId } from './types';
import { stopSpeaking } from './utils/audio';
import {
  LazyActivityByPillar,
  LazyParentsDashboardPage,
  LazyStickerAlbumPage,
} from './utils/activityLoaders';
import { HomePage } from './pages/HomePage';
import { ParentalGateModal } from './components/ui/ParentalGateModal';
import { ScreenTimeBreakModal } from './components/ui/ScreenTimeBreakModal';
import { ActivityLoadingFallback } from './components/ui/ActivityLoadingFallback';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

type View =
  | { type: 'home' }
  | { type: 'album' }
  | { type: 'parents' }
  | { type: 'activity'; pillar: PillarId };

const AppContent: React.FC = () => {
  const {
    activeProfile,
    calmMode,
    screenTimeReached,
    addPlaySeconds,
    extendScreenTime,
    setTargetStickerId,
  } = useApp();
  const [view, setView] = useState<View>({ type: 'home' });
  const [gateReason, setGateReason] = useState<'parents' | 'screen-time' | null>(null);
  const activityKey = `${activeProfile.id}-${activeProfile.ageLevel}`;
  const viewResetKey =
    view.type === 'activity' ? `activity-${view.pillar}-${activityKey}` : `${view.type}-${activityKey}`;

  // Track active play time when in an activity
  useEffect(() => {
    if (view.type !== 'activity' || screenTimeReached) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        addPlaySeconds(5);
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [view.type, screenTimeReached, addPlaySeconds]);

  const navigateTo = useCallback(
    (nextView: View, targetStickerId: string | null = null) => {
      stopSpeaking();
      setTargetStickerId(nextView.type === 'activity' ? targetStickerId : null);
      setView(nextView);
      if (typeof window !== 'undefined' && nextView.type !== 'home') {
        if (window.history.state?.edukidsView) {
          window.history.replaceState({ edukidsView: nextView }, '');
        } else {
          window.history.pushState({ edukidsView: nextView }, '');
        }
      }
    },
    [setTargetStickerId]
  );

  const goHome = useCallback(() => {
    stopSpeaking();
    setTargetStickerId(null);
    if (typeof window !== 'undefined' && window.history.state?.edukidsView) {
      window.history.back();
      return;
    }
    setView({ type: 'home' });
  }, [setTargetStickerId]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      stopSpeaking();
      setTargetStickerId(null);
      setGateReason(null);
      const next = e.state?.edukidsView as View | undefined;
      setView(next ?? { type: 'home' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setTargetStickerId]);

  const ActiveActivity = view.type === 'activity' ? LazyActivityByPillar[view.pillar] : null;

  return (
    <div className={calmMode ? 'calm-mode' : undefined}>
      {view.type === 'home' && (
        <HomePage
          onSelectPillar={(pillar) => navigateTo({ type: 'activity', pillar })}
          onOpenAlbum={() => navigateTo({ type: 'album' })}
          onRequestParents={() => setGateReason('parents')}
        />
      )}

      {view.type !== 'home' && (
        <ErrorBoundary scope="activity" resetKey={viewResetKey} onGoHome={goHome}>
          <Suspense fallback={<ActivityLoadingFallback />}>
            {view.type === 'album' && (
              <LazyStickerAlbumPage
                onBack={goHome}
                onStartStickerExercise={(stickerId, pillar) =>
                  navigateTo({ type: 'activity', pillar }, stickerId)
                }
              />
            )}
            {view.type === 'parents' && <LazyParentsDashboardPage onBack={goHome} />}
            {view.type === 'activity' && ActiveActivity && (
              <ActiveActivity key={activityKey} onBack={goHome} />
            )}
          </Suspense>
        </ErrorBoundary>
      )}

      {screenTimeReached && view.type !== 'parents' && !gateReason && (
        <ScreenTimeBreakModal onRequestParentUnlock={() => setGateReason('screen-time')} />
      )}

      {gateReason && (
        <ParentalGateModal
          onSuccess={() => {
            const reason = gateReason;
            setGateReason(null);
            if (reason === 'screen-time') {
              extendScreenTime(15);
            } else {
              navigateTo({ type: 'parents' });
            }
          }}
          onCancel={() => setGateReason(null)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => (
  <ErrorBoundary scope="root">
    <AppProvider>
      <AppContent />
    </AppProvider>
  </ErrorBoundary>
);

export default App;
