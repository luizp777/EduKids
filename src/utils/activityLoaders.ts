import { lazy, type ComponentType } from 'react';
import type { PillarId } from '../types';

/** Propriedades comuns a todos os módulos de atividades carregados sob demanda. */
export interface ActivityComponentProps {
  /** Callback para retornar à tela inicial. */
  onBack: () => void;
}

type ActivityLoader = () => Promise<{ default: ComponentType<ActivityComponentProps> }>;

const PILLAR_LOADERS: Record<PillarId, ActivityLoader> = {
  literacy: () =>
    import('../components/activities/LiteracyActivity').then((m) => ({
      default: m.LiteracyActivity,
    })),
  math: () =>
    import('../components/activities/MathActivity').then((m) => ({
      default: m.MathActivity,
    })),
  'shapes-colors': () =>
    import('../components/activities/ShapesColorsActivity').then((m) => ({
      default: m.ShapesColorsActivity,
    })),
  'figures-logic': () =>
    import('../components/activities/FiguresLogicActivity').then((m) => ({
      default: m.FiguresLogicActivity,
    })),
  tracing: () =>
    import('../components/activities/TracingActivity').then((m) => ({
      default: m.TracingActivity,
    })),
  'music-sounds': () =>
    import('../components/activities/MusicSoundsActivity').then((m) => ({
      default: m.MusicSoundsActivity,
    })),
  'emotions-routine': () =>
    import('../components/activities/EmotionsRoutineActivity').then((m) => ({
      default: m.EmotionsRoutineActivity,
    })),
  'nature-habitats': () =>
    import('../components/activities/NatureHabitatsActivity').then((m) => ({
      default: m.NatureHabitatsActivity,
    })),
  languages: () =>
    import('../components/activities/LanguagesActivity').then((m) => ({
      default: m.LanguagesActivity,
    })),
  stories: () =>
    import('../components/activities/StoriesActivity').then((m) => ({
      default: m.StoriesActivity,
    })),
};

const prefetchedPillars = new Set<PillarId>();

/** Pré-carrega o chunk de um pilar específico sem montá-lo (idempotente). */
export function prefetchPillar(pillar: PillarId): void {
  if (prefetchedPillars.has(pillar)) return;
  prefetchedPillars.add(pillar);
  PILLAR_LOADERS[pillar]().catch(() => {
    prefetchedPillars.delete(pillar);
  });
}

/** Componentes lazy de cada um dos 10 pilares pedagógicos. */
export const LazyActivityByPillar: Record<PillarId, ComponentType<ActivityComponentProps>> = {
  literacy: lazy(PILLAR_LOADERS.literacy),
  math: lazy(PILLAR_LOADERS.math),
  'shapes-colors': lazy(PILLAR_LOADERS['shapes-colors']),
  'figures-logic': lazy(PILLAR_LOADERS['figures-logic']),
  tracing: lazy(PILLAR_LOADERS.tracing),
  'music-sounds': lazy(PILLAR_LOADERS['music-sounds']),
  'emotions-routine': lazy(PILLAR_LOADERS['emotions-routine']),
  'nature-habitats': lazy(PILLAR_LOADERS['nature-habitats']),
  languages: lazy(PILLAR_LOADERS.languages),
  stories: lazy(PILLAR_LOADERS.stories),
};

/** Página lazy do Álbum de Figurinhas, Acessórios da Lumi, Troféus e Galeria de Pinturas. */
export const LazyStickerAlbumPage = lazy(() =>
  import('../pages/StickerAlbumPage').then((m) => ({ default: m.StickerAlbumPage }))
);

/** Página lazy da Área dos Pais (perfis, áudio, tempo de tela, offline total e backup). */
export const LazyParentsDashboardPage = lazy(() =>
  import('../pages/ParentsDashboardPage').then((m) => ({ default: m.ParentsDashboardPage }))
);
