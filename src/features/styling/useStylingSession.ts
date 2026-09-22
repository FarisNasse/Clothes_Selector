import { useMemo, useReducer } from 'react';
import {
  evaluateOutfit,
  generateOutfits,
  type OutfitContext,
} from '@/features/recommendations/engine';
import {
  compatibleSwaps,
  initialStylingState,
  nextRecommendationIndex,
  stylingReducer,
} from './session';
import type { Garment } from '@/types/domain';
export function useStylingSession(
  wardrobe: Garment[],
  context: OutfitContext,
  anchorId?: string,
  initialIds?: string[],
) {
  const [state, dispatch] = useReducer(stylingReducer, null, () => ({
    ...initialStylingState(anchorId),
    overrideIds: initialIds ?? null,
  }));
  const recommendations = useMemo(
    () => generateOutfits({ wardrobe, ...context, lockedGarmentIds: state.lockedIds, limit: 8 }),
    [wardrobe, context, state.lockedIds],
  );
  const override = useMemo(() => {
    if (!state.overrideIds) return null;
    const items = state.overrideIds.map((id) => wardrobe.find((item) => item.id === id));
    return items.every((item): item is Garment => Boolean(item))
      ? evaluateOutfit(items, context)
      : null;
  }, [state.overrideIds, wardrobe, context]);
  const recommendation =
    override ?? recommendations[state.index % Math.max(recommendations.length, 1)] ?? null;
  const selected = recommendation?.garments.find((item) => item.id === state.selectedId) ?? null;
  const swaps = useMemo(
    () =>
      recommendation && selected
        ? compatibleSwaps(recommendation, selected.id, wardrobe, state.lockedIds, context)
        : [],
    [recommendation, selected, wardrobe, state.lockedIds, context],
  );
  const canChange = recommendations.some((item) => item.id !== recommendation?.id);
  function another(direction = 1) {
    if (!canChange) return;
    const current = recommendations.findIndex((item) => item.id === recommendation?.id);
    const next = nextRecommendationIndex(current, recommendations.length, direction);
    dispatch({ type: 'next', length: recommendations.length, direction: next - state.index });
  }
  return {
    state,
    dispatch,
    recommendations,
    recommendation,
    selected,
    swaps,
    canChange,
    another,
    reset: () => dispatch({ type: 'reset', ...(anchorId ? { anchorId } : {}) }),
    toggleLock: (id: string) => {
      if (recommendation)
        dispatch({
          type: 'lock',
          id,
          currentIds: recommendation.garments.map((item) => item.id),
          ...(anchorId ? { anchorId } : {}),
        });
    },
  };
}
