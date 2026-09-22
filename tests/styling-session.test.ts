import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateOutfit, generateOutfits, outfitKey } from '../src/features/recommendations/engine';
import {
  compatibleSwaps,
  initialStylingState,
  missingPieces,
  nextRecommendationIndex,
  stylingReducer,
} from '../src/features/styling/session';
import { demoStyleProfile, demoWardrobe } from '../src/fixtures/demoWardrobe';
import type { Garment } from '../src/types/domain';

const context = {
  occasion: 'dinner' as const,
  weather: { temperatureF: 65, precipitationProbability: 0, raining: false },
  styleProfile: demoStyleProfile,
  now: new Date('2026-08-14T12:00:00Z'),
};
const garment = (id: string) => {
  const item = demoWardrobe.find((g) => g.id === id);
  assert.ok(item);
  return item;
};

test('multiple locks survive generation, including a footwear lock with more than two alternatives', () => {
  const lockedGarmentIds = ['g-cream-knit-polo', 'g-charcoal-trousers'];
  const first = generateOutfits({
    ...context,
    wardrobe: demoWardrobe,
    lockedGarmentIds,
    limit: 12,
  });
  assert.ok(first.length > 2);
  const shoe = first[0]!.garments.find((g) => g.category === 'footwear')!;
  const results = generateOutfits({
    ...context,
    wardrobe: demoWardrobe,
    lockedGarmentIds: [...lockedGarmentIds, shoe.id],
    limit: 12,
  });
  assert.ok(results.length > 2);
  for (const result of results)
    for (const id of [...lockedGarmentIds, shoe.id])
      assert.ok(result.garments.some((g) => g.id === id));
  assert.equal(new Set(results.map((r) => r.id)).size, results.length);
});

test('missing and contradictory locks return no suggestions', () => {
  for (const lockedGarmentIds of [['deleted'], ['g-cream-knit-polo', 'g-white-oxford']]) {
    assert.deepEqual(generateOutfits({ ...context, wardrobe: demoWardrobe, lockedGarmentIds }), []);
  }
});

test('suits and accessories can be anchors without duplicate garment slots', () => {
  const suit: Garment = { ...garment('g-charcoal-trousers'), id: 'suit', category: 'suit' };
  const accessory: Garment = {
    ...garment('g-cream-knit-polo'),
    id: 'accessory',
    category: 'accessory',
  };
  const results = generateOutfits({
    ...context,
    wardrobe: [...demoWardrobe, suit, accessory],
    lockedGarmentIds: ['suit', 'accessory'],
  });
  assert.ok(results.length > 0);
  for (const result of results) {
    assert.ok(result.garments.includes(suit));
    assert.ok(result.garments.includes(accessory));
    assert.ok(!result.garments.some((g) => g.category === 'bottom' || g.category === 'outerwear'));
  }
});

test('swaps obey the same compatibility rules as generation and cannot replace locks', () => {
  const original = generateOutfits({ ...context, wardrobe: demoWardrobe })[0]!;
  const selected = original.garments.find((g) => g.category === 'top')!;
  const swaps = compatibleSwaps(original, selected.id, demoWardrobe, [], context);
  assert.ok(swaps.length > 0);
  for (const swap of swaps) {
    assert.equal(swap.garment.category, selected.category);
    assert.equal(swap.outfit.id, outfitKey(swap.outfit.garments.map((g) => g.id)));
    assert.deepEqual(swap.outfit, evaluateOutfit(swap.outfit.garments, context));
    assert.ok(!swap.outfit.garments.some((g) => g.id === selected.id));
  }
  assert.deepEqual(
    compatibleSwaps(original, selected.id, demoWardrobe, [selected.id], context),
    [],
  );
  assert.equal(evaluateOutfit([selected, selected], context), null);
  const hot = { ...garment('g-navy-harrington'), warmth: 9 };
  assert.equal(
    evaluateOutfit([...original.garments.filter((g) => g.category !== 'outerwear'), hot], {
      ...context,
      weather: { ...context.weather, temperatureF: 90 },
    }),
    null,
  );
});

test('styling state keeps anchors, rejects invalid swaps, undoes once, and clears undo on cycling', () => {
  let state = initialStylingState('anchor');
  const ids = ['anchor', 'bottom', 'shoes'];
  assert.equal(
    stylingReducer(state, { type: 'lock', id: 'anchor', currentIds: ids, anchorId: 'anchor' }),
    state,
  );
  state = stylingReducer(state, { type: 'lock', id: 'shoes', currentIds: ids });
  assert.deepEqual(state.lockedIds, ['anchor', 'shoes']);
  assert.equal(
    stylingReducer(state, { type: 'swap', ids: ['other', 'bottom', 'shoes'], previous: ids }),
    state,
  );
  assert.equal(
    stylingReducer(state, { type: 'swap', ids: ['anchor', 'shoes', 'shoes'], previous: ids }),
    state,
  );
  state = stylingReducer(state, {
    type: 'swap',
    ids: ['anchor', 'new-bottom', 'shoes'],
    previous: ids,
  });
  assert.deepEqual(state.undoIds, ids);
  state = stylingReducer(state, { type: 'undo' });
  assert.deepEqual(state.overrideIds, ids);
  assert.equal(state.undoIds, null);
  state = stylingReducer(state, { type: 'next', length: 3, direction: -1 });
  assert.equal(state.index, 2);
  assert.equal(state.overrideIds, null);
  assert.equal(state.undoIds, null);
  assert.deepEqual(state.lockedIds, ['anchor', 'shoes']);
  assert.equal(nextRecommendationIndex(2, 3), 0);
  assert.equal(nextRecommendationIndex(0, 0), 0);
});

test('large wardrobes produce bounded deterministic results', () => {
  const wardrobe = Array.from({ length: 25 }, (_, i) =>
    demoWardrobe.map((g) => ({ ...g, id: g.id + '-' + i })),
  ).flat();
  const first = generateOutfits({ ...context, wardrobe, limit: 12 });
  assert.equal(first.length, 12);
  assert.deepEqual(first, generateOutfits({ ...context, wardrobe, limit: 12 }));
  assert.equal(missingPieces([]), 'a top, trousers or a suit, shoes');
  assert.equal(missingPieces(demoWardrobe), '');
});

test('changing context clears selection, swaps and extra locks while retaining the style-this anchor', () => {
  let state = initialStylingState('anchor');
  state = stylingReducer(state, { type: 'select', id: 'bottom' });
  state = stylingReducer(state, {
    type: 'lock',
    id: 'shoes',
    currentIds: ['anchor', 'bottom', 'shoes'],
  });
  state = stylingReducer(state, {
    type: 'swap',
    ids: ['anchor', 'other-bottom', 'shoes'],
    previous: ['anchor', 'bottom', 'shoes'],
  });
  const reset = stylingReducer(state, { type: 'reset', anchorId: 'anchor' });
  assert.deepEqual(reset, initialStylingState('anchor'));
  assert.deepEqual(stylingReducer(state, { type: 'reset' }), initialStylingState());
});
