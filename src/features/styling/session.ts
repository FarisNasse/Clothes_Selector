import { evaluateOutfit, type OutfitContext } from '@/features/recommendations/engine';
import type { Garment, OutfitRecommendation } from '@/types/domain';

export type StylingState = {
  index: number;
  lockedIds: string[];
  overrideIds: string[] | null;
  undoIds: string[] | null;
  selectedId: string | null;
};
export function initialStylingState(anchorId?: string): StylingState {
  return {
    index: 0,
    lockedIds: anchorId ? [anchorId] : [],
    overrideIds: null,
    undoIds: null,
    selectedId: null,
  };
}
export function nextRecommendationIndex(index: number, length: number, direction = 1) {
  return length > 0 ? (((index + direction) % length) + length) % length : 0;
}
export type StylingAction =
  | { type: 'reset'; anchorId?: string }
  | { type: 'next'; length: number; direction?: number }
  | { type: 'select'; id: string | null }
  | { type: 'lock'; id: string; currentIds: string[]; anchorId?: string }
  | { type: 'swap'; ids: string[]; previous: string[] }
  | { type: 'keep'; ids: string[] }
  | { type: 'undo' };
// Keep a committed outfit visible even when wear history changes its ranking.
export function stylingReducer(state: StylingState, action: StylingAction): StylingState {
  switch (action.type) {
    case 'keep':
      return { ...state, overrideIds: action.ids, undoIds: null };
    case 'reset':
      return initialStylingState(action.anchorId);
    case 'select':
      return { ...state, selectedId: action.id };
    case 'next':
      return {
        ...state,
        index: nextRecommendationIndex(state.index, action.length, action.direction),
        overrideIds: null,
        undoIds: null,
        selectedId: null,
      };
    case 'lock': {
      if (!action.currentIds.includes(action.id) || action.id === action.anchorId) return state;
      return {
        ...state,
        index: 0,
        overrideIds: action.currentIds,
        undoIds: null,
        lockedIds: state.lockedIds.includes(action.id)
          ? state.lockedIds.filter((id) => id !== action.id)
          : [...state.lockedIds, action.id],
      };
    }
    case 'swap':
      if (
        new Set(action.ids).size !== action.ids.length ||
        state.lockedIds.some((id) => !action.ids.includes(id))
      )
        return state;
      return { ...state, overrideIds: action.ids, undoIds: action.previous, selectedId: null };
    case 'undo':
      return state.undoIds ? { ...state, overrideIds: state.undoIds, undoIds: null } : state;
  }
}
export function compatibleSwaps(
  outfit: OutfitRecommendation,
  selectedId: string,
  wardrobe: Garment[],
  lockedIds: string[],
  context: OutfitContext,
) {
  const original = outfit.garments.find((item) => item.id === selectedId);
  if (!original || lockedIds.includes(selectedId)) return [];
  return wardrobe
    .filter((item) => item.id !== selectedId && item.category === original.category)
    .map((garment) => ({
      garment,
      outfit: evaluateOutfit(
        outfit.garments.map((item) => (item.id === selectedId ? garment : item)),
        context,
      ),
    }))
    .filter(
      (item): item is { garment: Garment; outfit: OutfitRecommendation } => item.outfit !== null,
    )
    .sort((a, b) => b.outfit.score - a.outfit.score || a.garment.id.localeCompare(b.garment.id));
}
export function missingPieces(wardrobe: Garment[]) {
  const categories = new Set(wardrobe.map((item) => item.category));
  return [
    !categories.has('top') && 'a top',
    !categories.has('bottom') && !categories.has('suit') && 'trousers or a suit',
    !categories.has('footwear') && 'shoes',
  ]
    .filter(Boolean)
    .join(', ');
}
